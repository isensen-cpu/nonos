/**
 * CSV/TSV 리더 — Google Keyword Planner 내보내기 파일을 그대로 읽는다.
 *
 * 플래너 CSV의 특징 (사용자가 파일을 손대지 않아도 되도록 전부 여기서 흡수):
 *  - 인코딩이 UTF-16LE(BOM 포함)인 경우가 있다
 *  - 구분자가 탭인 경우가 있다
 *  - 헤더 앞에 안내 문구 2~3줄이 붙는다
 */
import { readFileSync } from 'node:fs';

/** 헤더 행을 찾을 때 사용하는 신호 (한/영) */
const HEADER_HINTS = ['keyword', '키워드', 'query', '검색어'];

function decode(buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xfe) return buffer.toString('utf16le', 2);
  if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    const swapped = Buffer.from(buffer.subarray(2));
    swapped.swap16();
    return swapped.toString('utf16le');
  }
  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) return buffer.toString('utf8', 3);
  return buffer.toString('utf8');
}

function detectDelimiter(line) {
  const counts = [
    ['\t', (line.match(/\t/g) || []).length],
    [',', (line.match(/,/g) || []).length],
    [';', (line.match(/;/g) || []).length],
  ];
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ',';
}

/** 따옴표 이스케이프를 지원하는 한 줄 파서 */
function splitLine(line, delimiter) {
  const out = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') { field += '"'; i += 1; }
        else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) { out.push(field); field = ''; }
    else field += ch;
  }
  out.push(field);
  return out.map((v) => v.trim());
}

/**
 * 파일을 읽어 { headers, rows } 로 반환한다.
 * rows 는 헤더명을 키로 갖는 객체 배열.
 */
export function readTable(filePath) {
  const text = decode(readFileSync(filePath)).replace(/\r\n/g, '\n');
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  // 헤더 행 탐색 — 상단 안내 문구를 건너뛴다.
  // "Keyword Stats 2026-08-31" 같은 안내 줄도 'keyword'를 포함하므로,
  // 구분자가 실제로 존재해 2개 이상 컬럼으로 쪼개지는 줄만 헤더로 인정한다.
  let headerIndex = lines.findIndex((line) => {
    const lower = line.toLowerCase();
    if (!HEADER_HINTS.some((h) => lower.includes(h))) return false;
    const delimiter = detectDelimiter(line);
    return splitLine(line, delimiter).filter((f) => f !== '').length >= 2;
  });
  if (headerIndex < 0) headerIndex = 0;

  const delimiter = detectDelimiter(lines[headerIndex]);
  const headers = splitLine(lines[headerIndex], delimiter);

  const rows = [];
  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    const values = splitLine(lines[i], delimiter);
    if (values.every((v) => v === '')) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
    rows.push(row);
  }
  return { headers, rows };
}

/** 헤더 이름이 표기마다 달라지므로, 후보 목록으로 컬럼을 찾는다 */
export function pickColumn(headers, candidates) {
  const normalized = headers.map((h) => h.toLowerCase().replace(/\s+/g, ' ').trim());
  for (const candidate of candidates) {
    const target = candidate.toLowerCase();
    const exact = normalized.indexOf(target);
    if (exact >= 0) return headers[exact];
  }
  for (const candidate of candidates) {
    const target = candidate.toLowerCase();
    const partial = normalized.findIndex((h) => h.includes(target));
    if (partial >= 0) return headers[partial];
  }
  return null;
}

/** CSV 출력용 이스케이프 */
export function toCsv(rows, columns) {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.join(','), ...rows.map((r) => columns.map((c) => esc(r[c])).join(','))].join('\n');
}
