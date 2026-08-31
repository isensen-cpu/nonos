/**
 * 실행 과제 목록 — docs/seo/checklists/ 를 추적 가능한 단위로 옮긴 것.
 * 상태는 data/progress.json 에 저장된다.
 */
export const PHASES = [
  { id: 'p0', name: '준비 (0주차)', goal: '프로필·키워드·촬영 준비를 끝낸다' },
  { id: 'p1', name: '등록·인증 (1주차)', goal: 'GBP 소유권 확인까지 통과한다' },
  { id: 'p2', name: '관련성 세팅 (2주차)', goal: '프로필 완성도 100% — 전체 효과의 60%' },
  { id: 'p3', name: '인지도 (4~12주)', goal: '리뷰·게시물·인용을 누적한다' },
  { id: 'p4', name: '측정 (매월)', goal: '숫자로 판단하고 조정한다' },
];

export const TASKS = [
  // ── P0 준비 ──────────────────────────────────────────────
  { id: 'profile', phase: 'p0', min: 15, title: '사업장 프로필 작성', how: 'npm run seo:init — 질문에 답하면 data/business.profile.json 이 만들어집니다' },
  { id: 'seeds', phase: 'p0', min: 5, title: '씨앗 키워드 생성', how: 'npm run seo:seeds → data/keywords/seeds/README.md 확인' },
  { id: 'kp-account', phase: 'p0', min: 15, title: '구글 광고 계정 만들기(무료)', how: 'ads.google.com → 전문가 모드 전환 → 캠페인 없이 계정 만들기. 결제수단 등록 불필요' },
  { id: 'kp-export', phase: 'p0', min: 40, title: '키워드 플래너에서 CSV 받기', how: '씨앗 묶음을 10개씩 조회 → CSV 다운로드 → data/keywords/ 에 저장' },
  { id: 'score', phase: 'p0', min: 10, title: '키워드 우선순위 산출', how: 'npm run seo:score → data/keywords/output/keyword-map.md 확인' },
  { id: 'nap-fix', phase: 'p0', min: 20, title: 'NAP 표준 표기 확정', how: '간판·사업자등록증과 100% 동일한 상호/주소/전화 하나로 통일 → checklists/nap-consistency.md' },
  { id: 'photos-shoot', phase: 'p0', min: 90, title: '사진 20장 촬영', how: 'checklists/photo-specs.md 규격대로. 외관은 낮/밤 각각, 가로로 촬영' },
  { id: 'photos-rename', phase: 'p0', min: 20, title: '사진 파일명 영문으로 변경', how: 'port-moody-korean-restaurant-interior-01.jpg 형식. 한글 파일명은 구글이 못 읽습니다' },
  { id: 'baseline', phase: 'p0', min: 10, title: 'KPI 기준선 기록', how: 'data/kpi-log.md 의 baseline 칸을 채웁니다 (지금은 대부분 0)' },

  // ── P1 등록·인증 ─────────────────────────────────────────
  { id: 'check-existing', phase: 'p1', min: 10, title: '기존 프로필 존재 확인', how: 'business.google.com 에서 상호 검색. 구글이 자동 생성해둔 게 있으면 신규 생성이 아니라 소유권 주장' },
  { id: 'category', phase: 'p1', min: 20, title: '기본 카테고리 1개 확정', how: '매출 1순위 업종의 가장 좁은 카테고리 → docs/seo/08-multi-vertical-gbp.md §2' },
  { id: 'register', phase: 'p1', min: 30, title: 'GBP 등록 + 지도 핀 조정', how: '주소 입력 후 핀을 실제 출입구로 드래그' },
  { id: 'verify-video', phase: 'p1', min: 30, title: '소유권 확인 (동영상 촬영)', how: '끊김 없이 한 번에: 간판 → 주변 거리 → 출입구 → 내부 → 영업 도구 → 사업자 증빙. 순서를 한 번 연습하고 찍으세요' },
  { id: 'verify-wait', phase: 'p1', min: 0, title: '승인 대기 (3~7일)', how: '기다리는 동안 P2의 설명·서비스 문구를 미리 작성합니다' },

  // ── P2 관련성 세팅 ───────────────────────────────────────
  { id: 'sub-categories', phase: 'p2', min: 15, title: '보조 카테고리 등록', how: '실제 제공하는 것만. 관련 없는 카테고리는 기본 카테고리의 관련성을 희석시킵니다' },
  { id: 'description', phase: 'p2', min: 30, title: '비즈니스 설명 750자', how: 'templates/gbp-copy/01-business-description.md 채우기. 첫 100자에 Tier S 키워드 + 도시명' },
  { id: 'services', phase: 'p2', min: 60, title: '서비스/메뉴 항목 12개 이상 등록', how: '업종별 최소 3개씩. 이름 + 가격 + 300자 설명. 각 항목이 검색 매칭 단위가 됩니다' },
  { id: 'attributes', phase: 'p2', min: 15, title: '속성(Attributes) 전부 채우기', how: '주차·배달·예약·결제수단·한국어 응대. 필터 검색 노출에 직결됩니다' },
  { id: 'hours', phase: 'p2', min: 15, title: '영업시간 + 공휴일 예외 등록', how: '브레이크타임이 있으면 시간대를 분리 등록' },
  { id: 'photos-upload', phase: 'p2', min: 20, title: '사진 첫 10장 업로드', how: '로고·커버·외관·내부 우선. 나머지는 주 2~3장씩 나눠서' },
  { id: 'qna', phase: 'p2', min: 30, title: 'Q&A 씨앗 5개 등록', how: 'templates/gbp-copy/04-qna.md — 사장이 직접 질문·답변을 올릴 수 있습니다(정책상 허용)' },
  { id: 'review-qr', phase: 'p2', min: 30, title: '리뷰 요청 QR 제작·비치', how: 'GBP → 리뷰 요청 링크 복사 → QR 변환 → 계산대 스탠드. 대가 제공은 금지' },
  { id: 'completeness', phase: 'p2', min: 10, title: '프로필 완성도 100% 확인', how: 'GBP 관리 화면 상단에 미완료 항목이 0이어야 합니다' },

  // ── P3 인지도 ────────────────────────────────────────────
  { id: 'post-w1', phase: 'p3', min: 15, title: '게시물 1주차', how: 'templates/gbp-copy/03-posts-12weeks.md 1주차. 사진 1장 + CTA 버튼 필수' },
  { id: 'post-w2', phase: 'p3', min: 15, title: '게시물 2주차', how: '같은 템플릿 2주차' },
  { id: 'post-w3', phase: 'p3', min: 15, title: '게시물 3주차', how: '같은 템플릿 3주차' },
  { id: 'post-w4', phase: 'p3', min: 15, title: '게시물 4주차', how: '같은 템플릿 4주차' },
  { id: 'reviews-10', phase: 'p3', min: 0, title: '리뷰 10개 확보', how: '주 2~3개 페이스. 하루에 몰아받으면 스팸 판정' },
  { id: 'reply-all', phase: 'p3', min: 15, title: '리뷰 답글률 100% 유지', how: 'templates/gbp-copy/02-review-replies.md. 1~2점은 24시간 내, 방어하지 말 것' },
  { id: 'citations', phase: 'p3', min: 90, title: 'NAP 인용 10곳 등록', how: 'checklists/nap-consistency.md 의 표를 채우며 진행' },
  { id: 'photos-weekly', phase: 'p3', min: 10, title: '사진 주 2~3장 추가', how: '최신성도 신호입니다. 6개월 공백은 활동성 감점' },
  { id: 'reviews-30', phase: 'p3', min: 0, title: '리뷰 누적 30개 / 평점 4.5+', how: '3개월 목표' },

  // ── P4 측정 ──────────────────────────────────────────────
  { id: 'kpi-monthly', phase: 'p4', min: 20, title: '월간 KPI 기록', how: 'GBP 인사이트 + data/kpi-log.md' },
  { id: 'rank-check', phase: 'p4', min: 15, title: 'Tier S 키워드 순위 확인', how: '반드시 시크릿 창 + 위치 설정. 매장에서 500m/1km/3km 각각' },
  { id: 'keyword-refresh', phase: 'p4', min: 20, title: '키워드맵 갱신', how: 'GSC 검색어 CSV 추가 → npm run seo:score 재실행' },
];

export const TASK_BY_ID = new Map(TASKS.map((t) => [t.id, t]));
