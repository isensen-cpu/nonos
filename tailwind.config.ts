import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // 차분한 업무 도구 톤 — 카카오 옐로우는 포인트로만 사용
        brand: {
          50: "#fef9e7",
          100: "#fdf0c4",
          400: "#fbe24d",
          500: "#fee500", // 카카오 옐로우 포인트
          600: "#e6ce00",
          700: "#b8a300",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d7dbe3",
          300: "#b3bac7",
          400: "#8893a6",
          500: "#677085",
          600: "#515a6b",
          700: "#414856",
          800: "#2c313b",
          900: "#1b1e25",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
