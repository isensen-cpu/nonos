// AI 상품 등급 (§8) + 실행 점수 시스템 (§17)

import type {
  ProductInput,
  FitScoreResult,
  ProductGrade,
  GradeLetter,
  ExecutionInput,
  ExecutionScoreResult,
} from "./types";
import { calculateTalkDealProfit, estimateRepeatScore } from "./calculations";

const GRADE_TITLE: Record<GradeLetter, string> = {
  S: "즉시 톡딜/오늘의딜 확장 가능",
  A: "톡딜 진행 추천",
  B: "조건부 진행 가능",
  C: "가격·구성·후기 보완 필요",
  D: "현재 구조로는 비추천",
};

/**
 * §8 AI 상품 등급
 * 적합성 점수, 마진율, 후기 수, 평점, 반복구매성, 채널 활용 가능성을 0~100 가중 점수로 환산 후 등급화.
 */
export function gradeProduct(
  input: ProductInput,
  fit: FitScoreResult,
): ProductGrade {
  const reasons: string[] = [];

  // 적합성 (35점)
  const fitPct = fit.maxScore > 0 ? fit.totalScore / fit.maxScore : 0;
  const fitPoints = fitPct * 35;
  reasons.push(`톡딜 적합성 ${fit.totalScore}/${fit.maxScore}점 (${fit.grade})`);

  // 마진율 (25점) — 톡딜 마진율 30%를 만점 기준
  const td = calculateTalkDealProfit(input);
  const marginPoints = Math.max(0, Math.min(1, td.marginRate / 30)) * 25;
  reasons.push(`톡딜 마진율 ${td.marginRate}%`);

  // 후기 (15점) — 300개를 만점 기준
  const reviews = input.currentReviewCount ?? 0;
  const reviewPoints = Math.max(0, Math.min(1, reviews / 300)) * 15;

  // 평점 (10점) — 5.0 만점
  const rating = input.currentRating ?? 0;
  const ratingPoints = Math.max(0, Math.min(1, rating / 5)) * 10;
  if (reviews > 0 || rating > 0) {
    reasons.push(`후기 ${reviews.toLocaleString()}개 / 평점 ${rating || "-"}`);
  } else {
    reasons.push("후기·평점 데이터 부족 (체험딜로 확보 필요)");
  }

  // 반복구매성 (8점)
  const repeat = estimateRepeatScore(input.category);
  const repeatPoints = (repeat / 2) * 8;

  // 채널 활용 가능성 (7점) — 5000명 만점 기준
  const friends = input.currentFriendCount ?? 0;
  const channelPoints = Math.max(0, Math.min(1, friends / 5000)) * 7;
  reasons.push(`채널 친구 ${friends.toLocaleString()}명`);

  const total =
    fitPoints +
    marginPoints +
    reviewPoints +
    ratingPoints +
    repeatPoints +
    channelPoints;

  // 손익 위험 시 강제 하향
  const negativeMargin = td.netMargin <= 0;

  let grade: GradeLetter;
  if (negativeMargin) {
    grade = "D";
    reasons.unshift("톡딜 순마진이 0 이하 — 수익 구조부터 재설계 필요");
  } else if (total >= 80) {
    grade = "S";
  } else if (total >= 65) {
    grade = "A";
  } else if (total >= 50) {
    grade = "B";
  } else if (total >= 35) {
    grade = "C";
  } else {
    grade = "D";
  }

  const description = buildGradeDescription(grade);

  return { grade, title: GRADE_TITLE[grade], description, reasons };
}

function buildGradeDescription(grade: GradeLetter): string {
  switch (grade) {
    case "S":
      return "후기·마진·채널이 모두 강합니다. 오늘의딜/오늘공구로 확장하며 브랜드화를 노리세요.";
    case "A":
      return "톡딜 진행을 추천합니다. 메시지 캠페인과 재구매 설계로 친구를 자산화하세요.";
    case "B":
      return "조건부 진행이 가능합니다. 약한 항목(후기/마진/구성)을 보완하면 A로 올라설 수 있습니다.";
    case "C":
      return "가격·구성·후기 보완이 필요합니다. 체험딜로 후기를 모으고 구성을 다듬으세요.";
    case "D":
      return "현재 구조로는 비추천입니다. 수익 구조와 상품 경쟁력을 먼저 재설계하세요.";
  }
}

/** §17 실행 점수 항목 라벨 (입력 순서 유지) */
export const EXECUTION_ITEMS: { key: keyof ExecutionInput; label: string }[] = [
  { key: "체험딜", label: "체험딜" },
  { key: "친구쿠폰", label: "친구쿠폰" },
  { key: "공유설정", label: "공유설정" },
  { key: "스토어보드", label: "스토어보드" },
  { key: "메시지", label: "메시지" },
  { key: "후기관리", label: "후기관리" },
];

export const DEFAULT_EXECUTION_INPUT: ExecutionInput = {
  체험딜: 3,
  친구쿠폰: 3,
  공유설정: 3,
  스토어보드: 3,
  메시지: 3,
  후기관리: 3,
};

/** §17 실행력 지수 = 각 항목 점수 평균 */
export function calculateExecutionScore(
  input: ExecutionInput,
): ExecutionScoreResult {
  const items = EXECUTION_ITEMS.map(({ key, label }) => ({
    label,
    score: clampScore(input[key]),
  }));
  const index =
    items.reduce((s, i) => s + i.score, 0) / (items.length || 1);
  const rounded = Math.round(index * 10) / 10;

  let verdict: ExecutionScoreResult["verdict"];
  if (rounded >= 4.5) verdict = "매우 우수";
  else if (rounded >= 3.5) verdict = "실행 가능";
  else if (rounded >= 2.5) verdict = "보완 필요";
  else verdict = "전략 재설계 필요";

  return { items, index: rounded, verdict };
}

function clampScore(n: number): number {
  if (Number.isNaN(n)) return 1;
  return Math.max(1, Math.min(5, Math.round(n)));
}
