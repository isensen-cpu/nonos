import { siteConfig } from '@/lib/seo/site.config';

/**
 * LocalBusiness 구조화 데이터.
 * GBP와 웹사이트를 같은 사업체로 연결하는 신호이므로 NAP 값이 정확히 일치해야 한다.
 *
 * ⚠️ aggregateRating은 넣지 않는다 — 자체 리뷰 없이 마크업만 넣으면 스팸으로 간주된다.
 *    평점은 GBP 리뷰가 담당한다. (docs/seo/04 §4)
 *
 * 사용: app/layout.tsx 의 <body> 안에 <LocalBusinessJsonLd /> 삽입
 * 검증: https://search.google.com/test/rich-results
 */
export function LocalBusinessJsonLd() {
  const { nap, geo, openingHours } = siteConfig;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': siteConfig.schemaType,
    '@id': `${siteConfig.url}/#localbusiness`,
    name: nap.name,
    url: siteConfig.url,
    description: siteConfig.description,
    image: [`${siteConfig.url}${siteConfig.ogImage}`],
    telephone: nap.telephone,
    priceRange: siteConfig.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: nap.streetAddress,
      addressLocality: nap.addressLocality,
      addressRegion: nap.addressRegion,
      postalCode: nap.postalCode,
      addressCountry: nap.addressCountry,
    },
    ...(geo.latitude && geo.longitude
      ? { geo: { '@type': 'GeoCoordinates', latitude: geo.latitude, longitude: geo.longitude } }
      : {}),
    openingHoursSpecification: openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    ...(siteConfig.sameAs.length > 0 ? { sameAs: siteConfig.sameAs } : {}),
    ...(siteConfig.googleMapsUrl ? { hasMap: siteConfig.googleMapsUrl } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
