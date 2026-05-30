// 최종 전략 리포트 오케스트레이터 (§18) + 예외 처리(§22) + 실행 체크리스트(§18 ④)

import type {
  ProductInput,
  StrategyReport,
  StrategyWarning,
  ChecklistItem,
} from "./types";
import {
  calculateNormalProfit,
  calculateTalkDealProfit,
  calculateBlendedMargin,
  buildDefaultBlendedOffers,
  scoreTalkDealFit,
  evaluateGroupDeal,
  generateChannelStrategy,
  calculateLtv,
} from "./calculations";
import { gradeProduct } from "./scoring";
import { recommendDealType } from "./dealRecommendation";
import { generateMessageCampaign } from "./messageGenerator";
import {
  generateReviewStrategy,
  generateRepurchasePlan,
} from "./reviewRepurchase";

/** §22 예외 처리 — 입력 기반 경고 수집 */
export function collectWarnings(input: ProductInput): StrategyWarning[] {
  const warnings: StrategyWarning[] = [];

  if (input.supplyCost <= 0 || input.salePrice <= 0) {
    warnings.push({
      level: "error",
      message: "공급가 또는 판매가가 0 이하입니다. 올바른 금액을 입력하세요.",
    });
    // 금액이 비정상이면 이후 계산 경고는 의미가 없으므로 조기 반환
    return warnings;
  }

  const td = calculateTalkDealProfit(input);

  if (td.netMargin <= 0) {
    warnings.push({
      level: "error",
      message: "톡딜 순마진이 0원 이하입니다. 가격/원가 구조를 재설계해야 합니다.",
    });
  }

  // 배송비 포함 손익분기점 미달 (수수료 전 기준)
  if (input.salePrice <= input.supplyCost + input.shippingCost) {
    warnings.push({
      level: "error",
      message: "배송비 포함 시 손익분기점에 미달합니다. 판매가 또는 배송 정책을 조정하세요.",
    });
  }

  if (typeof input.targetMargin === "number" && td.marginRate < input.targetMargin) {
    warnings.push({
      level: "warning",
      message: `톡딜 마진율(${td.marginRate}%)이 목표 마진율(${input.targetMargin}%)보다 낮습니다.`,
    });
  }

  const reviews = input.currentReviewCount ?? 0;
  if (input.preferredDealType === "오늘공구" && reviews < 50) {
    warnings.push({
      level: "warning",
      message: "후기가 부족한데 오늘공구를 희망합니다. 체험딜/오늘의딜로 후기를 먼저 확보하세요.",
    });
  }

  if (input.preferredDealType === "오늘공구" && input.freeShippingAvailable !== true) {
    warnings.push({
      level: "warning",
      message: "무료배송이 불가능한데 오늘공구를 희망합니다. 오늘공구는 무료배송이 사실상 필수입니다.",
    });
  }

  if (input.preferredDealType === "만원딜" && input.salePrice > 10000) {
    warnings.push({
      level: "warning",
      message: "판매가가 10,000원을 초과하는데 만원딜을 희망합니다. 가격 조정 또는 다른 딜 유형을 검토하세요.",
    });
  }

  return warnings;
}

/** §18 ④ 실행 체크리스트 */
export function buildChecklist(input: ProductInput): ChecklistItem[] {
  const reviews = input.currentReviewCount ?? 0;
  const friends = input.currentFriendCount ?? 0;
  return [
    {
      label: "체험딜/만원딜로 첫 후기·친구 확보 시작",
      done: false,
      hint: reviews >= 50 ? "후기 기반이 있으니 오늘의딜과 병행 가능" : "후기 50개까지 우선 목표",
    },
    {
      label: "친구추가 쿠폰 설정",
      done: false,
      hint: "메시지 1차 쿠폰 금액과 동일하게 맞추기",
    },
    {
      label: "상품 상세페이지에 핵심 차별점·후기 배치",
      done: false,
      hint: "포토후기 상단 노출로 설득력 강화",
    },
    {
      label: "공유 이벤트 / 스토어보드 운영",
      done: false,
      hint: friends < 500 ? "초기 친구 확보의 핵심 채널" : "기획전 노출에 활용",
    },
    {
      label: "4단계 메시지 캠페인 발송 일정 등록",
      done: false,
      hint: "쿠폰 → 소개 → 긴급성 → 리마인드 순서",
    },
    {
      label: "재구매 쿠폰·리마인드 자동화 설정",
      done: false,
      hint: "구매 후 재구매 주기에 맞춰 발송",
    },
  ];
}

function buildSummary(report: Omit<StrategyReport, "summary">): string {
  const { input, grade, fitScore, talkDealProfit, dealRecommendation, groupDeal } =
    report;
  const name = input.productName?.trim() || "이 상품";
  return [
    `${name}의 상품 등급은 ${grade.grade}(${grade.title})입니다.`,
    `톡딜 적합성은 ${fitScore.totalScore}/${fitScore.maxScore}점 — ${fitScore.grade}.`,
    `톡딜 순마진 ${talkDealProfit.netMargin.toLocaleString()}원(마진율 ${talkDealProfit.marginRate}%).`,
    `추천 딜 유형은 ${dealRecommendation.primary}, 오늘공구는 ${groupDeal.verdict}.`,
    "핵심은 상품 판매가 아니라 채널 친구를 확보하는 구조 설계입니다: 톡딜 → 채널친구 → 메시지 → 재구매 → 브랜드.",
  ].join(" ");
}

/** 입력 한 건으로 전체 전략 리포트를 생성 */
export function buildStrategyReport(input: ProductInput): StrategyReport {
  const normalProfit = calculateNormalProfit(input);
  const talkDealProfit = calculateTalkDealProfit(input);
  const blendedMargin = calculateBlendedMargin(buildDefaultBlendedOffers(input));
  const fitScore = scoreTalkDealFit(input);
  const grade = gradeProduct(input, fitScore);
  const dealRecommendation = recommendDealType(input, fitScore);
  const groupDeal = evaluateGroupDeal(input);
  const channelStrategy = generateChannelStrategy(input);
  const messageCampaign = generateMessageCampaign(input);
  const reviewStrategy = generateReviewStrategy(input);
  const repurchase = generateRepurchasePlan(input);
  const ltv = calculateLtv(input, talkDealProfit.netMargin);
  const checklist = buildChecklist(input);
  const warnings = collectWarnings(input);

  const partial = {
    input,
    normalProfit,
    talkDealProfit,
    blendedMargin,
    fitScore,
    grade,
    dealRecommendation,
    groupDeal,
    channelStrategy,
    messageCampaign,
    reviewStrategy,
    repurchase,
    ltv,
    checklist,
    warnings,
  };

  return { ...partial, summary: buildSummary(partial) };
}
