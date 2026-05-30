// 톡딜 전략 마스터 — 공통 타입 정의
// 계산 로직과 UI를 분리하기 위해 도메인 타입을 한곳에 모은다.

export type DealType = "만원딜" | "1+1딜" | "오늘의딜" | "오늘공구" | "미정";

export type PriceCompetitiveness = "low" | "medium" | "high";

/** 사용자 입력 폼 스키마 (지시서 §5) */
export type ProductInput = {
  productName: string;
  category: string;
  supplyCost: number; // 공급가(원)
  salePrice: number; // 판매가(원)
  shippingCost: number; // 배송비(원)
  optionInfo?: string;
  targetMargin?: number; // 목표 마진율(%)
  salesTarget?: number; // 목표 판매량(건)
  friendTarget?: number; // 목표 친구 수
  preferredDealType?: DealType;
  currentReviewCount?: number;
  currentRating?: number; // 0~5
  currentFriendCount?: number;
  freeShippingAvailable?: boolean;
  expectedStock?: number; // 출고 가능 수량
  expectedRevenue?: number; // 예상 판매액(원) — 목표 수익으로도 사용
  priceCompetitiveness?: PriceCompetitiveness;
};

/** 수익 계산 결과 (§6.1 / §6.2) */
export type ProfitResult = {
  label: string; // "일반판매" | "톡딜"
  salePrice: number;
  supplyCost: number;
  shippingCost: number;
  feeRate: number; // 수수료율 (0.033, 0.10)
  fee: number; // 수수료(원)
  netMargin: number; // 순마진(원)
  marginRate: number; // 마진율(%)
  /** 목표 수익 입력 시 목표 판매량 (순마진<=0 이면 null) */
  targetUnits: number | null;
  warnings: string[];
};

/** 블렌디드 오퍼 (§6.4) */
export type BlendedOffer = {
  name: string;
  price: number;
  cost: number; // 공급가
  shippingCost: number;
  attachRate: number; // 부착률 0~1
};

export type BlendedMarginResult = {
  offers: BlendedOffer[];
  blendedPrice: number;
  blendedCost: number;
  blendedFee: number;
  feeRate: number;
  netMargin: number;
  marginRate: number;
};

/** 톡딜 적합성 진단 (§7) */
export type FitCriterion = {
  key: string;
  label: string;
  score: number; // 획득 점수
  max: number; // 최대 점수
  reason: string;
};

export type FitGrade = "구조 보완 필요" | "가능성 있음" | "톡딜 적극 추천";

export type FitScoreResult = {
  criteria: FitCriterion[];
  totalScore: number;
  maxScore: number;
  grade: FitGrade;
  summary: string;
};

/** AI 상품 등급 (§8) */
export type GradeLetter = "S" | "A" | "B" | "C" | "D";

export type ProductGrade = {
  grade: GradeLetter;
  title: string; // 등급 설명
  description: string;
  reasons: string[];
};

/** 딜 유형 추천 (§9) */
export type DealCandidate = {
  type: DealType;
  recommended: boolean;
  matchedConditions: string[];
  unmetConditions: string[];
  rationale: string;
};

export type DealRecommendation = {
  primary: DealType;
  candidates: DealCandidate[];
  note: string;
};

/** 오늘공구 판단 (§10) */
export type GroupDealEvaluation = {
  conditions: { label: string; met: boolean; detail: string }[];
  metCount: number;
  verdict: "오늘공구 추천" | "보완 후 도전 가능" | "오늘공구 비추천";
  message: string;
};

/** 채널 성장 전략 (§11) */
export type ChannelStage = "0~500" | "500~2000" | "2000~5000" | "5000+";

export type ChannelStrategy = {
  currentFriends: number;
  stage: ChannelStage;
  tactics: string[];
  /** 판매 수량 기반 예상 친구 증가 (§15) */
  conversionRate: number;
  projectedNewFriends: number | null;
  nextStageGoal: string;
};

/** 메시지 캠페인 (§12) */
export type CampaignMessage = {
  step: number;
  stage: string; // "1차 쿠폰" 등
  purpose: string;
  title: string;
  body: string;
  cta: string;
};

export type MessageCampaign = {
  messages: CampaignMessage[];
};

/** 후기 확보 전략 (§13) */
export type ReviewStrategy = {
  bucket: "0~49" | "50~99" | "100~299" | "300+";
  currentReviewCount: number;
  tactics: string[];
  flow: string; // 후기 성장 흐름
  summary: string;
};

/** 재구매 구조 (§14) */
export type RepurchasePlan = {
  cycleDays: number;
  sendTiming: string;
  coupon: string;
  upsell: string;
  crossSell: string;
  redealDirection: string;
};

/** LTV (§16) */
export type LtvResult = {
  avgOrderNetMargin: number;
  annualPurchaseCount: number;
  ltv12m: number;
};

/** 실행 점수 입력 / 결과 (§17) */
export type ExecutionInput = {
  체험딜: number;
  친구쿠폰: number;
  공유설정: number;
  스토어보드: number;
  메시지: number;
  후기관리: number;
};

export type ExecutionScoreResult = {
  items: { label: string; score: number }[];
  index: number; // 평균
  verdict: "매우 우수" | "실행 가능" | "보완 필요" | "전략 재설계 필요";
};

/** 실행 체크리스트 항목 (§18 ④) */
export type ChecklistItem = {
  label: string;
  done: boolean;
  hint: string;
};

/** 전역 경고 (§22) */
export type StrategyWarning = {
  level: "error" | "warning";
  message: string;
};

/** 최종 전략 리포트 (§18) */
export type StrategyReport = {
  input: ProductInput;
  normalProfit: ProfitResult;
  talkDealProfit: ProfitResult;
  blendedMargin: BlendedMarginResult;
  fitScore: FitScoreResult;
  grade: ProductGrade;
  dealRecommendation: DealRecommendation;
  groupDeal: GroupDealEvaluation;
  channelStrategy: ChannelStrategy;
  messageCampaign: MessageCampaign;
  reviewStrategy: ReviewStrategy;
  repurchase: RepurchasePlan;
  ltv: LtvResult;
  checklist: ChecklistItem[];
  warnings: StrategyWarning[];
  summary: string;
};
