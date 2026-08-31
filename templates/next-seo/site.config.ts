/**
 * 사이트 SEO 단일 설정.
 * ⚠️ NAP(name/address/phone)는 Google Business Profile 등록값과 **한 글자도** 달라선 안 된다.
 *    docs/seo/checklists/nap-consistency.md
 */
export const siteConfig = {
  /** 배포 도메인 (끝에 / 없이) */
  url: 'https://example.com',
  /** 검색결과에 뜨는 사이트 이름 */
  name: 'OO식당',
  /** schema.org 타입: Restaurant | BeautySalon | HairSalon | Store | MedicalClinic | EducationalOrganization */
  schemaType: 'Restaurant',
  /** Tier S 키워드를 반영한 기본 설명 (120~155자) */
  description:
    '포트무디 한식당 OO식당. 매일 직접 담그는 김치와 24시간 우린 사골 육수로 만드는 김치찌개·불고기·한식 BBQ. 포장, 배달, 단체 예약 가능.',
  locale: 'ko_KR',
  /** 한/영 병행 시 'ko' | 'en' */
  defaultLanguage: 'ko',

  nap: {
    name: 'OO식당',
    streetAddress: '000 St Johns St',
    addressLocality: 'Port Moody',
    addressRegion: 'BC',
    postalCode: 'V3H 0A0',
    addressCountry: 'CA',
    telephone: '+1-604-000-0000',
  },

  geo: { latitude: 0, longitude: 0 },

  /** 요일별 영업시간 — GBP 등록값과 동일하게 */
  openingHours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '11:00', closes: '21:00' },
    { days: ['Saturday', 'Sunday'], opens: '11:00', closes: '22:00' },
  ],

  priceRange: '$$',
  /** 커버 이미지 (1200×630 권장) */
  ogImage: '/og-image.jpg',
  /** 구글맵 프로필 링크 (GBP 관리화면에서 복사) */
  googleMapsUrl: '',
  /** NAP가 동일하게 등록된 외부 채널 */
  sameAs: [] as string[],
} as const;
