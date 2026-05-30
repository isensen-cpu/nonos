"use client";

import type { StrategyReport } from "@/lib/types";
import { SectionCard, CopyButton, Pill } from "./ui";

export default function MessageCampaignCard({
  report,
}: {
  report: StrategyReport;
}) {
  const { messages } = report.messageCampaign;

  return (
    <SectionCard index="⑤" title="메시지 캠페인 (4단계)">
      <div className="space-y-3">
        {messages.map((m) => {
          const full = `${m.title}\n\n${m.body}\n\n[${m.cta}]`;
          return (
            <div key={m.step} className="rounded-lg border border-ink-100 p-3">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Pill tone="brand">{m.stage}</Pill>
                  <span className="text-[11px] text-ink-400">{m.purpose}</span>
                </div>
                <CopyButton text={full} label="문구 복사" />
              </div>
              <div className="text-sm font-bold text-ink-800">{m.title}</div>
              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-ink-600">
                {m.body}
              </p>
              <div className="mt-2 inline-flex rounded-md bg-brand-500 px-2.5 py-1 text-xs font-bold text-ink-900">
                {m.cta}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
