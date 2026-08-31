#!/usr/bin/env node
/**
 * 키워드 우선순위 산출기
 *
 *   node tools/seo/score-keywords.mjs [--input <dir>] [--out <dir>] [--top N] [--no-lang-boost]
 *
 * 입력 : data/keywords/*.csv  (Google Keyword Planner 내보내기 파일을 그대로)
 * 출력 : data/keywords/output/keyword-map.{md,csv,json}
 *
 * 근거 문서: docs/seo/03-keyword-scoring.md
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { readTable, pickColumn, toCsv } from './lib/csv.mjs';
import {
  parseVolume, parseCompetition, parseCurrency,
  detectLanguage, detectIntent, detectRelevance, INTENT_WEIGHT,
} from './lib/classify.mjs';
import { scoreKeyword, toTier, assignChannels, ensureTierMinimums } from './lib/score.mjs';

// ── 인자 파싱 ────────────────────────────────────────────────
const argv = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const OPTS = {
  input: getArg('--input', 'data/keywords'),
  out: getArg('--out', 'data/keywords/output'),
  profile: getArg('--profile', 'data/business.profile.json'),
  top: parseInt(getArg('--top', '0'), 10) || 0,
  langBoost: !argv.includes('--no-lang-boost'),
};

// ── 컬럼 후보 (한/영 플래너 표기 모두 대응) ──────────────────
const COL = {
  keyword: ['keyword', '키워드', 'search term', '검색어', 'query'],
  volume: ['avg. monthly searches', 'avg monthly searches', 'monthly searches',
           '월간 검색량 평균', '월평균 검색량', '평균 월간 검색수', '월간 검색수', 'searches', 'volume', '검색량'],
  competition: ['competition', '경쟁', '경쟁도'],
  competitionIndex: ['competition (indexed value)', 'competition indexed value', '경쟁(색인 값)', '경쟁 색인', 'competition index'],
  cpcLow: ['top of page bid (low range)', '페이지 상단 입찰가(최저 범위)', '페이지 상단 입찰가 (최저 범위)', 'low top of page bid', 'cpc'],
  cpcHigh: ['top of page bid (high range)', '페이지 상단 입찰가(최고 범위)', 'high top of page bid'],
};

// ── 프로필 로드 ──────────────────────────────────────────────
function loadProfile() {
  const path = existsSync(OPTS.profile) ? OPTS.profile : 'data/business.profile.example.json';
  if (!existsSync(path)) {
    console.error(`❌ 사업장 프로필이 없습니다: ${OPTS.profile}`);
    console.error('   먼저 실행: cp data/business.profile.example.json data/business.profile.json');
    process.exit(1);
  }
  if (path !== OPTS.profile) {
    console.warn(`⚠️  ${OPTS.profile} 이 없어 예시 프로필로 실행합니다. 실제 값으로 바꿔야 결과가 맞습니다.`);
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

// ── 수동 교정 파일 ───────────────────────────────────────────
function loadOverrides(fileName, valueKey, transform) {
  const path = join(OPTS.input, fileName);
  const map = new Map();
  if (!existsSync(path)) return map;
  const { headers, rows } = readTable(path);
  const kCol = pickColumn(headers, COL.keyword) || headers[0];
  const vCol = pickColumn(headers, [valueKey]) || headers[1];
  for (const row of rows) {
    const k = String(row[kCol] || '').toLowerCase().trim();
    if (!k) continue;
    map.set(k, transform(row[vCol]));
  }
  if (map.size > 0) console.log(`   교정 적용: ${fileName} (${map.size}건)`);
  return map;
}

// ── 수집 ─────────────────────────────────────────────────────
function collect(profile) {
  if (!existsSync(OPTS.input)) {
    console.error(`❌ 입력 폴더가 없습니다: ${OPTS.input}`);
    process.exit(1);
  }
  const files = readdirSync(OPTS.input)
    .filter((f) => /\.(csv|tsv|txt)$/i.test(f))
    .filter((f) => !/-overrides\.csv$/i.test(f));

  if (files.length === 0) {
    console.error(`❌ ${OPTS.input} 에 CSV가 없습니다.`);
    console.error('   Google Keyword Planner에서 CSV를 내보내 이 폴더에 넣으세요 (docs/seo/02-keyword-research.md §1)');
    process.exit(1);
  }

  const intentOverrides = loadOverrides('intent-overrides.csv', 'intent', (v) => String(v).trim().toLowerCase());
  const relevanceOverrides = loadOverrides('relevance-overrides.csv', 'relevance', (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.4;
  });

  const byKeyword = new Map();

  for (const file of files) {
    const { headers, rows } = readTable(join(OPTS.input, file));
    const kCol = pickColumn(headers, COL.keyword);
    if (!kCol) { console.warn(`   ⚠️  ${file}: 키워드 컬럼을 찾지 못해 건너뜁니다`); continue; }
    const vCol = pickColumn(headers, COL.volume);
    const cCol = pickColumn(headers, COL.competition);
    const ciCol = pickColumn(headers, COL.competitionIndex);
    const cpcLowCol = pickColumn(headers, COL.cpcLow);
    const cpcHighCol = pickColumn(headers, COL.cpcHigh);

    let count = 0;
    for (const row of rows) {
      const keyword = String(row[kCol] || '').trim();
      if (!keyword) continue;
      const key = keyword.toLowerCase().replace(/\s+/g, ' ');

      const volume = vCol ? parseVolume(row[vCol]) : 0;
      const competitionIndex = parseCompetition(cCol ? row[cCol] : '', ciCol ? row[ciCol] : '');
      const cpc = cpcLowCol ? parseCurrency(row[cpcLowCol]) : 0;
      const cpcHigh = cpcHighCol ? parseCurrency(row[cpcHighCol]) : 0;

      const prev = byKeyword.get(key);
      if (prev && prev.volume >= volume) continue; // 중복은 검색량 큰 쪽 유지

      byKeyword.set(key, {
        keyword,
        language: detectLanguage(keyword),
        volume,
        volumeRaw: vCol ? String(row[vCol] || '').trim() : '',
        competitionLabel: cCol ? String(row[cCol] || '').trim() : '',
        competitionIndex,
        cpc,
        cpcHigh,
        intent: intentOverrides.get(key) || detectIntent(keyword, profile),
        relevance: relevanceOverrides.has(key) ? relevanceOverrides.get(key) : detectRelevance(keyword, profile),
        intentOverridden: intentOverrides.has(key),
        relevanceOverridden: relevanceOverrides.has(key),
        wordCount: keyword.trim().split(/\s+/).length,
        source: basename(file),
      });
      count += 1;
    }
    console.log(`   읽음: ${file} → ${count}개`);
  }
  return [...byKeyword.values()];
}

// ── 점수화 ───────────────────────────────────────────────────
function score(items, profile) {
  const maxVolume = Math.max(0, ...items.map((i) => i.volume));
  const primaryLanguage = profile.primaryLanguage || 'ko';
  for (const item of items) {
    item.primaryLanguage = primaryLanguage;
    item.score = scoreKeyword(item, { maxVolume, primaryLanguage, langBoostEnabled: OPTS.langBoost });
    item.tier = toTier(item.score, item);
    item.channels = assignChannels(item);
  }
  items.sort((a, b) => b.score - a.score || b.volume - a.volume);
  ensureTierMinimums(items, { S: 3, A: 8 });
  for (const item of items) item.channels = assignChannels(item); // 승격 반영
  return { items, maxVolume };
}

// ── 리포트 ───────────────────────────────────────────────────
const TIER_GUIDE = {
  S: '기본/보조 카테고리 · GBP 설명 첫 문장 · 홈 title/H1',
  A: 'GBP 서비스 항목 · 랜딩 페이지 1개씩 · 사진 파일명/alt',
  B: 'GBP 게시물(주 1회 로테이션) · 블로그 롱테일 · FAQ',
  C: '보류 — Google Ads 후보로만 검토',
};
const CHANNEL_GUIDE = {
  GBP: '구글맵 — 카테고리 / 설명 / 서비스 항목 / 게시물',
  WEB: '웹사이트 — title / H1 / 랜딩 페이지',
  BLOG: '블로그·게시물 — 롱테일 제목',
  ADS: 'Google Ads 후보 (집행은 별도 의사결정)',
};

function buildMarkdown(items, profile, maxVolume) {
  const active = items.filter((i) => i.tier !== 'X');
  const excluded = items.filter((i) => i.tier === 'X');
  const shown = OPTS.top > 0 ? active.slice(0, OPTS.top) : active;
  const pct = (n) => (active.length ? Math.round((n / active.length) * 100) : 0);

  const L = [];
  L.push('# 키워드 우선순위 맵 (자동 생성)');
  L.push('');
  L.push(`> 생성일: ${new Date().toISOString().slice(0, 10)}`);
  L.push(`> 사업장: ${profile.businessName || '(미설정)'} / ${profile.city || '(도시 미설정)'}`);
  L.push(`> 공식: \`100 × Volume' × Intent × Difficulty' × Relevance × LangBoost\` — docs/seo/03-keyword-scoring.md`);
  L.push('');
  L.push('## 요약');
  L.push('');
  L.push('| 항목 | 값 |');
  L.push('|---|---|');
  L.push(`| 수집 키워드 | ${items.length}개 |`);
  L.push(`| 유효 키워드 | ${active.length}개 |`);
  L.push(`| 제외(검색량 0 / 관련성 0) | ${excluded.length}개 |`);
  L.push(`| 최대 검색량 (정규화 기준) | ${maxVolume.toLocaleString()} |`);
  L.push(`| 언어 보정 | ${OPTS.langBoost ? `켜짐 (주력 언어: ${profile.primaryLanguage})` : '꺼짐'} |`);
  for (const t of ['S', 'A', 'B', 'C']) {
    const n = active.filter((i) => i.tier === t).length;
    L.push(`| Tier ${t} | ${n}개 (${pct(n)}%) |`);
  }
  L.push('');

  L.push('## Tier별 실행 배치');
  L.push('');
  for (const t of ['S', 'A', 'B', 'C']) {
    const group = shown.filter((i) => i.tier === t);
    L.push(`### Tier ${t} — ${TIER_GUIDE[t]}`);
    L.push('');
    if (group.length === 0) { L.push('_해당 없음_'); L.push(''); continue; }
    L.push('| # | 키워드 | 언어 | 점수 | 검색량 | 경쟁 | 의도 | 관련성 | 채널 |');
    L.push('|---|---|---|---|---|---|---|---|---|');
    group.forEach((i, idx) => {
      L.push(`| ${idx + 1} | ${i.keyword}${i.promoted ? ' †' : ''} | ${i.language} | **${i.score}** | ${i.volume.toLocaleString()}${i.volumeRaw.includes('-') || /[–~]/.test(i.volumeRaw) ? ' *(구간 하한)*' : ''} | ${i.competitionIndex} | ${i.intent} | ${i.relevance}${i.relevanceOverridden ? '*' : ''} | ${i.channels.join(', ') || '-'} |`);
    });
    L.push('');
  }

  L.push('## 채널별 배분');
  L.push('');
  for (const [ch, guide] of Object.entries(CHANNEL_GUIDE)) {
    const group = shown.filter((i) => i.channels.includes(ch));
    L.push(`### ${ch} — ${guide}`);
    L.push('');
    if (group.length === 0) { L.push('_해당 없음_'); L.push(''); continue; }
    group.slice(0, 30).forEach((i) => L.push(`- \`${i.score}\` **${i.keyword}** (${i.language} / ${i.intent} / 검색량 ${i.volume.toLocaleString()})`));
    if (group.length > 30) L.push(`- _...외 ${group.length - 30}개 (keyword-map.csv 참조)_`);
    L.push('');
  }

  L.push('## 제외 키워드 — 실측 수요 없음 / 관련성 없음');
  L.push('');
  L.push('> 나중에 같은 키워드를 다시 검토하는 낭비를 막기 위해 사유와 함께 보관한다.');
  L.push('');
  if (excluded.length === 0) L.push('_없음_');
  else {
    L.push('| 키워드 | 사유 |');
    L.push('|---|---|');
    excluded.slice(0, 60).forEach((i) => {
      const reason = i.relevance <= 0 ? '관련성 0 — 우리가 제공하지 않는 것' : '실측 검색량 0';
      L.push(`| ${i.keyword} | ${reason} |`);
    });
    if (excluded.length > 60) L.push(`| _...외 ${excluded.length - 60}개_ | |`);
  }
  L.push('');

  L.push('## 다음 할 일');
  L.push('');
  L.push('1. 위 표를 훑고 **"우리가 안 파는 것"** 을 `data/keywords/relevance-overrides.csv` 에 `0` 으로 넣고 재실행 (5분)');
  L.push('2. Tier S 키워드로 GBP 기본/보조 카테고리와 비즈니스 설명 첫 문장을 확정 → `docs/seo/05-google-maps-gbp.md` STEP 2');
  L.push('3. Tier A는 GBP 서비스 항목으로 개별 등록 (1페이지 1키워드 원칙)');
  L.push('4. Tier B는 게시물 12주 로테이션에 배치 → `docs/seo/06-content-ops.md` §3');
  L.push('');
  L.push('> `*` 관련성에 수동 교정이 적용된 값.');
  L.push('> `†` 절대 점수 기준에는 못 미쳤으나 상위 순위라 Tier가 승격된 항목. 수집 데이터가 적거나 상권이 작을 때 발생하며, 데이터를 더 넣으면 자연히 해소된다.');
  L.push('> 검색량의 *(구간 하한)* 은 플래너가 구간("100 – 1K")으로만 준 값을 하한(100)으로 보수 처리한 것.');
  return L.join('\n');
}

// ── 실행 ─────────────────────────────────────────────────────
console.log('🔍 키워드 우선순위 산출 시작');
const profile = loadProfile();
const collected = collect(profile);
const { items, maxVolume } = score(collected, profile);

mkdirSync(OPTS.out, { recursive: true });

const csvColumns = ['tier', 'score', 'keyword', 'language', 'volume', 'volumeRaw', 'competitionLabel',
  'competitionIndex', 'cpc', 'cpcHigh', 'intent', 'relevance', 'channels', 'wordCount', 'source'];
writeFileSync(join(OPTS.out, 'keyword-map.csv'),
  toCsv(items.map((i) => ({ ...i, channels: i.channels.join('|') })), csvColumns), 'utf8');
writeFileSync(join(OPTS.out, 'keyword-map.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  profile: { businessName: profile.businessName, city: profile.city, primaryLanguage: profile.primaryLanguage },
  options: OPTS,
  intentWeights: INTENT_WEIGHT,
  maxVolume,
  keywords: items,
}, null, 2), 'utf8');
writeFileSync(join(OPTS.out, 'keyword-map.md'), buildMarkdown(items, profile, maxVolume), 'utf8');

const active = items.filter((i) => i.tier !== 'X');
console.log(`\n✅ 완료 — 유효 ${active.length}개 / 제외 ${items.length - active.length}개`);
for (const t of ['S', 'A', 'B', 'C']) {
  console.log(`   Tier ${t}: ${active.filter((i) => i.tier === t).length}개`);
}
console.log(`\n📄 ${join(OPTS.out, 'keyword-map.md')}`);
console.log(`📄 ${join(OPTS.out, 'keyword-map.csv')}`);
console.log(`📄 ${join(OPTS.out, 'keyword-map.json')}`);
