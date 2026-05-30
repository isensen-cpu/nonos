// 표시용 포맷 유틸 — 금액은 원화(₩), 정수 기준

export function formatWon(n: number): string {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

export function formatPercent(n: number): string {
  return `${Math.round(n * 10) / 10}%`;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}
