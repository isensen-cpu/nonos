# data/keywords — 키워드 원자료 폴더

## 넣는 것
Google Keyword Planner에서 내보낸 CSV를 **가공하지 말고 그대로** 넣습니다.
(UTF-16 인코딩, 탭 구분, 상단 안내 문구는 도구가 자동 처리합니다.)

파일명 규칙: `kp-<지역>-<언어>-<YYYYMM>.csv`
예) `kp-portmoody-ko-202608.csv`, `kp-portmoody-en-202608.csv`

Search Console "검색어" 리포트 CSV도 같은 폴더에 넣으면 함께 집계됩니다.
예) `gsc-queries-202608.csv`

## 수동 교정 파일 (선택)
| 파일 | 역할 |
|---|---|
| `intent-overrides.csv` | 검색 의도 자동 판정을 덮어씀 (`keyword,intent`) |
| `relevance-overrides.csv` | 관련성 자동 판정을 덮어씀 (`keyword,relevance` — 0~1) |

이 두 파일은 집계 대상에서 자동 제외됩니다.

## 실행
```bash
node tools/seo/score-keywords.mjs
```
결과는 `output/` 에 생성됩니다. (git에 커밋하지 않습니다)
