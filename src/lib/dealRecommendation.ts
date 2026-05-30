// 딜 유형 추천 엔진 (§9) — 만원딜 / 1+1딜 / 오늘의딜 / 오늘공구

import type {
  ProductInput,
  FitScoreResult,
  DealRecommendation,
  DealCandidate,
  DealType,
} from "./types";
import {
  calculateTalkDealProfit,
  evaluateGroupDeal,
  estimateRepeatScore,
} from "./calculations";

type Rule = { label: string; met: boolean };

function summarize(rules: Rule[]): {
  matched: string[];
  unmet: string[];
  metCount: number;
} {
  const matched = rules.filter((r) => r.met).map((r) => r.label);
  const unmet = rules.filter((r) => !r.met).map((r) => r.label);
  return { matched, unmet, metCount: matched.length };
}

export function recommendDealType(
  input: ProductInput,
  fit: FitScoreResult,
): DealRecommendation {
  const reviews = input.currentReviewCount ?? 0;
  const rating = input.currentRating ?? 0;
  const td = calculateTalkDealProfit(input);
  const group = evaluateGroupDeal(input);
  const friends = input.currentFriendCount ?? 0;
  const isNewSeller = friends < 500 || reviews < 30;

  // 9.1 만원딜
  const manwonRules: Rule[] = [
    { label: "판매가 10,000원 이하", met: input.salePrice > 0 && input.salePrice <= 10000 },
    { label: "신규 셀러 / 채널 친구 확보 목적", met: isNewSeller },
    { label: "후기 부족(체험 목적)", met: reviews < 50 },
  ];

  // 9.2 1+1딜
  const onePlusRules: Rule[] = [
    { label: "재고 처리 필요(충분한 재고 보유)", met: (input.expectedStock ?? 0) >= 300 },
    { label: "후기 확보 목적", met: reviews < 100 },
    { label: "체감 혜택이 중요(반복/소모성 구성)", met: estimateRepeatScore(input.category) >= 1 },
  ];

  // 9.3 오늘의딜
  const todayRules: Rule[] = [
    { label: "검증된 상품(후기 50+ 또는 평점 4.0+)", met: reviews >= 50 || rating >= 4.0 },
    { label: "가격 경쟁력 보유", met: input.priceCompetitiveness === "high" || input.priceCompetitiveness === "medium" },
    { label: "마진율 일정 수준 이상(10% 이상)", met: td.marginRate >= 10 },
  ];

  // 9.4 오늘공구
  const groupRules: Rule[] = [
    { label: "대량 재고(5,000개 이상)", met: (input.expectedStock ?? 0) >= 5000 },
    { label: "강한 가격 경쟁력(high)", met: input.priceCompetitiveness === "high" },
    { label: "무료배송 가능", met: input.freeShippingAvailable === true },
    { label: "높은 후기/평점(후기 50+ 또는 평점 4.5+)", met: reviews >= 50 || rating >= 4.5 },
  ];

  const manwon = summarize(manwonRules);
  const onePlus = summarize(onePlusRules);
  const today = summarize(todayRules);
  const groupSum = summarize(groupRules);

  const candidates: DealCandidate[] = [
    {
      type: "만원딜",
      recommended: manwon.metCount >= 2,
      matchedConditions: manwon.matched,
      unmetConditions: manwon.unmet,
      rationale: "저단가·체험형으로 친구 추가와 첫 구매 전환을 노립니다.",
    },
    {
      type: "1+1딜",
      recommended: onePlus.metCount >= 2,
      matchedConditions: onePlus.matched,
      unmetConditions: onePlus.unmet,
      rationale: "체감 혜택을 키워 후기 확보와 재고 소진을 동시에 노립니다.",
    },
    {
      type: "오늘의딜",
      recommended: today.metCount >= 2,
      matchedConditions: today.matched,
      unmetConditions: today.unmet,
      rationale: "검증된 상품을 노출 극대화해 후기·채널 확보를 가속합니다.",
    },
    {
      type: "오늘공구",
      recommended: groupSum.metCount === 4,
      matchedConditions: groupSum.matched,
      unmetConditions: groupSum.unmet,
      rationale: "대량 재고·강한 가격 경쟁력 기반의 대량 출고 딜입니다.",
    },
  ];

  const primary = pickPrimary(candidates, input, fit, group.metCount);

  const note =
    input.preferredDealType && input.preferredDealType !== "미정"
      ? buildPreferenceNote(input, primary)
      : `적합성 ${fit.grade} · 톡딜 마진율 ${td.marginRate}% 기준으로 ${primary}을(를) 우선 추천합니다.`;

  return { primary, candidates, note };
}

function pickPrimary(
  candidates: DealCandidate[],
  input: ProductInput,
  fit: FitScoreResult,
  groupMetCount: number,
): DealType {
  // 오늘공구 4개 충족이면 최우선
  if (groupMetCount === 4) return "오늘공구";

  // 우선순위: 오늘의딜 > 1+1딜 > 만원딜 (검증/마진/체험 흐름) — 단, 추천된 것 중에서
  const order: DealType[] = ["오늘공구", "오늘의딜", "1+1딜", "만원딜"];
  const recommended = candidates.filter((c) => c.recommended);
  for (const t of order) {
    const found = recommended.find((c) => c.type === t);
    if (found) return found.type;
  }
  // 아무것도 강하게 추천되지 않으면 신규/저후기는 만원딜, 그 외 미정
  const reviews = input.currentReviewCount ?? 0;
  if (reviews < 50 || fit.totalScore <= 3) return "만원딜";
  return "미정";
}

function buildPreferenceNote(input: ProductInput, primary: DealType): string {
  const pref = input.preferredDealType;
  if (pref === primary) {
    return `희망하신 ${pref}이(가) 데이터 기준으로도 적합합니다. 그대로 진행하세요.`;
  }
  return `희망하신 ${pref}보다 현재 데이터 기준으로는 ${primary}이(가) 더 적합합니다. ${primary}로 시작해 ${pref}로 확장하는 흐름을 권장합니다.`;
}
