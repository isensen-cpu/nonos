"use client";

import type { StrategyReport } from "@/lib/types";
import { SectionCard, Pill } from "./ui";

export default function DealRecommendationCard({
  report,
}: {
  report: StrategyReport;
}) {
  const { dealRecommendation: rec, groupDeal: g } = report;

  const groupTone =
    g.verdict === "오늘공구 추천"
      ? "good"
      : g.verdict === "보완 후 도전 가능"
        ? "warn"
        : "bad";

  return (
    <SectionCard index="③" title="추천 딜 유형">
      <div className="mb-3 rounded-lg bg-ink-900 p-4 text-white">
        <div className="text-xs text-ink-300">우선 추천</div>
        <div className="text-2xl font-black">{rec.primary}</div>
        <p className="mt-1 text-xs leading-relaxed text-ink-200">{rec.note}</p>
      </div>

      <div className="space-y-2">
        {rec.candidates.map((c) => (
          <div
            key={c.type}
            className={`rounded-lg border p-3 ${
              c.recommended
                ? "border-emerald-300 bg-emerald-50/50"
                : "border-ink-100 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-ink-800">{c.type}</span>
              {c.recommended ? (
                <Pill tone="good">추천</Pill>
              ) : (
                <Pill tone="neutral">조건 미충족</Pill>
              )}
            </div>
            <p className="mt-1 text-xs text-ink-500">{c.rationale}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {c.matchedConditions.map((m) => (
                <span
                  key={m}
                  className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] text-emerald-700"
                >
                  ✓ {m}
                </span>
              ))}
              {c.unmetConditions.map((m) => (
                <span
                  key={m}
                  className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] text-ink-400"
                >
                  · {m}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 오늘공구 판단 (§10) */}
      <div className="mt-4 rounded-lg border border-ink-100 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-ink-800">오늘공구 가능성</span>
          <Pill tone={groupTone}>
            {g.verdict} ({g.metCount}/4)
          </Pill>
        </div>
        <ul className="space-y-1">
          {g.conditions.map((c) => (
            <li
              key={c.label}
              className="flex items-start justify-between gap-2 text-xs"
            >
              <span className={c.met ? "text-ink-700" : "text-ink-400"}>
                {c.met ? "✓" : "✗"} {c.label}
              </span>
              <span className="shrink-0 text-ink-400">{c.detail}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-ink-500">{g.message}</p>
      </div>
    </SectionCard>
  );
}
