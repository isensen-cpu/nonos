# 오늘부터 실행 — 순서대로만 따라가면 됩니다

> 개발 지식 없어도 됩니다. 아래 명령어를 그대로 복사해서 붙여넣으세요.
> 지금 무엇을 할 차례인지 헷갈리면 언제든 **`npm run seo:status`** 를 치면 됩니다.

---

## 오늘 (60분)

### 1) 사업장 정보 입력 — 15분
```bash
npm run seo:init
```
질문 13개에 답하면 됩니다. 모르는 건 엔터로 건너뛰고 나중에 채워도 됩니다.

> **업종은 매출이 큰 순서대로** 입력하세요. 첫 번째가 기본 카테고리를 결정합니다.
> 사용 가능: `food`(음식) `beauty`(뷰티) `retail`(리테일) `education`(교육) `culture`(K-컬처 체험)

### 2) 씨앗 키워드 만들기 — 5분
```bash
npm run seo:seeds
```
`data/keywords/seeds/README.md` 가 만들어집니다. 키워드 플래너에 10개씩 넣을 묶음으로 정리되어 있습니다.

### 3) 구글 광고 계정 만들기 — 15분 (무료, 결제수단 불필요)
1. `ads.google.com` 접속 → 구글 계정 로그인
2. 캠페인 만들기 화면이 뜨면 아래 **"전문가 모드로 전환"** 클릭
3. **"캠페인 없이 계정 만들기"** 선택
4. 상단 **도구 → 계획 → 키워드 플래너**

### 4) 오늘의 마무리 — 25분
사진 촬영 계획을 세웁니다. `docs/seo/checklists/photo-specs.md` 를 열어 필요한 컷 20장을 확인하고, 언제 찍을지 정하세요. 외관은 **낮/밤 각각** 필요하니 하루에 두 번 나가야 합니다.

```bash
npm run seo:status -- --done kp-account
```

---

## 이번 주

### 5) 키워드 실측 데이터 받기 — 40분
1. 키워드 플래너 → **"새 키워드 찾기"**
2. **위치**를 우리 도시로, **언어**를 한국어/영어 각각 따로 설정 (2번 조회)
3. `data/keywords/seeds/README.md` 의 묶음을 하나씩 붙여넣고 조회
4. 결과 화면 우측 상단 **다운로드 → CSV**
5. 받은 파일을 `data/keywords/` 폴더에 그대로 넣기 (파일을 열거나 고치지 마세요)

```bash
npm run seo:score
```
→ `data/keywords/output/keyword-map.md` 에 우선순위표가 나옵니다.

> 검색량이 "100 – 1K" 같은 구간으로 나오는 건 **정상**입니다(광고 미집행 계정). 도구가 알아서 보수적으로 처리합니다.

### 6) 사진 20장 촬영 — 90분
`docs/seo/checklists/photo-specs.md` 대로. 촬영 후 파일명을 **영문**으로 바꿉니다.
```
❌ IMG_1234.jpg    ✅ port-moody-korean-restaurant-interior-01.jpg
```
한글 파일명은 구글이 텍스트 신호로 읽지 못합니다.

### 7) 구글 비즈니스 프로필 등록 — 30분
1. `business.google.com` → **상호로 먼저 검색** (구글이 자동 생성해둔 프로필이 있을 수 있습니다. 있으면 "소유권 주장")
2. 기본 카테고리 **1개** 입력 → `docs/seo/08-multi-vertical-gbp.md §2` 의 결정 트리대로
3. 주소 입력 후 **지도 핀을 실제 출입구로 드래그**
4. 소유권 확인 → **동영상 촬영** → `templates/gbp-copy/05-verification-video.md` 의 대본대로

승인까지 3~7일. **기다리는 동안 아래 8번을 미리 써둡니다.**

---

## 승인 나면 (2주차, 여기가 전체 효과의 60%)

### 8) 문구 미리 작성
| 무엇 | 템플릿 |
|---|---|
| 비즈니스 설명 750자 | `templates/gbp-copy/01-business-description.md` |
| 서비스/메뉴 항목 12개 | `templates/gbp-copy/06-services-items.md` |
| Q&A 5개 | `templates/gbp-copy/04-qna.md` |
| 게시물 12주치 | `templates/gbp-copy/03-posts-12weeks.md` |
| 리뷰 요청·답글 | `templates/gbp-copy/02-review-replies.md` |

### 9) 승인 당일에 몰아서 세팅 — 2시간
```bash
npm run seo:status -- --all      # 2주차 항목 전체 보기
```
- 보조 카테고리 등록 (실제 제공하는 것만)
- 비즈니스 설명 붙여넣기
- **서비스 항목 12개 등록** ← 복합 업종의 승부처
- 속성 전부 채우기 (주차·배달·예약·결제·한국어 응대)
- 영업시간 + 공휴일 예외
- 사진 첫 10장 업로드
- Q&A 5개 (2~3일 간격으로 나눠서)
- 리뷰 QR 제작·비치

---

## 그 다음 (매주 60분, 매월 90분)

| 주기 | 할 일 |
|---|---|
| 매주 월 | 게시물 1건 (`03-posts-12weeks.md` 순서대로) — 15분 |
| 매주 수 | 사진 2~3장 업로드 — 10분 |
| 매주 금 | 리뷰 답글 100% + Q&A 확인 — 25분 |
| 매월 | KPI 기록 + 키워드맵 갱신 — 90분 (`docs/seo/07-measurement.md`) |

---

## 명령어 정리

```bash
npm run seo:init      # 사업장 정보 입력 (최초 1회)
npm run seo:seeds     # 키워드 플래너용 씨앗 키워드 생성
npm run seo:score     # 플래너 CSV → 우선순위표
npm run seo:status    # 지금 할 일 3개 + 진행률
npm run seo:status -- --all           # 전체 과제 35개 보기
npm run seo:status -- --done <과제id> # 완료 표시
```

---

## 막히면

| 상황 | 답 |
|---|---|
| 뭘 해야 할지 모르겠다 | `npm run seo:status` |
| 카테고리를 못 고르겠다 | `docs/seo/08-multi-vertical-gbp.md §2` 결정 트리 |
| 왜 이걸 하는지 모르겠다 | `docs/seo/00-google-algorithm.md` |
| 순위가 안 오른다 | `docs/seo/07-measurement.md §4` — 12주 전에는 판단하지 않습니다 |
| 상호에 키워드를 넣고 싶다 | **정지 사유입니다.** `00-google-algorithm.md §4` |
