"use client";

import type { StrategyReport } from "@/lib/types";
import { formatWon } from "@/lib/format";
import { Pill, ProgressBar } from "./ui";

const GRADE_TONE: Record<string, "good" | "brand" | "warn" | "bad"> = {
  S: "good",
  A: "good",
  B: "brand",
  C: "warn",
  D: "bad",
};

export default function ReportHeader({ report }: { report: StrategyReport }) {
  const { grade, fitScore, talkDealProfit, dealRecommendation, groupDeal, warnings } =
    report;

  return (
    <div className="card border-l-4 border-l-ink-900">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-ink-900 text-[10px] font-bold text-white">
          ①
        </span>
        <h3 className="text-sm font-bold text-ink-800">전략 요약</h3>
      </div>

      {/* 경고 (§22) */}
      {warnings.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {warnings.map((w, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                w.level === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <span className="font-bold">
                {w.level === "error" ? "⚠ 오류" : "⚠ 주의"}
              </span>
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* 등급 + 핵심 지표 */}
      <div className="grid gap-3 sm:grid-cols-[auto,1fr]">
        <div className="flex flex-col items-center justify-center rounded-xl bg-ink-900 px-6 py-4 text-white">
          <span className="text-[11px] text-ink-300">상품 등급</span>
          <span className="text-4xl font-black leading-none">{grade.grade}</span>
          <div className="mt-2">
            <Pill tone={GRADE_TONE[grade.grade]}>{grade.title}</Pill>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Mini label="톡딜 적합성" value={`${fitScore.totalScore}/${fitScore.maxScore}`} />
            <Mini label="톡딜 순마진" value={formatWon(talkDealProfit.netMargin)} />
            <Mini label="추천 딜" value={dealRecommendation.primary} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-[11px] text-ink-500">
              <span>적합성 {fitScore.grade}</span>
              <span>오늘공구 {groupDeal.verdict}</span>
            </div>
            <ProgressBar
              value={fitScore.totalScore}
              max={fitScore.maxScore}
              tone={
                fitScore.grade === "톡딜 적극 추천"
                  ? "good"
                  : fitScore.grade === "가능성 있음"
                    ? "brand"
                    : "warn"
              }
            />
          </div>
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-ink-50 p-3 text-xs leading-relaxed text-ink-600">
        {report.summary}
      </p>

      {/* 등급 사유 */}
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {grade.reasons.map((r) => (
          <li
            key={r}
            className="rounded bg-ink-100 px-2 py-0.5 text-[11px] text-ink-600"
          >
            {r}
          </li>
        ))}
      </ul>

      {/* 적합성 항목 상세 (§7) */}
      <details className="mt-3 rounded-lg border border-ink-100 bg-white p-3">
        <summary className="cursor-pointer text-xs font-semibold text-ink-600">
          톡딜 적합성 항목별 점수 보기
        </summary>
        <div className="mt-2 space-y-2">
          {fitScore.criteria.map((c) => (
            <div key={c.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink-700">{c.label}</span>
                <span className="text-ink-500">
                  {c.score}/{c.max}점
                </span>
              </div>
              <ProgressBar
                value={c.score}
                max={c.max}
                tone={c.score === c.max ? "good" : c.score === 0 ? "bad" : "warn"}
              />
              <p className="mt-0.5 text-[11px] text-ink-400">{c.reason}</p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-ink-50/60 p-2 text-center">
      <div className="text-[11px] text-ink-400">{label}</div>
      <div className="text-sm font-bold text-ink-800">{value}</div>
    </div>
  );
}
