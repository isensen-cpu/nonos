"use client";

import { useState } from "react";

/** 색상 톤 */
type Tone = "neutral" | "good" | "warn" | "bad" | "brand";

const toneClass: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700",
  good: "bg-emerald-100 text-emerald-700",
  warn: "bg-amber-100 text-amber-700",
  bad: "bg-rose-100 text-rose-700",
  brand: "bg-brand-100 text-brand-700",
};

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return <span className={`pill ${toneClass[tone]}`}>{children}</span>;
}

export function SectionCard({
  index,
  title,
  icon,
  children,
  className = "",
}: {
  index?: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      <h3 className="card-title">
        {index && (
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-ink-900 text-[10px] font-bold text-white">
            {index}
          </span>
        )}
        {icon}
        <span>{title}</span>
      </h3>
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  tone?: Tone;
  hint?: string;
}) {
  const valueColor =
    tone === "good"
      ? "text-emerald-600"
      : tone === "bad"
        ? "text-rose-600"
        : tone === "warn"
          ? "text-amber-600"
          : "text-ink-900";
  return (
    <div className="rounded-lg border border-ink-100 bg-ink-50/60 p-3">
      <div className="text-xs font-medium text-ink-500">{label}</div>
      <div className={`mt-0.5 text-lg font-bold ${valueColor}`}>{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-ink-400">{hint}</div>}
    </div>
  );
}

/** 복사 버튼 — 메시지 문구 복사 (§19.2) */
export function CopyButton({
  text,
  label = "복사",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md border border-ink-200 bg-white px-2.5 py-1 text-xs font-semibold text-ink-700 transition hover:bg-ink-50 active:scale-95"
    >
      {copied ? "복사됨 ✓" : label}
    </button>
  );
}

/** 진행 바 */
export function ProgressBar({
  value,
  max,
  tone = "brand",
}: {
  value: number;
  max: number;
  tone?: Tone;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const barColor =
    tone === "good"
      ? "bg-emerald-500"
      : tone === "bad"
        ? "bg-rose-500"
        : tone === "warn"
          ? "bg-amber-500"
          : "bg-brand-500";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
      <div
        className={`h-full rounded-full ${barColor} transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
