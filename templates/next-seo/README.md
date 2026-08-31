# Next.js 기술 SEO 템플릿

`docs/seo/04-technical-seo.md` 의 기준을 코드로 옮긴 것. Next.js App Router 프로젝트에 복사해 사용한다.

| 파일 | 복사 위치 | 역할 |
|---|---|---|
| `site.config.ts` | `lib/seo/site.config.ts` | 사이트 단일 설정. `data/business.profile.json` 과 값이 일치해야 한다 |
| `metadata.ts` | `lib/seo/metadata.ts` | title/description/OG/canonical 생성 헬퍼 |
| `local-business-jsonld.tsx` | `components/seo/LocalBusinessJsonLd.tsx` | LocalBusiness 구조화 데이터 |
| `sitemap.ts` | `app/sitemap.ts` | 사이트맵 자동 생성 |
| `robots.ts` | `app/robots.ts` | robots.txt 자동 생성 |

## 적용 순서
1. 5개 파일 복사 → `site.config.ts` 값을 실제 정보로 수정 (**NAP는 GBP와 한 글자도 다르지 않게**)
2. `app/layout.tsx` 에 `<LocalBusinessJsonLd />` 삽입
3. 각 페이지에서 `buildMetadata()` 로 `export const metadata` 생성
4. 배포 후 [Rich Results Test](https://search.google.com/test/rich-results) 로 JSON-LD 검증
5. Search Console에 `/sitemap.xml` 제출 → 주요 페이지 색인 생성 요청
