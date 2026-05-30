"use client";

import type { StrategyReport, ChannelStage } from "@/lib/types";
import { SectionCard, Pill } from "./ui";

const STAGES: { stage: ChannelStage; label: string }[] = [
  { stage: "0~500", label: "0~500명" },
  { stage: "500~2000", label: "500~2,000명" },
  { stage: "2000~5000", label: "2,000~5,000명" },
  { stage: "5000+", label: "5,000명+" },
];

export default function ChannelGrowthCard({
  report,
}: {
  report: StrategyReport;
}) {
  const c = report.channelStrategy;
  const rp = report.repurchase;

  return (
    <SectionCard index="⑦" title="채널 성장 전략">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-ink-600">
          현재 친구 {c.currentFriends.toLocaleString()}명
        </span>
        <Pill tone="brand">{c.stage} 단계</Pill>
      </div>

      {/* 단계 진행 표시 */}
      <div className="mb-3 flex gap-1">
        {STAGES.map((s) => (
          <div
            key={s.stage}
            className={`flex-1 rounded-md px-1 py-1.5 text-center text-[10px] font-semibold ${
              s.stage === c.stage
                ? "bg-ink-900 text-white"
                : "bg-ink-100 text-ink-400"
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      <ul className="mb-3 space-y-1.5">
        {c.tactics.map((t) => (
          <li key={t} className="flex items-center gap-2 text-sm text-ink-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
              →
            </span>
            {t}
          </li>
        ))}
      </ul>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-ink-50 p-3">
          <div className="text-[11px] font-semibold text-ink-400">
            예상 친구 증가 (전환율 {Math.round(c.conversionRate * 100)}%)
          </div>
          <div className="text-base font-bold text-ink-800">
            {c.projectedNewFriends != null
              ? `+${c.projectedNewFriends.toLocaleString()}명`
              : "목표 판매량 입력 시 계산"}
          </div>
        </div>
        <div className="rounded-lg bg-ink-50 p-3">
          <div className="text-[11px] font-semibold text-ink-400">다음 목표</div>
          <div className="text-xs font-medium text-ink-700">
            {c.nextStageGoal}
          </div>
        </div>
      </div>

      {/* 재구매 구조 (§14) */}
      <div className="mt-4 rounded-lg border border-ink-100 p-3">
        <div className="mb-2 text-sm font-bold text-ink-800">재구매 구조 설계</div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <Item label="예상 재구매 주기" value={`${rp.cycleDays}일`} />
          <Item label="메시지 발송 시점" value={rp.sendTiming} />
          <Item label="재구매 쿠폰" value={rp.coupon} />
          <Item label="업셀 제안" value={rp.upsell} />
          <Item label="크로스셀 제안" value={rp.crossSell} />
          <Item label="재딜 운영 방향" value={rp.redealDirection} />
        </dl>
      </div>
    </SectionCard>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-400">{label}</dt>
      <dd className="font-medium text-ink-700">{value}</dd>
    </div>
  );
}
