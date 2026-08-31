# 03. 우선순위 점수 모델 — SEO 실행 순서를 숫자로 정하기

## 1. 점수 공식

```
priority = 100 × Volume' × Intent × Difficulty' × Relevance × LangBoost
```

| 항목 | 계산 | 범위 | 근거 |
|---|---|---|---|
| `Volume'` | `log10(volume + 1) / log10(maxVolume + 1)` | 0~1 | 검색량은 선형이 아니다. 10 → 100은 의미 있지만 10,000 → 100,000은 소상공인에게 차이가 없다. 로그 정규화로 롱테일이 과소평가되는 것을 막는다 |
| `Intent` | 의도별 가중치 | 0.35~1.0 | 02번 문서 3장 |
| `Difficulty'` | `1 - (competitionIndex / 100) × 0.6` | 0.4~1.0 | 경쟁도를 0으로 만들지 않는다. 경쟁이 높다 = 돈이 되는 키워드라는 신호이기도 하므로 최대 60%만 감점 |
| `Relevance` | 사람이 판정 | 0~1 | 02번 문서 4장 |
| `LangBoost` | 소수 언어 키워드에 1.15 | 1.0 / 1.15 | 언어 일치 고객의 전환율 프리미엄 |

> **검색량이 구간("100~1천")일 때는 하한값(100)을 쓴다.** 과대평가로 잘못된 투자를 하는 것보다 보수적 판단이 안전하다.

## 2. Tier 분류와 실행 매핑

| Tier | 점수 | 개수 목표 | 어디에 쓰는가 |
|---|---|---|---|
| **S** | 70+ | 3~5개 | GBP 기본/보조 카테고리, GBP 설명 첫 문장, 웹 홈 `<title>`, H1 |
| **A** | 50~69 | 8~12개 | GBP 서비스 항목, 랜딩 페이지 각 1개씩, 사진 파일명/alt |
| **B** | 30~49 | 15~25개 | GBP 게시물(주 1회 로테이션), 블로그 롱테일 제목, FAQ |
| **C** | 30 미만 | 나머지 | 보류. Google Ads 후보로만 검토 |
| **X** | 검색량 0 / 관련성 0 | — | 제외 목록에 사유와 함께 보관 |

**규칙: 한 페이지 = 한 개의 S/A 키워드.** 한 페이지에 여러 개를 욱여넣으면 어느 것으로도 잡히지 않는다(카니발라이제이션).

## 3. 채널 배분 규칙

| 채널 | 배정 | 이유 |
|---|---|---|
| **GBP (구글맵)** | Tier S, A 중 `local` 의도 전부 | 로컬 의도는 맵에서 승부가 난다 |
| **웹 SEO** | Tier S, A + B의 `commercial` | 지속 트래픽이 필요한 것 |
| **블로그/게시물** | Tier B 전부 + 한국어 롱테일 | 광고비 없이 롱테일 확보 |
| **Google Ads (선택)** | `transactional` 중 CPC 데이터가 있는 것 | 즉시 전환 필요 시. 경쟁도 HIGH는 롱테일로 쪼개 입찰 |

## 4. 실행

```bash
# 1) 사업장 정보 작성 (최초 1회)
cp data/business.profile.example.json data/business.profile.json
#    → services, city, nearbyCities, primaryLanguage 를 실제 값으로 수정

# 2) Keyword Planner CSV를 data/keywords/ 에 넣고 실행
node tools/seo/score-keywords.mjs

# 옵션
node tools/seo/score-keywords.mjs --input data/keywords --out data/keywords/output
node tools/seo/score-keywords.mjs --no-lang-boost      # 언어 보정 끄기
node tools/seo/score-keywords.mjs --top 50             # 상위 50개만 출력
```

### 출력물
| 파일 | 용도 |
|---|---|
| `output/keyword-map.md` | 사람이 읽는 우선순위표 (Tier별 + 채널별 + 제외 목록) |
| `output/keyword-map.csv` | 엑셀/구글시트에서 편집 |
| `output/keyword-map.json` | 다른 도구·코드에서 참조 |

## 5. 수동 교정 (자동 판정을 이기는 것은 사람이다)

두 파일은 **선택 사항**이며, 있으면 자동 판정을 덮어쓴다.

`data/keywords/intent-overrides.csv`
```csv
keyword,intent
korean bbq class vancouver,commercial
김치 담그기 체험,transactional
```

`data/keywords/relevance-overrides.csv`
```csv
keyword,relevance
korean fried chicken port moody,1.0
korean skincare,0
```

> 첫 실행 후 `keyword-map.md`를 훑어보며 **"이건 우리가 안 파는데?"** 싶은 것만 relevance 0으로 넣고 재실행하면 된다. 5분이면 끝난다.

## 6. 갱신 주기

| 시점 | 할 일 |
|---|---|
| 매월 | GSC "검색어" 리포트에서 실제 노출 키워드를 CSV로 추가 → 재실행 |
| 분기 | Keyword Planner 재조회 (계절성 반영) |
| 신메뉴/신규 서비스 출시 시 | 씨앗 키워드 추가 후 재실행 |
