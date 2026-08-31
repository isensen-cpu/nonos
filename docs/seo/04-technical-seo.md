# 04. 기술 SEO 세팅 (Next.js App Router 기준)

> 구현 템플릿: `templates/next-seo/`. 웹사이트가 아직 없다면 이 문서는 건너뛰고 05번(구글맵)부터 해도 된다.

## 1. 색인 가능성 — 순위 이전의 문제

| 항목 | 기준 | 확인 |
|---|---|---|
| `robots.txt` | 차단 규칙 없음, sitemap 선언 | `/robots.txt` 직접 열기 |
| `sitemap.xml` | 모든 공개 페이지 포함, 자동 생성 | GSC에 제출 |
| canonical | 모든 페이지에 절대 URL 1개 | 소스보기 |
| `noindex` | 운영 배포에 남아있지 않을 것 | **가장 흔한 사고** — 스테이징 설정이 그대로 넘어감 |
| 404 / 리다이렉트 | 301 사용 (302 ❌) | |
| JS 렌더링 | 본문이 서버 렌더링될 것 | GSC "URL 검사 → 렌더링된 HTML" |

**Next.js에서는 서버 컴포넌트로 본문을 렌더링한다.** 클라이언트 전용 fetch로 본문을 그리면 크롤러가 빈 페이지를 볼 수 있다.

## 2. 페이지 구조 — 1페이지 1키워드

| 페이지 | 담당 Tier | title 패턴 |
|---|---|---|
| 홈 `/` | S 1개 | `[상호] - [핵심 서비스] \| [도시]` |
| 서비스/메뉴 `/menu` | A | `[서비스명] \| [상호] [도시]` |
| 지역 랜딩 `/[city]` | A (인접 도시) | `[도시] [서비스] - [상호]` |
| 오시는 길 `/location` | local 의도 | `[상호] 오시는 길 - [도시] [주소]` |
| 블로그 `/blog/[slug]` | B | `[롱테일 키워드]` |

**인접 지역 랜딩 페이지 주의**: 도시명만 바꾼 복제 페이지를 대량 생산하면 Helpful Content 신호로 사이트 전체가 하락한다. 각 페이지에 **그 지역 고유의 정보**(주차, 오는 길, 그 지역 고객 사례)를 실제로 담을 수 있을 때만 만든다.

## 3. 온페이지 필수 요소

| 요소 | 규칙 |
|---|---|
| `<title>` | 50~60자, 키워드를 앞쪽에, 브랜드는 뒤에 |
| `meta description` | 120~155자. 순위에 직접 영향 없지만 **클릭률(CTR)에 영향** |
| `H1` | 페이지당 **1개**, 타깃 키워드 포함 |
| `H2/H3` | 검색 의도의 하위 질문을 소제목으로 |
| 이미지 | `alt` 필수, 파일명은 키워드-하이픈, `next/image`로 WebP/AVIF 자동 변환 |
| 내부 링크 | 각 페이지에서 관련 페이지로 2~3개, 앵커 텍스트에 키워드 |
| 구조화 데이터 | `LocalBusiness` JSON-LD (아래 4장) |

## 4. 구조화 데이터 (JSON-LD) — 로컬 SEO에 직결

`LocalBusiness` 스키마는 GBP와 웹사이트를 같은 사업체로 연결하는 신호다. **NAP 값은 GBP와 한 글자도 다르지 않게** 한다.

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "OO식당",
  "image": ["https://example.com/storefront.jpg"],
  "@id": "https://example.com/#localbusiness",
  "url": "https://example.com",
  "telephone": "+1-604-000-0000",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "000 St Johns St",
    "addressLocality": "Port Moody",
    "addressRegion": "BC",
    "postalCode": "V3H 0A0",
    "addressCountry": "CA"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 0, "longitude": 0 },
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    "opens": "11:00", "closes": "21:00"
  }],
  "sameAs": ["https://instagram.com/...", "https://www.facebook.com/..."],
  "hasMap": "https://maps.google.com/?cid=<GBP CID>"
}
```

`@type`은 업종에 맞게: `Restaurant` / `BeautySalon` / `HairSalon` / `Store` / `MedicalClinic` / `EducationalOrganization`.
검증: [Rich Results Test](https://search.google.com/test/rich-results)

> `aggregateRating`을 직접 넣지 않는다. 자체 리뷰 없이 마크업만 넣으면 스팸으로 간주된다. 평점은 GBP 리뷰가 담당한다.

## 5. Core Web Vitals

| 지표 | 기준 | 주요 원인 / 처방 |
|---|---|---|
| **LCP** | ≤ 2.5s | 히어로 이미지 → `next/image` + `priority`, 폰트 `display: swap` |
| **INP** | ≤ 200ms | 무거운 클라이언트 JS 축소, 서버 컴포넌트 우선 |
| **CLS** | ≤ 0.1 | 이미지 `width/height` 명시, 광고·배너 자리 미리 확보 |

측정: PageSpeed Insights(실측 CrUX 포함) → Search Console "Core Web Vitals" 리포트

## 6. 다국어 (한/영 병행 시)

- 경로 분리: `/ko/...`, `/en/...`
- 각 페이지에 `hreflang` 상호 선언 + `x-default`
- **자동 번역만 올린 페이지는 감점 요인.** 두 언어를 다 관리할 수 없다면 **주력 언어 1개만** 제대로 하는 편이 낫다.

## 7. 배포 후 즉시 할 일

1. Search Console 속성 등록 (도메인 속성 권장) → sitemap 제출
2. 주요 페이지 **URL 검사 → 색인 생성 요청**
3. GA4 연결, GBP 유입에 UTM 적용
4. Bing Webmaster Tools 등록 (GSC에서 가져오기 가능, 5분)
