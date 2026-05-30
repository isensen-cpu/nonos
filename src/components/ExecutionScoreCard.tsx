"use client";

import { useMemo, useState } from "react";
import type { ExecutionInput } from "@/lib/types";
import {
  EXECUTION_ITEMS,
  DEFAULT_EXECUTION_INPUT,
  calculateExecutionScore,
} from "@/lib/scoring";
import { SectionCard, Pill } from "./ui";

const VERDICT_TONE: Record<string, "good" | "brand" | "warn" | "bad"> = {
  "매우 우수": "good",
  "실행 가능": "brand",
  "보완 필요": "warn",
  "전략 재설계 필요": "bad",
};

const SCORE_HINT = "1 미실행 · 2 부족 · 3 보통 · 4 대부분 실행 · 5 적극 실행";

export default function ExecutionScoreCard() {
  const [input, setInput] = useState<ExecutionInput>(DEFAULT_EXECUTION_INPUT);

  const result = useMemo(() => calculateExecutionScore(input), [input]);

  return (
    <SectionCard index="⑧" title="실행 점수 평가">
      <p className="mb-3 text-[11px] text-ink-400">{SCORE_HINT}</p>

      <div className="space-y-2.5">
        {EXECUTION_ITEMS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-sm font-medium text-ink-700">
              {label}
            </span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={input[key]}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, [key]: Number(e.target.value) }))
              }
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-ink-100 accent-brand-600"
              aria-label={`${label} 실행 점수`}
            />
            <span className="w-5 text-right text-sm font-bold text-ink-800">
              {input[key]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-ink-900 p-4 text-white">
        <div>
          <div className="text-xs text-ink-300">실행력 지수 (평균)</div>
          <div className="text-3xl font-black leading-none">{result.index}</div>
        </div>
        <Pill tone={VERDICT_TONE[result.verdict]}>{result.verdict}</Pill>
      </div>
    </SectionCard>
  );
}
