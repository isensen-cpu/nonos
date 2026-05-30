// 메시지 생성 엔진 (§12) — 4단계 캠페인(쿠폰 / 상품소개 / 긴급성 / 리마인드)

import type { ProductInput, MessageCampaign, CampaignMessage } from "./types";

const won = (n: number) => `${Math.round(n).toLocaleString()}원`;

/** 판매가에 비례한 친구추가 쿠폰 금액(원) — 최소 1,000 / 최대 5,000, 100원 단위 */
function couponAmount(salePrice: number): number {
  const raw = Math.round((salePrice * 0.1) / 100) * 100;
  return Math.max(1000, Math.min(5000, raw || 3000));
}

export function generateMessageCampaign(input: ProductInput): MessageCampaign {
  const name = input.productName?.trim() || "이 상품";
  const coupon = couponAmount(input.salePrice || 30000);
  const price = input.salePrice ? won(input.salePrice) : "특가";
  const free = input.freeShippingAvailable ? " (무료배송)" : "";

  const messages: CampaignMessage[] = [
    {
      step: 1,
      stage: "1차 · 쿠폰",
      purpose: "친구추가 유도 + 첫 구매 전환",
      title: `[혜택] 친구추가하고 ${won(coupon)} 쿠폰 받기`,
      body: `안녕하세요! 채널 친구만을 위한 혜택을 준비했어요.\n지금 친구추가하시면 즉시 사용 가능한 ${won(coupon)} 쿠폰을 드립니다.\n${name}을(를) 가장 저렴하게 만나보세요.`,
      cta: "친구추가하고 쿠폰 받기",
    },
    {
      step: 2,
      stage: "2차 · 상품 소개",
      purpose: "왜 사야 하는지 설득 + 핵심 차별점 전달",
      title: `[소개] ${name}, 왜 다를까요?`,
      body: `${name}을(를) 추천하는 이유를 정리했어요.\n· 검증된 품질과 후기\n· 부담 없는 가격 ${price}${free}\n${input.optionInfo ? `· 옵션: ${input.optionInfo}\n` : ""}쿠폰과 함께면 더 합리적입니다. 지금 확인해보세요.`,
      cta: "상품 자세히 보기",
    },
    {
      step: 3,
      stage: "3차 · 긴급성",
      purpose: "마감 임박 / 선착순 / 한정 수량",
      title: `[마감임박] ${name} 특가, 한정 수량 소진 중`,
      body: `많은 분들이 담아가고 계세요!\n${name} 톡딜 특가는 한정 수량/기간으로 진행됩니다.\n선착순 마감 전에 쿠폰까지 챙기세요. 놓치면 다음 기회를 기약해야 해요.`,
      cta: "마감 전에 구매하기",
    },
    {
      step: 4,
      stage: "4차 · 리마인드",
      purpose: "종료 D-1 / 장바구니·관심 고객 재자극",
      title: `[D-1] 내일이면 끝나요 — ${name} 마지막 안내`,
      body: `담아두고 아직 결제 안 하셨나요?\n${name} 특가가 내일 종료됩니다. 쿠폰도 함께 만료돼요.\n지금 결제하고 혜택을 마무리하세요. 다음 딜에서 또 만나요!`,
      cta: "마지막으로 구매하기",
    },
  ];

  return { messages };
}
