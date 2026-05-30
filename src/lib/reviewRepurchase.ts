// 후기 확보 전략 (§13) + 재구매 구조 설계 (§14)

import type { ProductInput, ReviewStrategy, RepurchasePlan } from "./types";
import { estimateRepeatScore } from "./calculations";

const REVIEW_FLOW = "체험딜 → 후기확보 → 오늘의딜 → 기획전 → 재딜";

export function generateReviewStrategy(input: ProductInput): ReviewStrategy {
  const reviews = input.currentReviewCount ?? 0;

  let bucket: ReviewStrategy["bucket"];
  let tactics: string[];
  let summary: string;

  if (reviews < 50) {
    bucket = "0~49";
    tactics = ["체험딜 우선", "후기 작성 쿠폰", "1+1 구성"];
    summary = "후기가 부족합니다. 체험딜과 후기 쿠폰으로 초기 후기를 빠르게 모으세요.";
  } else if (reviews < 100) {
    bucket = "50~99";
    tactics = ["오늘의딜 도전", "포토후기 이벤트", "친구추가 쿠폰 병행"];
    summary = "후기가 쌓이기 시작했습니다. 포토후기 이벤트로 질을 높이며 오늘의딜에 도전하세요.";
  } else if (reviews < 300) {
    bucket = "100~299";
    tactics = ["기획전/재딜", "메시지 리마케팅"];
    summary = "후기 신뢰도가 충분합니다. 기획전·재딜과 메시지 리마케팅으로 전환을 확대하세요.";
  } else {
    bucket = "300+";
    tactics = ["오늘공구 검토", "브랜드형 딜 확장"];
    summary = "후기 자산이 강력합니다. 오늘공구와 브랜드형 딜로 규모를 키우세요.";
  }

  return {
    bucket,
    currentReviewCount: reviews,
    tactics,
    flow: REVIEW_FLOW,
    summary,
  };
}

export function generateRepurchasePlan(input: ProductInput): RepurchasePlan {
  const repeat = estimateRepeatScore(input.category);

  // 반복구매성에 따른 예상 재구매 주기
  const cycleDays = repeat === 2 ? 30 : repeat === 1 ? 60 : 90;
  const firstSend = Math.max(7, Math.round(cycleDays * 0.7));
  const secondSend = Math.max(firstSend + 3, Math.round(cycleDays * 0.93));

  return {
    cycleDays,
    sendTiming: `구매 후 ${firstSend}일, ${secondSend}일`,
    coupon: "재구매 10% 할인 쿠폰",
    upsell: repeat >= 1 ? "대용량/정기 구성 옵션" : "프리미엄 업그레이드 옵션",
    crossSell: "관련 소모품 / 함께 쓰면 좋은 상품",
    redealDirection:
      repeat === 2
        ? "30~45일 주기 정기 재딜로 단골 구매 리듬을 고정"
        : repeat === 1
          ? "분기 단위 기획전형 재딜로 재방문 유도"
          : "신규 라인업과 묶은 크로스셀 재딜로 재구매 보완",
  };
}
