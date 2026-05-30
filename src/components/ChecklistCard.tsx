"use client";

import { useEffect, useState } from "react";
import type { ChecklistItem } from "@/lib/types";
import { SectionCard } from "./ui";

export default function ChecklistCard({ items }: { items: ChecklistItem[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map((i) => i.done));

  // 입력이 바뀌어 체크리스트가 재생성되면 상태 초기화
  useEffect(() => {
    setChecked(items.map((i) => i.done));
  }, [items]);

  const doneCount = checked.filter(Boolean).length;

  return (
    <SectionCard index="④" title="실행 체크리스트">
      <div className="mb-3 flex items-center justify-between text-xs text-ink-500">
        <span>바로 실행할 항목을 체크하세요</span>
        <span className="font-bold text-ink-800">
          {doneCount}/{items.length} 완료
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={item.label}>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-ink-100 p-2.5 transition hover:bg-ink-50">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                checked={checked[i] ?? false}
                onChange={(e) =>
                  setChecked((prev) => {
                    const next = [...prev];
                    next[i] = e.target.checked;
                    return next;
                  })
                }
              />
              <span>
                <span
                  className={`block text-sm font-medium ${
                    checked[i] ? "text-ink-400 line-through" : "text-ink-800"
                  }`}
                >
                  {item.label}
                </span>
                <span className="block text-[11px] text-ink-400">{item.hint}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
