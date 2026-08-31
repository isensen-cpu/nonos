#!/usr/bin/env node
/**
 * 사업장 프로필 대화형 생성기 — 질문에 답하면 data/business.profile.json 이 만들어진다.
 *
 *   npm run seo:init
 *   node tools/seo/init-profile.mjs --answers answers.json   # 비대화형(파일로 답변 전달)
 *
 * 기존 파일이 있으면 덮어쓰기 전에 물어본다.
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { VERTICALS } from './lib/verticals.mjs';

const OUT = 'data/business.profile.json';
const argv = process.argv.slice(2);
const answersFile = argv.includes('--answers') ? argv[argv.indexOf('--answers') + 1] : null;

const VERTICAL_KEYS = Object.keys(VERTICALS);

const QUESTIONS = [
  { key: 'businessName', q: '한글 상호 (간판과 100% 동일하게)', required: true },
  { key: 'businessNameEn', q: '영문 상호 (없으면 엔터)', required: false },
  { key: 'city', q: '한글 도시명 (예: 포트무디)', required: true },
  { key: 'cityEn', q: '영문 도시명 (예: Port Moody)', required: true },
  { key: 'region', q: '주/province (예: BC)', required: false, default: 'BC' },
  { key: 'nearby', q: '인접 상권 도시 (한글:영문 쌍을 쉼표로 — 예: 코퀴틀람:Coquitlam, 밴쿠버:Vancouver)', required: false },
  { key: 'verticals', q: `업종을 매출 큰 순서대로 (쉼표로 — ${VERTICAL_KEYS.join(' / ')})`, required: true },
  { key: 'locationType', q: '등록 유형 [1] 매장형 [2] 서비스 지역형(주소 비공개) [3] 하이브리드', required: false, default: '1' },
  { key: 'street', q: '주소 (번지·도로명)', required: false },
  { key: 'postalCode', q: '우편번호', required: false },
  { key: 'phone', q: '대표 전화 (예: +1-604-000-0000)', required: false },
  { key: 'primaryLanguage', q: '주력 고객 언어 [en] 현지인 확장 / [ko] 교민 기반', required: false, default: 'en' },
  { key: 'services', q: '대표 상품·서비스 (쉼표로, 3~7개 — 예: 김치찌개, 젤네일, 한국어 회화)', required: false },
];

function buildProfile(a) {
  const verticals = String(a.verticals || '')
    .split(',').map((s) => s.trim().toLowerCase()).filter((v) => VERTICAL_KEYS.includes(v));
  if (verticals.length === 0) throw new Error(`업종이 비었거나 인식되지 않았습니다. 사용 가능: ${VERTICAL_KEYS.join(', ')}`);

  const nearbyCityPairs = String(a.nearby || '')
    .split(',').map((s) => s.trim()).filter(Boolean)
    .map((pair) => {
      const [city, cityEn] = pair.split(':').map((s) => (s || '').trim());
      return city && cityEn ? { city, cityEn } : null;
    }).filter(Boolean);

  const services = String(a.services || '')
    .split(',').map((s) => s.trim()).filter(Boolean)
    .map((s) => ({ ko: s, en: '' }));

  const locationType = { 1: 'storefront', 2: 'serviceArea', 3: 'hybrid' }[String(a.locationType || '1').trim()] || 'storefront';
  const primary = VERTICALS[verticals[0]];

  return {
    _generatedBy: 'npm run seo:init',
    _generatedAt: new Date().toISOString().slice(0, 10),

    businessName: a.businessName,
    businessNameEn: a.businessNameEn || '',
    brandTerms: [a.businessName, a.businessNameEn].filter(Boolean),

    verticals,
    _verticalsNote: '배열 맨 앞 = 매출 1순위 업종. 기본 카테고리 선정 기준입니다.',

    businessType: primary.label,
    businessTypeEn: '',
    gbpPrimaryCategory: '',
    _gbpPrimaryCategoryHint: `후보: ${primary.categories.primary.join(' / ')} — 등록 화면에서 실시간 검색해 확정 후 기입`,
    gbpAdditionalCategories: [],

    locationType,
    nap: {
      name: a.businessName,
      address: {
        street: a.street || '',
        city: a.cityEn,
        region: a.region || '',
        postalCode: a.postalCode || '',
        country: 'CA',
      },
      phone: a.phone || '',
    },

    city: a.city,
    cityEn: a.cityEn,
    region: a.region || '',
    nearbyCityPairs,
    nearbyCities: nearbyCityPairs.flatMap((p) => [p.city, p.cityEn]),

    primaryLanguage: String(a.primaryLanguage || 'en').trim().toLowerCase() === 'ko' ? 'ko' : 'en',

    services,
    coreTerms: ['korean', '한식', '한인', 'k-'],
    excludeTerms: ['채용', '구인', '알바', 'job', 'hiring', 'franchise', '가맹', '레시피', 'recipe', '만드는 법', 'how to make'],

    website: '',
    gbpUtm: '?utm_source=google&utm_medium=organic&utm_campaign=gbp',
  };
}

function report(profile) {
  console.log(`\n✅ ${OUT} 생성 완료\n`);
  console.log(`   상호      ${profile.businessName}${profile.businessNameEn ? ` / ${profile.businessNameEn}` : ''}`);
  console.log(`   지역      ${profile.city} (${profile.cityEn})${profile.nearbyCityPairs.length ? ` + 인접 ${profile.nearbyCityPairs.length}곳` : ''}`);
  console.log(`   업종      ${profile.verticals.map((v) => VERTICALS[v].label).join(' → ')}`);
  console.log(`   주력 언어 ${profile.primaryLanguage}`);
  console.log(`   등록 유형 ${profile.locationType}`);
  console.log('\n다음 단계:');
  console.log('   npm run seo:seeds     ← 키워드 플래너에 넣을 씨앗 키워드 생성');
  console.log('   npm run seo:status    ← 오늘 할 일 확인\n');
}

if (answersFile) {
  const profile = buildProfile(JSON.parse(readFileSync(answersFile, 'utf8')));
  if (existsSync(OUT)) copyFileSync(OUT, `${OUT}.bak`);
  writeFileSync(OUT, JSON.stringify(profile, null, 2) + '\n', 'utf8');
  report(profile);
} else {
  const rl = createInterface({ input: stdin, output: stdout });
  console.log('\n🏪 사업장 프로필을 만듭니다. 모르는 항목은 엔터로 건너뛰고 나중에 채워도 됩니다.\n');

  if (existsSync(OUT)) {
    const raw = readFileSync(OUT, 'utf8');
    const filled = !/[<>]/.test(raw);
    if (filled) {
      const ok = await rl.question(`⚠️  ${OUT} 이 이미 채워져 있습니다. 덮어쓸까요? (y/N) `);
      if (ok.trim().toLowerCase() !== 'y') { console.log('취소했습니다.'); rl.close(); process.exit(0); }
    }
  }

  const answers = {};
  for (const item of QUESTIONS) {
    const suffix = item.default ? ` [${item.default}]` : '';
    let value = '';
    for (;;) {
      value = (await rl.question(`${item.q}${suffix}\n> `)).trim();
      if (!value && item.default) value = item.default;
      if (value || !item.required) break;
      console.log('   (필수 항목입니다)');
    }
    answers[item.key] = value;
    console.log('');
  }
  rl.close();

  try {
    const profile = buildProfile(answers);
    if (existsSync(OUT)) copyFileSync(OUT, `${OUT}.bak`);
    writeFileSync(OUT, JSON.stringify(profile, null, 2) + '\n', 'utf8');
    report(profile);
  } catch (e) {
    console.error(`\n❌ ${e.message}`);
    process.exit(1);
  }
}
