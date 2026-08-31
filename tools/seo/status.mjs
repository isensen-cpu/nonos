#!/usr/bin/env node
/**
 * 실행 현황판 — 지금 무엇을 해야 하는지 한 화면으로 보여준다.
 *
 *   npm run seo:status              현황 + 다음 할 일
 *   npm run seo:status -- --done register       완료 표시
 *   npm run seo:status -- --undo register       완료 취소
 *   npm run seo:status -- --all                 전체 과제 목록
 *
 * 상태 저장: data/progress.json
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { PHASES, TASKS, TASK_BY_ID } from './lib/tasks.mjs';

const STATE = 'data/progress.json';
const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };

const state = existsSync(STATE)
  ? JSON.parse(readFileSync(STATE, 'utf8'))
  : { startedAt: new Date().toISOString().slice(0, 10), done: {} };

if (!state.startedAt) { state.startedAt = new Date().toISOString().slice(0, 10); }
const save = () => writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n', 'utf8');

// ── 완료/취소 처리 ───────────────────────────────────────────
for (const [arg, apply] of [['--done', true], ['--undo', false]]) {
  const id = flag(arg);
  if (!id) continue;
  if (!TASK_BY_ID.has(id)) {
    console.error(`❌ 그런 과제가 없습니다: ${id}`);
    console.error(`   목록 보기: npm run seo:status -- --all`);
    process.exit(1);
  }
  if (apply) state.done[id] = new Date().toISOString().slice(0, 10);
  else delete state.done[id];
  save();
  console.log(`${apply ? '✅ 완료' : '↩️  취소'}: ${TASK_BY_ID.get(id).title}\n`);
}

// ── 자동 감지 — 파일이 있으면 완료로 친다 ────────────────────
const autoDetect = () => {
  const marks = [];
  if (existsSync('data/business.profile.json') && !/[<>]/.test(readFileSync('data/business.profile.json', 'utf8'))) marks.push('profile');
  if (existsSync('data/keywords/seeds/README.md')) marks.push('seeds');
  if (existsSync('data/keywords/output/keyword-map.md')) marks.push('score');
  for (const id of marks) if (!state.done[id]) state.done[id] = new Date().toISOString().slice(0, 10);
  if (marks.length) save();
};
autoDetect();

// ── 렌더링 ───────────────────────────────────────────────────
const isDone = (t) => Boolean(state.done[t.id]);
const bar = (ratio, width = 24) => {
  const filled = Math.round(ratio * width);
  return `${'█'.repeat(filled)}${'░'.repeat(width - filled)}`;
};

const doneCount = TASKS.filter(isDone).length;
console.log('\n📍 구글맵 상위노출 진행 현황');
console.log(`   시작일 ${state.startedAt}   ${bar(doneCount / TASKS.length)}  ${doneCount}/${TASKS.length} (${Math.round((doneCount / TASKS.length) * 100)}%)\n`);

for (const phase of PHASES) {
  const tasks = TASKS.filter((t) => t.phase === phase.id);
  const n = tasks.filter(isDone).length;
  const mark = n === tasks.length ? '✅' : n > 0 ? '🔸' : '⬜';
  console.log(`${mark} ${phase.name}  ${n}/${tasks.length} — ${phase.goal}`);
}

if (argv.includes('--all')) {
  console.log('\n── 전체 과제 ──────────────────────────────────');
  for (const phase of PHASES) {
    console.log(`\n[${phase.name}]`);
    for (const t of TASKS.filter((x) => x.phase === phase.id)) {
      console.log(`  ${isDone(t) ? '✅' : '⬜'} ${t.id.padEnd(18)} ${t.title}${t.min ? ` (${t.min}분)` : ''}`);
    }
  }
  console.log('');
  process.exit(0);
}

// ── 다음 할 일 3개 ───────────────────────────────────────────
const next = TASKS.filter((t) => !isDone(t)).slice(0, 3);
if (next.length === 0) {
  console.log('\n🎉 전체 과제 완료. 이제 매월 P4(측정)만 반복하면 됩니다.');
  console.log('   npm run seo:status -- --undo kpi-monthly   ← 다음 달 다시 열기\n');
} else {
  console.log('\n── 지금 할 일 ─────────────────────────────────\n');
  next.forEach((t, i) => {
    console.log(`${i + 1}. ${t.title}${t.min ? `  (약 ${t.min}분)` : ''}`);
    console.log(`   ${t.how}`);
    console.log(`   끝나면: npm run seo:status -- --done ${t.id}\n`);
  });
  const totalMin = next.reduce((s, t) => s + t.min, 0);
  if (totalMin > 0) console.log(`   위 3개 합계 약 ${totalMin}분\n`);
}
