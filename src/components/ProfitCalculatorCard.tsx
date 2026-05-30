"use client";

import type { StrategyReport } from "@/lib/types";
import { formatWon } from "@/lib/format";
import { SectionCard, Stat } from "./ui";

export default function ProfitCalculatorCard({
  report,
}: {
  report: StrategyReport;
}) {
  const { normalProfit: n, talkDealProfit: t, blendedMargin: b, ltv } = report;

  return (
    <SectionCard index="②" title="수익 계산">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* 일반판매 */}
        <div className="rounded-lg border border-ink-100 p-3">
          <div className="mb-2 text-xs font-bold text-ink-500">
            일반판매 (수수료 {Math.round(n.feeRate * 1000) / 10}%)
          </div>
          <Row label="판매가" value={formatWon(n.salePrice)} />
          <Row label="공급가" value={`- ${formatWon(n.supplyCost)}`} />
          <Row label="배송비" value={`- ${formatWon(n.shippingCost)}`} />
          <Row label="수수료" value={`- ${formatWon(n.fee)}`} />
          <div className="mt-2 border-t border-ink-100 pt-2">
            <Row
              label="순마진"
              value={formatWon(n.netMargin)}
              strong
              tone={n.netMargin > 0 ? "good" : "bad"}
            />
            <Row label="마진율" value={`${n.marginRate}%`} />
          </div>
        </div>

        {/* 톡딜 */}
        <div className="rounded-lg border-2 border-brand-500 bg-brand-50/40 p-3">
          <div className="mb-2 text-xs font-bold text-ink-700">
            톡딜 (수수료 {Math.round(t.feeRate * 1000) / 10}%)
          </div>
          <Row label="판매가" value={formatWon(t.salePrice)} />
          <Row label="공급가" value={`- ${formatWon(t.supplyCost)}`} />
          <Row label="배송비" value={`- ${formatWon(t.shippingCost)}`} />
          <Row label="수수료" value={`- ${formatWon(t.fee)}`} />
          <div className="mt-2 border-t border-brand-200 pt-2">
            <Row
              label="순마진"
              value={formatWon(t.netMargin)}
              strong
              tone={t.netMargin > 0 ? "good" : "bad"}
            />
            <Row label="마진율" value={`${t.marginRate}%`} />
          </div>
        </div>
      </div>

      {/* 목표 판매량 / 블렌디드 / LTV */}
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Stat
          label="목표 달성 판매량"
          value={t.targetUnits != null ? `${t.targetUnits.toLocaleString()}건` : "—"}
          hint={
            t.targetUnits != null
              ? "목표 판매액 ÷ 톡딜 순마진"
              : "목표 판매액 입력 시 계산"
          }
        />
        <Stat
          label="블렌디드 마진율"
          value={`${b.marginRate}%`}
          tone={b.netMargin > 0 ? "good" : "bad"}
          hint={`순마진 ${formatWon(b.netMargin)}`}
        />
        <Stat
          label="12개월 예상 LTV"
          value={formatWon(ltv.ltv12m)}
          hint={`연 ${ltv.annualPurchaseCount}회 구매 가정`}
        />
      </div>

      {/* 블렌디드 구성 */}
      <details className="mt-3 rounded-lg border border-ink-100 bg-ink-50/50 p-3">
        <summary className="cursor-pointer text-xs font-semibold text-ink-600">
          블렌디드 구성 보기 (체험딜 · 본품 · 업셀)
        </summary>
        <table className="mt-2 w-full text-xs">
          <thead className="text-ink-400">
            <tr className="text-left">
              <th className="py-1">구성</th>
              <th className="py-1 text-right">판매가</th>
              <th className="py-1 text-right">원가+배송</th>
              <th className="py-1 text-right">부착률</th>
            </tr>
          </thead>
          <tbody className="text-ink-700">
            {b.offers.map((o) => (
              <tr key={o.name} className="border-t border-ink-100">
                <td className="py-1">{o.name}</td>
                <td className="py-1 text-right">{formatWon(o.price)}</td>
                <td className="py-1 text-right">
                  {formatWon(o.cost + o.shippingCost)}
                </td>
                <td className="py-1 text-right">
                  {Math.round(o.attachRate * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </SectionCard>
  );
}

function Row({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "good" | "bad";
}) {
  const color =
    tone === "good" ? "text-emerald-600" : tone === "bad" ? "text-rose-600" : "text-ink-800";
  return (
    <div className="flex items-center justify-between py-0.5 text-sm">
      <span className="text-ink-500">{label}</span>
      <span className={`${strong ? "font-bold" : "font-medium"} ${color}`}>
        {value}
      </span>
    </div>
  );
}
