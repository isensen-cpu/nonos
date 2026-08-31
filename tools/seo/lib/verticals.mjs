/**
 * 업종별 씨앗 키워드 패턴 + 구글 공식 카테고리 후보.
 *
 * {city}   → 한글 도시명   (profile.city)
 * {cityEn} → 영문 도시명   (profile.cityEn)
 *
 * ⚠️ 카테고리 명칭은 구글이 주기적으로 갱신한다. 등록 화면에서 실시간 검색해
 *    실제 목록에 있는지 반드시 재확인할 것. (docs/seo/08-multi-vertical-gbp.md §2)
 */
export const VERTICALS = {
  food: {
    label: '음식점·카페·베이커리',
    categories: {
      primary: ['Korean Restaurant'],
      additional: ['Restaurant', 'Barbecue Restaurant', 'Asian Restaurant', 'Cafe', 'Bakery',
        'Coffee Shop', 'Dessert Shop', 'Takeout Restaurant', 'Snack Bar'],
    },
    seeds: {
      ko: ['{city} 한식', '{city} 한식당', '{city} 맛집', '{city} 한인 식당', '{city} 카페',
        '{city} 베이커리', '한식 배달 {city}', '한식 포장 {city}', '{city} 김밥', '{city} 라면'],
      en: ['korean restaurant {cityEn}', 'korean food {cityEn}', 'korean bbq {cityEn}',
        'korean restaurant near me', 'korean food delivery {cityEn}', 'korean food takeout {cityEn}',
        'korean bakery {cityEn}', 'korean cafe {cityEn}', 'best korean food {cityEn}',
        'kimbap {cityEn}'],
    },
  },
  beauty: {
    label: '뷰티·헤어·네일·스킨케어',
    categories: {
      primary: ['Beauty Salon', 'Hair Salon', 'Nail Salon'],
      additional: ['Facial Spa', 'Skin Care Clinic', 'Beauty Supply Store', 'Waxing Hair Removal Service',
        'Eyelash Salon', 'Massage Spa'],
    },
    seeds: {
      ko: ['{city} 미용실', '{city} 한인 미용실', '{city} 네일샵', '{city} 헤어샵', '{city} 피부관리',
        '{city} 속눈썹', '{city} 왁싱', '{city} 웨딩 메이크업', '{city} 남자 커트', '{city} 펌 잘하는 곳'],
      en: ['korean hair salon {cityEn}', 'hair salon {cityEn}', 'nail salon {cityEn}',
        'korean nail salon {cityEn}', 'facial spa {cityEn}', 'k-beauty skincare {cityEn}',
        'eyelash extensions {cityEn}', 'waxing {cityEn}', 'wedding makeup {cityEn}',
        'mens haircut {cityEn}'],
    },
  },
  retail: {
    label: '리테일·마트·온라인 병행',
    categories: {
      primary: ['Asian Grocery Store', 'Cosmetics Store', 'Gift Shop'],
      additional: ['Grocery Store', 'Food Store', 'Beauty Supply Store', 'Novelty Store',
        'Convenience Store', 'Import Export Company'],
    },
    seeds: {
      ko: ['{city} 한인마트', '{city} 한국 식료품', '{city} 아시안마트', '{city} 한국 화장품',
        '{city} K뷰티', '{city} K팝 굿즈', '김치 배달 {city}', '한국 라면 {city}',
        '냉동 만두 {city}', '{city} 한국 과자'],
      en: ['korean grocery store {cityEn}', 'asian grocery store {cityEn}', 'korean market {cityEn}',
        'k-beauty store {cityEn}', 'korean cosmetics {cityEn}', 'kpop merchandise store {cityEn}',
        'korean snacks {cityEn}', 'kimchi delivery {cityEn}', 'korean ramen {cityEn}',
        'korean food store near me'],
    },
  },
  education: {
    label: '교육·학원 / 병원·클리닉 / 기타 서비스',
    categories: {
      primary: ['Language School', 'Tutoring Service', 'Education Center'],
      additional: ['Learning Center', 'Music School', 'Art School', 'After School Program',
        'Test Preparation Center'],
    },
    seeds: {
      ko: ['{city} 한국어 학원', '{city} 한글학교', '{city} 과외', '{city} 학원',
        '{city} 수학 과외', '{city} 영어 과외', '성인 한국어 회화 {city}', '{city} 방학 특강',
        '{city} 미술학원', '{city} 피아노 학원'],
      en: ['korean language school {cityEn}', 'korean classes {cityEn}', 'tutoring {cityEn}',
        'tutoring near me', 'math tutor {cityEn}', 'english tutor {cityEn}',
        'adult korean conversation class {cityEn}', 'after school program {cityEn}',
        'art class {cityEn}', 'piano lessons {cityEn}'],
    },
  },
  culture: {
    label: 'K-컬처 체험공간 (노래방·포토부스·굿즈 복합)',
    categories: {
      primary: ['Amusement Center', 'Karaoke Bar', 'Tourist Attraction'],
      additional: ['Photo Booth', 'Gift Shop', 'Snack Bar', 'Event Venue', 'Party Store'],
    },
    seeds: {
      ko: ['{city} 코인노래방', '{city} 스티커사진', '{city} 포토부스', '{city} 한국문화체험',
        '{city} 데이트 코스', '{city} 가족 나들이', '{city} 생일파티 대관', '{city} K팝 체험',
        '{city} 라면 자판기', '{city} 놀거리'],
      en: ['karaoke {cityEn}', 'photo booth {cityEn}', 'korean culture experience {cityEn}',
        'k-pop experience {cityEn}', 'things to do {cityEn}', 'date spot {cityEn}',
        'family activities {cityEn}', 'birthday party venue {cityEn}',
        'ramen vending machine cafe {cityEn}', 'kpop themed cafe {cityEn}'],
    },
  },
};

/** 지역 확장 — 우리 도시 + 인접 상권 각각으로 조합을 만든다 */
export function expandSeeds(profile, { languages = ['ko', 'en'], includeNearby = true } = {}) {
  const verticals = (profile.verticals || []).filter((v) => VERTICALS[v]);
  if (verticals.length === 0) return { groups: [], total: 0 };

  const cityPairs = [{ city: profile.city, cityEn: profile.cityEn }];
  if (includeNearby) {
    const nearby = profile.nearbyCityPairs || [];
    cityPairs.push(...nearby);
  }

  const groups = [];
  for (const key of verticals) {
    const v = VERTICALS[key];
    for (const lang of languages) {
      const seen = new Set();
      const keywords = [];
      for (const pair of cityPairs) {
        for (const pattern of v.seeds[lang] || []) {
          const kw = pattern
            .replace(/\{city\}/g, pair.city || '')
            .replace(/\{cityEn\}/g, pair.cityEn || '')
            .replace(/\s+/g, ' ')
            .trim();
          const norm = kw.toLowerCase();
          if (!kw || seen.has(norm)) continue;
          seen.add(norm);
          keywords.push(kw);
        }
      }
      groups.push({ vertical: key, label: v.label, language: lang, keywords });
    }
  }
  return { groups, total: groups.reduce((n, g) => n + g.keywords.length, 0) };
}
