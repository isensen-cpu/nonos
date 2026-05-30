"use client";

import type { StrategyReport } from "@/lib/types";
import { SectionCard, Pill } from "./ui";

export default function ReviewStrategyCard({
  report,
}: {
  report: StrategyReport;
}) {
  const r = report.reviewStrategy;

  return (
    <SectionCard index="⑥" title="후기 확보 전략">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-ink-600">
          현재 후기 {r.currentReviewCount.toLocaleString()}개
        </span>
        <Pill tone="brand">{r.bucket}개 구간</Pill>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-ink-600">{r.summary}</p>

      <ul className="mb-3 space-y-1.5">
        {r.tactics.map((t) => (
          <li key={t} className="flex items-center gap-2 text-sm text-ink-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
              ✓
            </span>
            {t}
          </li>
        ))}
      </ul>

      <div className="rounded-lg bg-ink-50 p-3">
        <div className="mb-1 text-[11px] font-semibold text-ink-400">
          후기 성장 흐름
        </div>
        <div className="text-xs font-medium text-ink-700">{r.flow}</div>
      </div>
    </SectionCard>
  );
}
