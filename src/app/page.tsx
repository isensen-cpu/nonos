"use client";

import { useEffect, useRef, useState } from "react";
import type { ProductInput, StrategyReport } from "@/lib/types";
import { buildStrategyReport } from "@/lib/report";
import ProductInputForm from "@/components/ProductInputForm";
import StrategySummary from "@/components/StrategySummary";
import ReportHeader from "@/components/ReportHeader";
import ProfitCalculatorCard from "@/components/ProfitCalculatorCard";
import DealRecommendationCard from "@/components/DealRecommendationCard";
import ChecklistCard from "@/components/ChecklistCard";
import MessageCampaignCard from "@/components/MessageCampaignCard";
import ReviewStrategyCard from "@/components/ReviewStrategyCard";
import ChannelGrowthCard from "@/components/ChannelGrowthCard";
import ExecutionScoreCard from "@/components/ExecutionScoreCard";

const STORAGE_KEY = "talkdeal:input";

const EMPTY_INPUT: ProductInput = {
  productName: "",
  category: "",
  supplyCost: 0,
  salePrice: 0,
  shippingCost: 0,
  priceCompetitiveness: "medium",
  preferredDealType: "미정",
  freeShippingAvailable: false,
};

const SAMPLE_INPUT: ProductInput = {
  productName: "국산 볶음참기름 250ml",
  category: "식품",
  supplyCost: 7800,
  salePrice: 15900,
  shippingCost: 2500,
  optionInfo: "250ml / 2개입",
  targetMargin: 20,
  salesTarget: 800,
  friendTarget: 3000,
  preferredDealType: "오늘의딜",
  currentReviewCount: 64,
  currentRating: 4.6,
  currentFriendCount: 720,
  freeShippingAvailable: true,
  expectedStock: 2000,
  expectedRevenue: 6000000,
  priceCompetitiveness: "high",
};

export default function Page() {
  const [input, setInput] = useState<ProductInput>(EMPTY_INPUT);
  const [report, setReport] = useState<StrategyReport | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // localStorage 복원 (MVP 영속성, §3)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setInput({ ...EMPTY_INPUT, ...JSON.parse(raw) });
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
    } catch {
      /* noop */
    }
  }, [input]);

  function handleGenerate() {
    setReport(buildStrategyReport(input));
    // 결과로 부드럽게 스크롤 (모바일 대응)
    requestAnimationFrame(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main className="min-h-screen">
      {/* 헤더 */}
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-black text-ink-900">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-sm">
                톡
              </span>
              톡딜 전략 마스터
            </h1>
            <p className="text-xs text-ink-500">
              상품을 파는 것이 아니라 채널 친구를 확보하는 구조를 설계합니다 ·
              톡딜 → 채널친구 → 메시지 → 재구매 → 브랜드
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInput(SAMPLE_INPUT)}
            className="self-start rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:bg-ink-50 sm:self-auto"
          >
            예시 데이터 채우기
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* 입력 도구 (좌) */}
          <div className="lg:col-span-5">
            <ProductInputForm
              value={input}
              onChange={setInput}
              onSubmit={handleGenerate}
            />
          </div>

          {/* 실시간 요약 + 리포트 (우) */}
          <div className="lg:col-span-7">
            {!report ? (
              <StrategySummary input={input} />
            ) : (
              <div ref={reportRef} className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-ink-900">전략 리포트</h2>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ink-800"
                  >
                    현재 입력으로 다시 생성
                  </button>
                </div>

                <ReportHeader report={report} />
                <ProfitCalculatorCard report={report} />
                <DealRecommendationCard report={report} />
                <ChecklistCard items={report.checklist} />
                <MessageCampaignCard report={report} />
                <ReviewStrategyCard report={report} />
                <ChannelGrowthCard report={report} />
                <ExecutionScoreCard />
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-ink-200 py-6 text-center text-xs text-ink-400">
        톡딜 전략 마스터 · 관계형 커머스 전략 MVP
      </footer>
    </main>
  );
}
