"use client";

import { useMemo } from "react";
import type { ProductInput } from "@/lib/types";
import {
  calculateNormalProfit,
  calculateTalkDealProfit,
  scoreTalkDealFit,
} from "@/lib/calculations";
import { gradeProduct } from "@/lib/scoring";
import { recommendDealType } from "@/lib/dealRecommendation";
import { formatWon } from "@/lib/format";
import { Pill, Stat, ProgressBar } from "./ui";

const GRADE_TONE: Record<string, "good" | "brand" | "warn" | "bad"> = {
  S: "good",
  A: "good",
  B: "brand",
  C: "warn",
  D: "bad",
};

export default function StrategySummary({ input }: { input: ProductInput }) {
  const valid = input.salePrice > 0 && input.supplyCost > 0;

  const data = useMemo(() => {
    if (!valid) return null;
    const normal = calculateNormalProfit(input);
    const talk = calculateTalkDealProfit(input);
    const fit = scoreTalkDealFit(input);
    const grade = gradeProduct(input, fit);
    const deal = recommendDealType(input, fit);
    return { normal, talk, fit, grade, deal };
  }, [input, valid]);

  return (
    <div className="card sticky top-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-800">실시간 전략 요약</h3>
        <Pill tone="brand">LIVE</Pill>
      </div>

      {!data ? (
        <p className="rounded-lg border border-dashed border-ink-200 bg-ink-50 p-6 text-center text-sm text-ink-400">
          판매가와 공급가를 입력하면
          <br />
          실시간 요약이 나타납니다.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-ink-900 p-4 text-white">
            <div>
              <div className="text-xs text-ink-300">AI 상품 등급</div>
              <div className="text-3xl font-black leading-none">
                {data.grade.grade}
              </div>
            </div>
            <div className="text-right">
              <Pill tone={GRADE_TONE[data.grade.grade]}>{data.grade.title}</Pill>
              <div className="mt-1 text-xs text-ink-300">
                추천: {data.deal.primary}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-ink-600">
              <span>톡딜 적합성</span>
              <span>
                {data.fit.totalScore} / {data.fit.maxScore}점 · {data.fit.grade}
              </span>
            </div>
            <ProgressBar
              value={data.fit.totalScore}
              max={data.fit.maxScore}
              tone={
                data.fit.grade === "톡딜 적극 추천"
                  ? "good"
                  : data.fit.grade === "가능성 있음"
                    ? "brand"
                    : "warn"
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Stat
              label="톡딜 순마진"
              value={formatWon(data.talk.netMargin)}
              tone={data.talk.netMargin > 0 ? "good" : "bad"}
              hint={`마진율 ${data.talk.marginRate}%`}
            />
            <Stat
              label="일반판매 순마진"
              value={formatWon(data.normal.netMargin)}
              tone={data.normal.netMargin > 0 ? "neutral" : "bad"}
              hint={`마진율 ${data.normal.marginRate}%`}
            />
          </div>

          <p className="text-xs leading-relaxed text-ink-500">
            {data.fit.summary}
          </p>
        </div>
      )}
    </div>
  );
}
