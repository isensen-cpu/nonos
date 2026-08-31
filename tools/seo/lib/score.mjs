/**
 * 우선순위 점수화 — docs/seo/03-keyword-scoring.md 의 공식을 그대로 구현
 *
 *   priority = 100 × Volume' × Intent × Difficulty' × Relevance × LangBoost
 */
import { INTENT_WEIGHT } from './classify.mjs';

export const LANG_BOOST = 1.15;

/** 검색량 로그 정규화 — 롱테일이 과소평가되는 것을 막는다 */
export function normalizeVolume(volume, maxVolume) {
  if (maxVolume <= 0) return 0;
  return Math.log10(volume + 1) / Math.log10(maxVolume + 1);
}

/** 경쟁도 감점은 최대 60%까지만 — 경쟁이 높다는 건 돈이 된다는 신호이기도 하다 */
export function difficultyFactor(competitionIndex) {
  return 1 - (Math.min(100, Math.max(0, competitionIndex)) / 100) * 0.6;
}

export function scoreKeyword(item, { maxVolume, primaryLanguage, langBoostEnabled }) {
  const volumeFactor = normalizeVolume(item.volume, maxVolume);
  const intentFactor = INTENT_WEIGHT[item.intent] ?? 0.5;
  const diffFactor = difficultyFactor(item.competitionIndex);
  const langFactor = langBoostEnabled && item.language !== primaryLanguage ? LANG_BOOST : 1;
  const raw = 100 * volumeFactor * intentFactor * diffFactor * item.relevance * langFactor;
  return Math.round(Math.min(100, raw) * 10) / 10;
}

export function toTier(score, { volume, relevance }) {
  if (volume <= 0 || relevance <= 0) return 'X';
  if (score >= 70) return 'S';
  if (score >= 50) return 'A';
  if (score >= 30) return 'B';
  return 'C';
}

/**
 * Tier 최소 인원 보정.
 *
 * 절대 점수만 쓰면 데이터가 적거나(플래너 구간값만 있는 경우) 지역 상권이 작을 때
 * S가 하나도 안 나와 "무엇부터 할지"를 못 정하게 된다.
 * 점수 순 상위 항목을 최소 개수만큼 승격시키고, 승격된 항목은 promoted 로 표시해
 * 리포트에서 절대 기준 통과분과 구분한다.
 */
export function ensureTierMinimums(items, minimums = { S: 3, A: 8 }) {
  const active = items.filter((i) => i.tier !== 'X').sort((a, b) => b.score - a.score);
  const promote = (targetTier, minCount) => {
    const current = active.filter((i) => i.tier === targetTier).length;
    if (current >= minCount) return;
    let need = minCount - current;
    for (const item of active) {
      if (need === 0) break;
      if (item.tier === targetTier) continue;
      if (targetTier === 'S' || item.tier !== 'S') {
        item.tier = targetTier;
        item.promoted = true;
        need -= 1;
      }
    }
  };
  promote('S', minimums.S);
  // A는 S 다음 구간 — S로 승격된 것을 제외하고 채운다
  const afterS = active.filter((i) => i.tier !== 'S');
  const currentA = afterS.filter((i) => i.tier === 'A').length;
  let needA = Math.max(0, minimums.A - currentA);
  for (const item of afterS) {
    if (needA === 0) break;
    if (item.tier === 'A') continue;
    item.tier = 'A';
    item.promoted = true;
    needA -= 1;
  }
  return items;
}

/** 채널 배분 — docs/seo/03 §3 */
export function assignChannels(item) {
  const channels = [];
  const { tier, intent, cpc } = item;
  if (['S', 'A'].includes(tier) && ['local', 'transactional'].includes(intent)) channels.push('GBP');
  if (['S', 'A'].includes(tier)) channels.push('WEB');
  if (tier === 'B' && intent === 'commercial') channels.push('WEB');
  if (tier === 'B' || (item.language !== item.primaryLanguage && item.wordCount >= 3)) channels.push('BLOG');
  if (intent === 'transactional' && cpc > 0) channels.push('ADS');
  return [...new Set(channels)];
}
