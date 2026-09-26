import type { InvestmentType } from "@/types/api";

export const INVESTMENT_TYPES: InvestmentType[] = [
  "MUTUAL_FUND",
  "STOCKS",
  "GOLD",
  "FIXED_DEPOSIT",
  "BONDS",
  "REAL_ESTATE",
  "CRYPTO",
  "OTHER",
];

/**
 * Label, icon paths (24×24 stroke) and colors per type. Colors avoid green and red, which mean
 * gain and loss. `text` colors the donut segment (SVG uses currentColor), `dot` the legend,
 * `soft` the icon chip. Full class names so Tailwind can find them.
 */
export const INVESTMENT_TYPE_META: Record<
  InvestmentType,
  { label: string; icon: string[]; text: string; dot: string; soft: string }
> = {
  MUTUAL_FUND: {
    label: "Mutual Fund",
    icon: ["M12 3v9h9", "M21 12a9 9 0 1 1-9-9"],
    text: "text-brand-600",
    dot: "bg-brand-600",
    soft: "bg-brand-50 text-brand-600",
  },
  STOCKS: {
    label: "Stocks",
    icon: ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
    text: "text-sky-600",
    dot: "bg-sky-600",
    soft: "bg-sky-50 text-sky-600",
  },
  GOLD: {
    label: "Gold",
    icon: ["M3 19h18l-2.5-5h-13L3 19z", "M7.5 14l1.5-4h6l1.5 4"],
    text: "text-amber-500",
    dot: "bg-amber-500",
    soft: "bg-amber-50 text-amber-600",
  },
  FIXED_DEPOSIT: {
    label: "Fixed Deposit",
    icon: ["M3 10l9-6 9 6", "M5 10v8M9.5 10v8M14.5 10v8M19 10v8", "M3 20h18"],
    text: "text-cyan-600",
    dot: "bg-cyan-600",
    soft: "bg-cyan-50 text-cyan-600",
  },
  BONDS: {
    label: "Bonds",
    icon: ["M6 3h9l3 3v15H6V3z", "M9 10h6M9 14h6M9 18h3"],
    text: "text-violet-600",
    dot: "bg-violet-600",
    soft: "bg-violet-50 text-violet-600",
  },
  REAL_ESTATE: {
    label: "Real Estate",
    icon: ["M3 11l9-8 9 8", "M5 9.5V21h14V9.5", "M10 21v-6h4v6"],
    text: "text-orange-500",
    dot: "bg-orange-500",
    soft: "bg-orange-50 text-orange-600",
  },
  CRYPTO: {
    label: "Crypto",
    icon: [
      "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
      "M9.5 8h4a2 2 0 0 1 0 4h-4m0 0h4.5a2 2 0 0 1 0 4H9.5V8z",
    ],
    text: "text-pink-600",
    dot: "bg-pink-600",
    soft: "bg-pink-50 text-pink-600",
  },
  OTHER: {
    label: "Other",
    icon: ["M12 3l9 5-9 5-9-5 9-5z", "M3 13l9 5 9-5"],
    text: "text-slate-400",
    dot: "bg-slate-400",
    soft: "bg-slate-100 text-slate-500",
  },
};
