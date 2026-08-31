# 구글 SEO · 구글맵 상위노출 프로젝트

소상공인이 **구글 검색과 구글맵에서 실제로 발견되게 만드는** 작업을, 감이 아니라 실측 데이터와 체크리스트로 굴리기 위한 프로젝트.

## 이 프로젝트가 하는 일 / 하지 않는 일

| 하는 일 | 하지 않는 일 |
|---|---|
| 실측 키워드 → 우선순위 점수화 → 채널 배분 | 순위 자동 조작 (그런 방법은 존재하지 않는다) |
| 구글맵(GBP) 세팅을 빠짐없이 끝내게 만드는 체크리스트 | 리뷰 매크로·가짜 리뷰 (정지 사유) |
| 기술 SEO 코드 템플릿 | 링크 구매 |
| 측정·개선 루틴 | 검색량 숫자 지어내기 |

## 읽는 순서

| # | 문서 | 무엇을 얻나 |
|---|---|---|
| 00 | [구글 알고리즘 분석](00-google-algorithm.md) | 무엇을 최적화해야 하는지의 **근거** |
| 01 | [프로젝트 기획서](01-project-plan.md) | 목표·KPI·12주 로드맵·기획 시 정해야 할 6가지 |
| 02 | [키워드 리서치](02-keyword-research.md) | 구글 키워드 플래너에서 실측 데이터 뽑는 법 |
| 03 | [우선순위 점수 모델](03-keyword-scoring.md) | 무엇부터 할지를 숫자로 정하는 방법 |
| 04 | [기술 SEO](04-technical-seo.md) | Next.js 기준 색인·온페이지·구조화 데이터·CWV |
| **05** | **[구글맵 상위노출 세팅](05-google-maps-gbp.md)** | **핵심 — 투입 대비 효과가 가장 큰 작업** |
| 06 | [콘텐츠·리뷰 운영](06-content-ops.md) | 주 2시간으로 굴러가는 루틴 |
| 07 | [측정 체계](07-measurement.md) | 무엇을 보고 성패를 판단할지 |
| **08** | **[복합 업종 + 신규 등록 실행서](08-multi-vertical-gbp.md)** | 북미 한인 상권 / 여러 업종 결합 / GBP 미등록 / 웹사이트 없음 조건 전용 |

체크리스트: [GBP 세팅](checklists/gbp-setup-checklist.md) · [NAP 일관성](checklists/nap-consistency.md) · [사진 규격](checklists/photo-specs.md)

## 👉 처음이라면 [RUN-TODAY.md](RUN-TODAY.md) 부터

오늘 60분 안에 할 수 있는 것부터 순서대로 정리되어 있습니다.

## 빠른 시작

```bash
npm run seo:init      # 사업장 정보 입력 (질문 13개)
npm run seo:seeds     # 키워드 플래너에 넣을 씨앗 키워드 생성
npm run seo:score     # 플래너 CSV → 우선순위표
npm run seo:status    # 지금 할 일 3개 + 진행률

# (데이터 없이 동작만 먼저 보고 싶으면 샘플로 실행)
node tools/seo/score-keywords.mjs --input data/keywords/samples --out /tmp/seo-out \
  --profile data/business.profile.example.json
```

## 실행 우선순위 — 시간이 없다면 이 순서로

1. **`08-multi-vertical-gbp.md`** — 복합 업종이라면 여기부터. 기본 카테고리 1개를 정하는 것이 모든 것의 출발점
2. **`05-google-maps-gbp.md` STEP 2 (관련성 세팅)** — 1주, 전체 효과의 60%. 웹사이트 없어도 가능
3. `02` + `03` — 키워드 실측·점수화. 1일
4. `05` STEP 4 (리뷰·게시물) — 12주 누적
5. `04` — **웹사이트가 생긴 뒤에** 적용. 없으면 건너뛴다
