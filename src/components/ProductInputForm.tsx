"use client";

import type { ProductInput, DealType, PriceCompetitiveness } from "@/lib/types";

const DEAL_TYPES: DealType[] = ["미정", "만원딜", "1+1딜", "오늘의딜", "오늘공구"];
const COMPETITIVENESS: { value: PriceCompetitiveness; label: string }[] = [
  { value: "low", label: "낮음" },
  { value: "medium", label: "보통" },
  { value: "high", label: "높음" },
];

type Props = {
  value: ProductInput;
  onChange: (next: ProductInput) => void;
  onSubmit: () => void;
};

export default function ProductInputForm({ value, onChange, onSubmit }: Props) {
  function set<K extends keyof ProductInput>(key: K, v: ProductInput[K]) {
    onChange({ ...value, [key]: v });
  }

  // 숫자 입력: 빈 값은 undefined, 그 외 숫자
  function num(v: string): number | undefined {
    if (v.trim() === "") return undefined;
    const n = Number(v.replace(/,/g, ""));
    return Number.isNaN(n) ? undefined : n;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
      {/* 기본 정보 */}
      <div className="card">
        <h3 className="card-title">상품 기본 정보</h3>
        <div className="space-y-3">
          <div>
            <label className="label" htmlFor="productName">
              상품명 *
            </label>
            <input
              id="productName"
              className="input"
              placeholder="예: 국산 들기름 250ml"
              value={value.productName}
              onChange={(e) => set("productName", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="category">
              카테고리 *
            </label>
            <input
              id="category"
              className="input"
              placeholder="예: 식품 / 뷰티 / 생활"
              value={value.category}
              onChange={(e) => set("category", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="optionInfo">
              옵션 정보
            </label>
            <input
              id="optionInfo"
              className="input"
              placeholder="예: 1개 / 2개입 / 대용량"
              value={value.optionInfo ?? ""}
              onChange={(e) => set("optionInfo", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 가격/원가 */}
      <div className="card">
        <h3 className="card-title">가격 · 원가 (원)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="salePrice">
              판매가 *
            </label>
            <input
              id="salePrice"
              type="number"
              className="input"
              placeholder="30000"
              value={value.salePrice || ""}
              onChange={(e) => set("salePrice", num(e.target.value) ?? 0)}
            />
          </div>
          <div>
            <label className="label" htmlFor="supplyCost">
              공급가(원가) *
            </label>
            <input
              id="supplyCost"
              type="number"
              className="input"
              placeholder="15000"
              value={value.supplyCost || ""}
              onChange={(e) => set("supplyCost", num(e.target.value) ?? 0)}
            />
          </div>
          <div>
            <label className="label" htmlFor="shippingCost">
              배송비
            </label>
            <input
              id="shippingCost"
              type="number"
              className="input"
              placeholder="3000"
              value={value.shippingCost || ""}
              onChange={(e) => set("shippingCost", num(e.target.value) ?? 0)}
            />
          </div>
          <div>
            <label className="label" htmlFor="targetMargin">
              목표 마진율(%)
            </label>
            <input
              id="targetMargin"
              type="number"
              className="input"
              placeholder="20"
              value={value.targetMargin ?? ""}
              onChange={(e) => set("targetMargin", num(e.target.value))}
            />
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            checked={value.freeShippingAvailable ?? false}
            onChange={(e) => set("freeShippingAvailable", e.target.checked)}
          />
          무료배송 가능
        </label>
      </div>

      {/* 목표/현황 */}
      <div className="card">
        <h3 className="card-title">목표 · 현재 현황 (선택)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="expectedRevenue">
              목표/예상 판매액(원)
            </label>
            <input
              id="expectedRevenue"
              type="number"
              className="input"
              placeholder="5000000"
              value={value.expectedRevenue ?? ""}
              onChange={(e) => set("expectedRevenue", num(e.target.value))}
            />
          </div>
          <div>
            <label className="label" htmlFor="salesTarget">
              목표 판매량(건)
            </label>
            <input
              id="salesTarget"
              type="number"
              className="input"
              placeholder="500"
              value={value.salesTarget ?? ""}
              onChange={(e) => set("salesTarget", num(e.target.value))}
            />
          </div>
          <div>
            <label className="label" htmlFor="expectedStock">
              출고 가능 수량
            </label>
            <input
              id="expectedStock"
              type="number"
              className="input"
              placeholder="1000"
              value={value.expectedStock ?? ""}
              onChange={(e) => set("expectedStock", num(e.target.value))}
            />
          </div>
          <div>
            <label className="label" htmlFor="friendTarget">
              목표 친구 수
            </label>
            <input
              id="friendTarget"
              type="number"
              className="input"
              placeholder="2000"
              value={value.friendTarget ?? ""}
              onChange={(e) => set("friendTarget", num(e.target.value))}
            />
          </div>
          <div>
            <label className="label" htmlFor="currentReviewCount">
              현재 후기 수
            </label>
            <input
              id="currentReviewCount"
              type="number"
              className="input"
              placeholder="0"
              value={value.currentReviewCount ?? ""}
              onChange={(e) => set("currentReviewCount", num(e.target.value))}
            />
          </div>
          <div>
            <label className="label" htmlFor="currentRating">
              현재 평점 (0~5)
            </label>
            <input
              id="currentRating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="input"
              placeholder="4.5"
              value={value.currentRating ?? ""}
              onChange={(e) => set("currentRating", num(e.target.value))}
            />
          </div>
          <div>
            <label className="label" htmlFor="currentFriendCount">
              현재 채널 친구 수
            </label>
            <input
              id="currentFriendCount"
              type="number"
              className="input"
              placeholder="0"
              value={value.currentFriendCount ?? ""}
              onChange={(e) => set("currentFriendCount", num(e.target.value))}
            />
          </div>
          <div>
            <label className="label" htmlFor="priceCompetitiveness">
              가격 경쟁력
            </label>
            <select
              id="priceCompetitiveness"
              className="input"
              value={value.priceCompetitiveness ?? "medium"}
              onChange={(e) =>
                set("priceCompetitiveness", e.target.value as PriceCompetitiveness)
              }
            >
              {COMPETITIVENESS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="label" htmlFor="preferredDealType">
            희망 딜 유형
          </label>
          <select
            id="preferredDealType"
            className="input"
            value={value.preferredDealType ?? "미정"}
            onChange={(e) => set("preferredDealType", e.target.value as DealType)}
          >
            {DEAL_TYPES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-ink-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-ink-800 active:scale-[0.99]"
      >
        전략 리포트 생성
      </button>
    </form>
  );
}
