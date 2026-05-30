import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "톡딜 전략 마스터",
  description:
    "카카오톡딜 판매자를 위한 관계형 커머스 전략 도구. 상품 정보를 입력하면 톡딜 적합성·수익성·딜 추천·채널 성장·메시지·후기·재구매 전략을 자동 생성합니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1b1e25",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
