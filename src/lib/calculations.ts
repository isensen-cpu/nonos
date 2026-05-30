// 수익성 / 블렌디드 마진 / 적합성 / 오늘공구 / 채널 / LTV 계산 (지시서 §6,§7,§10,§11,§15,§16)
// 모든 금액은 정수(원). 부동소수 누적을 줄이기 위해 결과는 Math.round 처리한다.

import type {
  ProductInput,
  ProfitResult,
  BlendedOffer,
  BlendedMarginResult,
  FitScoreResult,
  FitCriterion,
  FitGrade,
  GroupDealEvaluation,
  ChannelStrategy,
  ChannelStage,
  LtvResult,
} from "./types";

/** 수수료율 상수 */
export const NORMAL_FEE_RATE = 0.033; // 일반판매 3.3%
export const TALKDEAL_FEE_RATE = 0.1; // 톡딜 10%
export const FRIEND_CONVERSION_RATE = 0.35; // 친구 전환율 35% (§15)
export const DEFAULT_ANNUAL_PURCHASE = 2.5; // 연간 예상 구매 횟수 (§16)

const won = (n: number) => Math.round(n);

/** 공통 수익 계산기 */
function calcProfit(
  label: string,
  input: ProductInput,
  feeRate: number,
): ProfitResult {
  const { salePrice, supplyCost, shippingCost } = input;
  const fee = won(salePrice * feeRate);
  const netMargin = won(salePrice - supplyCost - shippingCost - fee);
  const marginRate = salePrice > 0 ? (netMargin / salePrice) * 100 : 0;

  const warnings: string[] = [];
  if (netMargin <= 0) {
    warnings.push(`${label} 순마진이 0원 이하입니다. 가격/원가 구조를 재설계해야 합니다.`);
  }

  // 목표 수익(expectedRevenue)이 입력된 경우 목표 판매량 계산 (§6.3)
  let targetUnits: number | null = null;
  const targetRevenue = input.expectedRevenue;
  if (typeof targetRevenue === "number" && targetRevenue > 0) {
    if (netMargin > 0) {
      targetUnits = Math.ceil(targetRevenue / netMargin);
    } else {
      warnings.push("순마진이 0 이하라 목표 판매량을 계산할 수 없습니다.");
    }
  }

  return {
    label,
    salePrice,
    supplyCost,
    shippingCost,
    feeRate,
    fee,
    netMargin,
    marginRate: Math.round(marginRate * 10) / 10,
    targetUnits,
    warnings,
  };
}

/** §6.1 일반판매 수익 */
export function calculateNormalProfit(input: ProductInput): ProfitResult {
  return calcProfit("일반판매", input, NORMAL_FEE_RATE);
}

/** §6.2 톡딜 수익 */
export function calculateTalkDealProfit(input: ProductInput): ProfitResult {
  return calcProfit("톡딜", input, TALKDEAL_FEE_RATE);
}

/** §6.4 블렌디드 마진 (체험딜+본품+업셀 조합) */
export function calculateBlendedMargin(
  offers: BlendedOffer[],
  feeRate: number = TALKDEAL_FEE_RATE,
): BlendedMarginResult {
  const blendedPrice = won(
    offers.reduce((sum, o) => sum + o.price * o.attachRate, 0),
  );
  const blendedCost = won(
    offers.reduce((sum, o) => sum + (o.cost + o.shippingCost) * o.attachRate, 0),
  );
  const blendedFee = won(blendedPrice * feeRate);
  const netMargin = won(blendedPrice - blendedCost - blendedFee);
  const marginRate =
    blendedPrice > 0 ? Math.round((netMargin / blendedPrice) * 1000) / 10 : 0;

  return {
    offers,
    blendedPrice,
    blendedCost,
    blendedFee,
    feeRate,
    netMargin,
    marginRate,
  };
}

/** 입력으로부터 기본 블렌디드 오퍼 구성(체험딜→본품→업셀) */
export function buildDefaultBlendedOffers(input: ProductInput): BlendedOffer[] {
  const base = input.salePrice || 0;
  const baseCost = input.supplyCost || 0;
  const ship = input.shippingCost || 0;
  return [
    {
      name: `체험딜(${input.productName || "상품"})`,
      price: Math.max(0, won(base * 0.7)),
      cost: baseCost,
      shippingCost: ship,
      attachRate: 1,
    },
    {
      name: `본품(${input.productName || "상품"})`,
      price: base,
      cost: baseCost,
      shippingCost: ship,
      attachRate: 0.4,
    },
    {
      name: "업셀(대용량/세트)",
      price: won(base * 1.8),
      cost: won(baseCost * 1.6),
      shippingCost: ship,
      attachRate: 0.2,
    },
  ];
}

/** §7 톡딜 적합성 진단 (항목별 0~2점, 총 14점 만점) */
export function scoreTalkDealFit(input: ProductInput): FitScoreResult {
  const criteria: FitCriterion[] = [];

  // 1. 상품 경쟁력 (가격 경쟁력 기반)
  {
    const c = input.priceCompetitiveness;
    const score = c === "high" ? 2 : c === "medium" ? 1 : 0;
    criteria.push({
      key: "competitiveness",
      label: "상품 경쟁력",
      score,
      max: 2,
      reason:
        c === "high"
          ? "가격 경쟁력이 높아 톡딜 노출 시 전환이 기대됩니다."
          : c === "medium"
            ? "가격 경쟁력은 보통입니다. 구성/혜택으로 보완하세요."
            : "가격 경쟁력이 낮습니다. 가격 또는 구성 재설계가 필요합니다.",
    });
  }

  // 2. 선물 수요 (카테고리 휴리스틱)
  {
    const giftKeywords = ["식품", "간식", "디저트", "뷰티", "화장품", "생활", "리빙", "건강", "선물", "잡화"];
    const cat = (input.category || "").toLowerCase();
    const hit = giftKeywords.some((k) => cat.includes(k.toLowerCase()));
    const score = hit ? 2 : cat ? 1 : 0;
    criteria.push({
      key: "gift",
      label: "선물 수요",
      score,
      max: 2,
      reason: hit
        ? "선물하기 수요가 있는 카테고리입니다. 카카오 선물 맥락과 잘 맞습니다."
        : cat
          ? "선물 수요는 보통입니다. 선물 메시지/포장 옵션을 검토하세요."
          : "카테고리 정보가 없어 선물 수요를 판단하기 어렵습니다.",
    });
  }

  // 3. 반복 구매 가능성 (카테고리 휴리스틱)
  {
    const score = estimateRepeatScore(input.category);
    criteria.push({
      key: "repeat",
      label: "반복 구매 가능성",
      score,
      max: 2,
      reason:
        score === 2
          ? "소모성/반복 구매가 강한 카테고리입니다. 재구매 설계 효과가 큽니다."
          : score === 1
            ? "반복 구매 가능성은 보통입니다. 재구매 쿠폰으로 유도하세요."
            : "반복 구매 가능성이 낮습니다. 크로스셀 구성으로 보완하세요.",
    });
  }

  // 4. 상세페이지 설득력 (후기/평점 기반 대용)
  {
    const reviews = input.currentReviewCount ?? 0;
    const rating = input.currentRating ?? 0;
    const score = reviews >= 100 || rating >= 4.5 ? 2 : reviews >= 30 || rating >= 4.0 ? 1 : 0;
    criteria.push({
      key: "detail",
      label: "상세페이지 설득력",
      score,
      max: 2,
      reason:
        score === 2
          ? "후기/평점이 충분해 상세페이지 신뢰도가 높습니다."
          : score === 1
            ? "후기/평점이 보통입니다. 포토후기로 설득력을 높이세요."
            : "후기/평점이 부족합니다. 체험딜로 후기를 먼저 확보하세요.",
    });
  }

  // 5. 마진 구조 (톡딜 마진율 기반)
  {
    const td = calculateTalkDealProfit(input);
    const r = td.marginRate;
    const score = r >= 25 ? 2 : r >= 10 ? 1 : 0;
    criteria.push({
      key: "margin",
      label: "마진 구조",
      score,
      max: 2,
      reason:
        score === 2
          ? `톡딜 마진율 ${r}%로 여유가 있어 쿠폰/혜택 운용이 가능합니다.`
          : score === 1
            ? `톡딜 마진율 ${r}%로 빠듯합니다. 블렌디드 구성으로 보완하세요.`
            : `톡딜 마진율 ${r}%로 위험합니다. 가격/원가 재설계가 필요합니다.`,
    });
  }

  // 6. 채널 활용 가능성 (현재 친구 수 기반)
  {
    const friends = input.currentFriendCount ?? 0;
    const score = friends >= 2000 ? 2 : friends >= 500 ? 1 : 0;
    criteria.push({
      key: "channel",
      label: "채널 활용 가능성",
      score,
      max: 2,
      reason:
        score === 2
          ? `채널 친구 ${friends.toLocaleString()}명으로 메시지 마케팅 자산이 충분합니다.`
          : score === 1
            ? `채널 친구 ${friends.toLocaleString()}명으로 메시지 캠페인을 시작할 수 있습니다.`
            : "채널 친구가 적어 우선 친구 확보(체험딜)가 필요합니다.",
    });
  }

  // 7. 이벤트 구성 능력 (무료배송 + 가격 경쟁력 대용)
  {
    const free = input.freeShippingAvailable ? 1 : 0;
    const comp = input.priceCompetitiveness === "high" ? 1 : 0;
    const score = free + comp;
    criteria.push({
      key: "event",
      label: "이벤트 구성 능력",
      score,
      max: 2,
      reason:
        score === 2
          ? "무료배송과 가격 경쟁력을 모두 갖춰 강한 이벤트 구성이 가능합니다."
          : score === 1
            ? "이벤트 구성 요소가 일부 갖춰졌습니다. 무료배송/혜택을 추가 검토하세요."
            : "무료배송·가격 경쟁력이 약해 이벤트 매력이 낮습니다.",
    });
  }

  const totalScore = criteria.reduce((s, c) => s + c.score, 0);
  const maxScore = criteria.reduce((s, c) => s + c.max, 0);

  let grade: FitGrade;
  let summary: string;
  if (totalScore <= 3) {
    grade = "구조 보완 필요";
    summary = "현재 구조로는 톡딜 성과가 제한적입니다. 가격·구성·후기를 먼저 보완하세요.";
  } else if (totalScore <= 5) {
    grade = "가능성 있음";
    summary = "톡딜 가능성이 있습니다. 약한 항목을 보완하면 성과를 기대할 수 있습니다.";
  } else {
    grade = "톡딜 적극 추천";
    summary = "톡딜에 적합한 구조입니다. 적극적으로 진행해 채널 친구를 확보하세요.";
  }

  return { criteria, totalScore, maxScore, grade, summary };
}

/** 카테고리 기반 반복 구매 점수 (0~2) */
export function estimateRepeatScore(category?: string): number {
  const cat = (category || "").toLowerCase();
  const high = ["식품", "간식", "커피", "건강", "영양", "생활", "소모품", "화장품", "뷰티", "반려", "기저귀", "세제"];
  const mid = ["의류", "패션", "리빙", "잡화", "주방", "문구"];
  if (high.some((k) => cat.includes(k.toLowerCase()))) return 2;
  if (mid.some((k) => cat.includes(k.toLowerCase()))) return 1;
  return 0;
}

/** §10 오늘공구 판단 */
export function evaluateGroupDeal(input: ProductInput): GroupDealEvaluation {
  const reviews = input.currentReviewCount ?? 0;
  const rating = input.currentRating ?? 0;
  const stock = input.expectedStock ?? 0;
  const revenue = input.expectedRevenue ?? 0;

  const cond1 = reviews >= 50 || rating >= 4.5;
  const cond2 = input.freeShippingAvailable === true;
  const cond3 = input.priceCompetitiveness === "high";
  const cond4 = stock >= 5000 || revenue >= 50_000_000;

  const conditions = [
    {
      label: "후기 50개 이상 또는 평점 4.5 이상",
      met: cond1,
      detail: `후기 ${reviews.toLocaleString()}개 / 평점 ${rating || "-"}`,
    },
    {
      label: "무료배송 가능",
      met: cond2,
      detail: input.freeShippingAvailable ? "무료배송 가능" : "무료배송 불가",
    },
    {
      label: "가격 경쟁력 high",
      met: cond3,
      detail: `현재: ${input.priceCompetitiveness ?? "미입력"}`,
    },
    {
      label: "출고 5,000개 이상 또는 예상 판매액 5,000만원 이상",
      met: cond4,
      detail: `출고 ${stock.toLocaleString()}개 / 예상 ${revenue.toLocaleString()}원`,
    },
  ];

  const metCount = conditions.filter((c) => c.met).length;

  let verdict: GroupDealEvaluation["verdict"];
  let message: string;
  if (metCount === 4) {
    verdict = "오늘공구 추천";
    message = "오늘공구 조건을 모두 충족합니다. 대량 출고 기반 오늘공구에 도전하세요.";
  } else if (metCount === 3) {
    verdict = "보완 후 도전 가능";
    message = "한 가지 조건만 보완하면 오늘공구에 도전할 수 있습니다.";
  } else {
    verdict = "오늘공구 비추천";
    message = "오늘공구보다 체험딜/오늘의딜로 후기·친구를 먼저 확보하세요.";
  }

  return { conditions, metCount, verdict, message };
}

/** §11 + §15 채널 성장 전략 */
export function generateChannelStrategy(input: ProductInput): ChannelStrategy {
  const currentFriends = input.currentFriendCount ?? input.friendTarget ?? 0;

  let stage: ChannelStage;
  let tactics: string[];
  let nextStageGoal: string;

  if (currentFriends < 500) {
    stage = "0~500";
    tactics = ["체험딜", "친구추가 쿠폰", "공유 이벤트"];
    nextStageGoal = "500명 돌파 → 메시지 캠페인 단계로 진입";
  } else if (currentFriends < 2000) {
    stage = "500~2000";
    tactics = ["메시지 캠페인", "후기 이벤트", "재구매 쿠폰"];
    nextStageGoal = "2,000명 돌파 → 기획전/세그먼트 단계로 진입";
  } else if (currentFriends < 5000) {
    stage = "2000~5000";
    tactics = ["기획전", "재딜", "세그먼트 메시지"];
    nextStageGoal = "5,000명 돌파 → 브랜드 전환 단계로 진입";
  } else {
    stage = "5000+";
    tactics = ["브랜드 전환", "자사몰 연결", "VIP 고객군 운영"];
    nextStageGoal = "브랜드/자사몰 전환으로 LTV 극대화";
  }

  // §15 예상 친구 증가 = 판매건수 × 전환율
  const salesUnits = input.salesTarget ?? null;
  const projectedNewFriends =
    salesUnits && salesUnits > 0
      ? Math.round(salesUnits * FRIEND_CONVERSION_RATE)
      : null;

  return {
    currentFriends,
    stage,
    tactics,
    conversionRate: FRIEND_CONVERSION_RATE,
    projectedNewFriends,
    nextStageGoal,
  };
}

/** §16 12개월 LTV */
export function calculateLtv(
  input: ProductInput,
  talkDealNetMargin: number,
): LtvResult {
  const repeat = estimateRepeatScore(input.category);
  // 반복구매성이 높으면 연간 구매 횟수를 상향
  const annualPurchaseCount =
    repeat === 2 ? 4 : repeat === 1 ? 3 : DEFAULT_ANNUAL_PURCHASE;
  const avg = Math.max(0, talkDealNetMargin);
  return {
    avgOrderNetMargin: avg,
    annualPurchaseCount,
    ltv12m: Math.round(avg * annualPurchaseCount),
  };
}
