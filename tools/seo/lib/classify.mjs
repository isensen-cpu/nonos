/**
 * 키워드 분류 — 검색량 파싱 / 언어 / 검색 의도 / 관련성
 * 근거 문서: docs/seo/02-keyword-research.md, docs/seo/03-keyword-scoring.md
 */

/** 검색 의도별 가중치 (docs/seo/02 §3) */
export const INTENT_WEIGHT = {
  local: 1.0,
  transactional: 0.95,
  commercial: 0.8,
  informational: 0.45,
  brand: 0.35,
};

const PATTERNS = {
  informational: [
    /만드는\s*법/, /만들기/, /방법/, /레시피/, /효능/, /뜻/, /차이/, /유래/, /하는\s*법/,
    /\bhow to\b/i, /\bwhat is\b/i, /\brecipe\b/i, /\bmeaning\b/i, /\bdifference\b/i, /\bguide\b/i,
  ],
  transactional: [
    /배달/, /주문/, /예약/, /포장/, /테이크아웃/, /구매/, /가격/, /얼마/, /할인/, /쿠폰/, /견적/, /상담신청/,
    /\bdelivery\b/i, /\border\b/i, /\bbooking\b/i, /\bbook\b/i, /\breservation\b/i, /\btakeout\b/i,
    /\btake\s?out\b/i, /\bbuy\b/i, /\bprice\b/i, /\bcost\b/i, /\bcoupon\b/i, /\bappointment\b/i, /\bquote\b/i,
  ],
  local: [
    /근처/, /주변/, /가까운/, /맛집/, /오시는\s*길/, /위치/, /영업\s*중/, /지금\s*영업/,
    /\bnear me\b/i, /\bnearby\b/i, /\bnear\b/i, /\bopen now\b/i, /\bdirections\b/i, /\blocation\b/i,
  ],
  commercial: [
    /추천/, /후기/, /리뷰/, /비교/, /순위/, /유명한/, /best/i, /\btop\b/i, /\breview/i, /\bvs\b/i, /\brated\b/i,
  ],
};

const HANGUL = /[가-힣]/;

export function detectLanguage(keyword) {
  return HANGUL.test(keyword) ? 'ko' : 'en';
}

/**
 * 검색량 파싱.
 * 플래너 미집행 계정은 "100 – 1K", "10~100", "1천~1만" 같은 구간을 준다.
 * 과대평가를 막기 위해 항상 **하한값**을 취한다. (docs/seo/03 §1)
 */
export function parseVolume(raw) {
  if (raw === null || raw === undefined) return 0;
  let s = String(raw).trim();
  if (s === '' || s === '-') return 0;
  s = s.replace(/[–—~〜]/g, '-').replace(/\s+/g, '');
  if (s.includes('-')) s = s.split('-')[0];
  return parseNumberToken(s);
}

function parseNumberToken(token) {
  let s = String(token).replace(/,/g, '').replace(/[^0-9.KkMm천만억]/g, '');
  if (s === '') return 0;
  let multiplier = 1;
  if (/억$/.test(s)) { multiplier = 1e8; s = s.replace(/억$/, ''); }
  else if (/만$/.test(s)) { multiplier = 1e4; s = s.replace(/만$/, ''); }
  else if (/천$/.test(s)) { multiplier = 1e3; s = s.replace(/천$/, ''); }
  else if (/[Mm]$/.test(s)) { multiplier = 1e6; s = s.replace(/[Mm]$/, ''); }
  else if (/[Kk]$/.test(s)) { multiplier = 1e3; s = s.replace(/[Kk]$/, ''); }
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * multiplier) : 0;
}

/** 경쟁도 → 0~100 색인값. 지수 컬럼이 있으면 그것을 우선한다. */
export function parseCompetition(label, indexed) {
  const idx = parseFloat(String(indexed ?? '').replace(/[^0-9.]/g, ''));
  if (Number.isFinite(idx) && idx > 0) return Math.min(100, idx);
  const l = String(label ?? '').trim().toLowerCase();
  if (/^(low|낮음)/.test(l)) return 25;
  if (/^(medium|중간|보통)/.test(l)) return 55;
  if (/^(high|높음)/.test(l)) return 85;
  return 50; // 알 수 없음 — 중립
}

export function parseCurrency(raw) {
  const n = parseFloat(String(raw ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();

function includesAny(keyword, terms) {
  const k = norm(keyword);
  return terms.some((t) => t && k.includes(norm(t)));
}

/**
 * 검색 의도 판정.
 * 순서가 중요하다: brand → informational → transactional → local → commercial
 * ("best korean bbq vancouver" 처럼 지역명이 붙은 비교형은 local 로 본다 — 로컬 전환 가치가 크다)
 */
export function detectIntent(keyword, profile) {
  const brandTerms = [profile.businessName, profile.businessNameEn, ...(profile.brandTerms || [])].filter(Boolean);
  if (includesAny(keyword, brandTerms)) return 'brand';
  if (PATTERNS.informational.some((re) => re.test(keyword))) return 'informational';
  if (PATTERNS.transactional.some((re) => re.test(keyword))) return 'transactional';
  if (PATTERNS.local.some((re) => re.test(keyword))) return 'local';

  const cities = [profile.city, profile.cityEn, profile.region, ...(profile.nearbyCities || [])].filter(Boolean);
  if (includesAny(keyword, cities)) return 'local';

  if (PATTERNS.commercial.some((re) => re.test(keyword))) return 'commercial';
  return 'commercial';
}

/**
 * 관련성 자동 1차 판정 (최종 판단은 사람이 relevance-overrides.csv 로 덮어쓴다).
 * docs/seo/02 §4
 *
 * 구절 완전일치만 보면 "korean food near me" 같은 명백히 관련 있는 검색을 놓치므로
 * 토큰 단위까지 단계적으로 내려가며 판정한다.
 */
export function detectRelevance(keyword, profile) {
  if (includesAny(keyword, profile.excludeTerms || [])) return 0;

  const serviceTerms = (profile.services || []).flatMap((s) => [s.ko, s.en].filter(Boolean));
  if (includesAny(keyword, serviceTerms)) return 1.0;

  const typeTerms = [profile.businessType, profile.businessTypeEn, profile.gbpPrimaryCategory,
    ...(profile.gbpAdditionalCategories || [])].filter(Boolean);
  if (includesAny(keyword, typeTerms)) return 0.9;

  // 업종명의 모든 토큰이 흩어져 등장하는 경우 (예: "korean bbq restaurant vancouver")
  const k = norm(keyword);
  const allTokensPresent = typeTerms.some((t) => {
    const tokens = tokenize(t);
    return tokens.length > 0 && tokens.every((tok) => k.includes(tok));
  });
  if (allTokensPresent) return 0.9;

  // 핵심 주제어가 하나라도 등장 (예: "korean food near me" ← coreTerms: ["korean","한식"])
  const coreTerms = (profile.coreTerms || []).length > 0
    ? profile.coreTerms
    : [...new Set([...typeTerms, ...serviceTerms].flatMap(tokenize))];
  if (coreTerms.some((t) => k.includes(norm(t)))) return 0.65;

  return 0.3;
}

/** 의미 없는 짧은 토큰·불용어 제거 */
const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'of', 'in', 'for', 'near', 'me', 'best', 'top']);
function tokenize(term) {
  return norm(term)
    .split(/[\s/&,()-]+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}
