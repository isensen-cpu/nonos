#!/usr/bin/env node
/**
 * 씨앗 키워드 생성기 — 아직 실측 데이터가 없을 때(모드 2) 첫 단계.
 *
 *   node tools/seo/make-seeds.mjs [--profile <path>] [--out <dir>] [--chunk 10] [--no-nearby]
 *
 * 하는 일: 사업장 프로필의 업종 × 지역을 조합해, Google Keyword Planner의
 * "새 키워드 찾기"에 그대로 붙여넣을 씨앗 키워드 묶음을 만든다.
 * 플래너는 한 번에 10개까지만 받으므로 10개씩 잘라서 출력한다.
 *
 * ⚠️ 이 도구는 검색량을 만들지 않는다. 검색량은 플래너에서 받아와야 한다.
 *    받아온 CSV를 data/keywords/ 에 넣고 `npm run seo:score` 로 넘어간다.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { VERTICALS, expandSeeds } from './lib/verticals.mjs';

const argv = process.argv.slice(2);
const getArg = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const OPTS = {
  profile: getArg('--profile', 'data/business.profile.json'),
  out: getArg('--out', 'data/keywords/seeds'),
  chunk: parseInt(getArg('--chunk', '10'), 10) || 10,
  nearby: !argv.includes('--no-nearby'),
};

const profilePath = existsSync(OPTS.profile) ? OPTS.profile : 'data/business.profile.example.json';
if (!existsSync(profilePath)) {
  console.error(`❌ 프로필이 없습니다: ${OPTS.profile}`);
  process.exit(1);
}
const profile = JSON.parse(readFileSync(profilePath, 'utf8'));

const isPlaceholder = (v) => typeof v === 'string' && /[<>]/.test(v);
const unfilled = ['city', 'cityEn', 'businessName'].filter((k) => !profile[k] || isPlaceholder(profile[k]));
if (unfilled.length > 0) {
  console.error(`❌ ${profilePath} 에 아직 채우지 않은 항목이 있습니다: ${unfilled.join(', ')}`);
  console.error('   <> 로 표시된 자리를 실제 값으로 바꾼 뒤 다시 실행하세요.');
  console.error('   → docs/seo/08-multi-vertical-gbp.md §7');
  process.exit(1);
}
if (!(profile.verticals || []).length) {
  console.error(`❌ 프로필의 verticals 가 비어 있습니다. 사용 가능: ${Object.keys(VERTICALS).join(', ')}`);
  process.exit(1);
}

profile.nearbyCityPairs = (profile.nearbyCityPairs || [])
  .filter((p) => p && p.city && p.cityEn && !isPlaceholder(p.city) && !isPlaceholder(p.cityEn));

const { groups, total } = expandSeeds(profile, { includeNearby: OPTS.nearby });
mkdirSync(OPTS.out, { recursive: true });

const chunkify = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

// 언어별 평문 목록 (한 줄에 하나 — 복사 붙여넣기용)
for (const lang of ['ko', 'en']) {
  const keywords = groups.filter((g) => g.language === lang).flatMap((g) => g.keywords);
  if (keywords.length === 0) continue;
  writeFileSync(join(OPTS.out, `seed-${lang}.txt`), keywords.join('\n') + '\n', 'utf8');
}

// 실행 가이드 — 플래너 조회 단위(10개)로 잘라서 제시
const L = [];
L.push('# 씨앗 키워드 — Google Keyword Planner 조회용');
L.push('');
L.push(`> 생성일: ${new Date().toISOString().slice(0, 10)}`);
L.push(`> 사업장: ${profile.businessName || '(미설정)'} / ${profile.city} (${profile.cityEn})`);
L.push(`> 총 ${total}개 — 업종 ${(profile.verticals || []).length}개 × 지역 ${1 + (OPTS.nearby ? (profile.nearbyCityPairs || []).length : 0)}곳`);
L.push('');
L.push('## 사용법');
L.push('');
L.push('1. `ads.google.com` → 전문가 모드 → 도구 → **키워드 플래너** → "새 키워드 찾기"');
L.push('2. **위치**를 우리 도시로, **언어**를 아래 묶음의 언어로 맞춘다 (한국어/영어 각각 따로 조회)');
L.push(`3. 아래 묶음을 하나씩 붙여넣고 조회 → 결과를 **CSV로 다운로드** (플래너는 1회 ${OPTS.chunk}개까지)`);
L.push('4. 받은 CSV를 `data/keywords/` 에 넣고 `npm run seo:score` 실행');
L.push('');
L.push('> 플래너 미집행 계정은 검색량이 구간("100 – 1K")으로 나온다. 정상이며, 점수 산출기가 하한값으로 보수 처리한다.');
L.push('');

for (const g of groups) {
  if (g.keywords.length === 0) continue;
  L.push(`## ${g.label} — ${g.language === 'ko' ? '한국어' : '영어'} (${g.keywords.length}개)`);
  L.push('');
  chunkify(g.keywords, OPTS.chunk).forEach((chunk, i) => {
    L.push(`**묶음 ${i + 1}**`);
    L.push('```');
    chunk.forEach((k) => L.push(k));
    L.push('```');
    L.push('');
  });
}

L.push('## 카테고리 후보 (등록 화면에서 실시간 검색해 실제 목록 확인 필수)');
L.push('');
L.push('| 업종 | 기본 카테고리 후보 | 보조 카테고리 후보 |');
L.push('|---|---|---|');
for (const key of profile.verticals || []) {
  const v = VERTICALS[key];
  if (!v) continue;
  L.push(`| ${v.label} | ${v.categories.primary.join(' / ')} | ${v.categories.additional.join(', ')} |`);
}
L.push('');
L.push('> **기본 카테고리는 전체에서 딱 1개만** 고른다. 복합 업종이라면 매출 1순위 업종의 것을 기본으로,');
L.push('> 나머지 업종의 카테고리는 전부 보조로 내린다. → `docs/seo/08-multi-vertical-gbp.md`');

writeFileSync(join(OPTS.out, 'README.md'), L.join('\n'), 'utf8');

console.log(`🌱 씨앗 키워드 ${total}개 생성`);
for (const g of groups) console.log(`   ${g.label} (${g.language}): ${g.keywords.length}개`);
console.log(`\n📄 ${join(OPTS.out, 'README.md')}  ← 플래너 조회 순서대로 정리됨`);
console.log(`📄 ${join(OPTS.out, 'seed-ko.txt')} / seed-en.txt`);
