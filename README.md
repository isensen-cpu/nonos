# 톡딜 전략 마스터 (Talkdeal Strategy Master)

카카오톡딜 판매자를 위한 **관계형 커머스 전략 SaaS MVP**입니다.
상품 정보를 입력하면 톡딜 적합성·수익성·딜 추천·채널 성장·메시지·후기·재구매 전략을
컨설팅 리포트 형태로 자동 생성합니다.

> 핵심 철학: **상품을 파는 것이 아니라 채널 친구를 확보하는 구조를 설계한다.**
> 전략 흐름: `톡딜 → 채널친구 → 메시지 → 재구매 → 브랜드`

## 기술 스택

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS**
- 계산 로직(`src/lib`)과 UI(`src/components`)를 분리 — 추후 SaaS 확장 대비
- 입력값은 `localStorage`에 자동 저장(로그인·DB 없이 동작하는 클라이언트 중심 MVP)

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
```

## 생성되는 전략 리포트 (순서)

1. **전략 요약** — AI 상품 등급(S~D), 적합성, 핵심 지표, 경고
2. **수익 계산** — 일반판매/톡딜 순마진·마진율, 목표 판매량, 블렌디드 마진, LTV
3. **추천 딜 유형** — 만원딜/1+1딜/오늘의딜/오늘공구 + 오늘공구 가능성 판단
4. **실행 체크리스트** — 바로 실행 가능한 항목(체크 가능)
5. **메시지 캠페인** — 4단계(쿠폰·소개·긴급성·리마인드), 문구 복사
6. **후기 확보 전략** — 후기 구간별 전략 + 성장 흐름
7. **채널 성장 전략** — 친구 수 단계별 전략 + 예상 친구 증가 + 재구매 설계
8. **실행 점수 평가** — 6개 항목(1~5점) 실행력 지수

## 폴더 구조

```
src/
  app/
    page.tsx              # 입력 도구 + 리포트 (첫 화면)
    layout.tsx
    globals.css
  components/             # 리포트 카드 + UI 프리미티브
    ProductInputForm.tsx
    StrategySummary.tsx   # 실시간 요약
    ReportHeader.tsx      # ① 전략요약 + 적합성 상세 + 경고
    ProfitCalculatorCard.tsx
    DealRecommendationCard.tsx
    ChecklistCard.tsx
    MessageCampaignCard.tsx
    ReviewStrategyCard.tsx
    ChannelGrowthCard.tsx
    ExecutionScoreCard.tsx
    ui.tsx
  lib/                    # 순수 계산 로직 (UI와 분리)
    types.ts
    calculations.ts       # 수익/블렌디드/적합성/오늘공구/채널/LTV
    scoring.ts            # 상품 등급 + 실행 점수
    dealRecommendation.ts # 딜 유형 추천 엔진
    messageGenerator.ts   # 메시지 4단계 생성
    reviewRepurchase.ts   # 후기/재구매 전략
    report.ts             # 리포트 오케스트레이터 + 예외 처리
    format.ts
```

## 계산 규칙 (요약)

- 일반판매 수수료 **3.3%**, 톡딜 수수료 **10%** — 금액은 항상 정수(원)
- 톡딜 순마진 = 판매가 − 공급가 − 배송비 − 톡딜수수료
- 친구 전환율 기본 **35%**, 연간 구매 횟수 기본 **2.5회**(반복구매성 높으면 상향)
- 톡딜 적합성: 7개 항목 × 0~2점(14점 만점) → 구조 보완 필요 / 가능성 있음 / 적극 추천

## 예외 처리

순마진 0 이하, 목표 마진 미달, 손익분기점 미달, 후기 부족 시 오늘공구 희망,
무료배송 불가 시 오늘공구 희망, 만원딜 가격 초과, 잘못된 금액 입력 등을 경고로 표시합니다.
