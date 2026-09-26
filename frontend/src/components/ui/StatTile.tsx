import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const ICON_PATHS = {
  wallet: [
    "M3 7a2 2 0 0 1 2-2h13v4",
    "M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z",
    "M16 14.5h.01",
  ],
  up: ["M12 19V5", "M6 11l6-6 6 6"],
  down: ["M12 5v14", "M6 13l6 6 6-6"],
  chart: ["M4 20V10", "M10 20V4", "M16 20v-7", "M22 20H2"],
};

/** Tile tint and icon chip per meaning: indigo balance, green income, red expense, plain neutral. */
const TILE_TONES = {
  neutral: {
    box: "border-slate-200 bg-white hover:border-slate-300 hover:shadow-slate-900/10",
    icon: "bg-slate-700",
  },
  balance: {
    box: "border-brand-100 bg-brand-50 hover:border-brand-200 hover:bg-brand-100/60 hover:shadow-brand-600/15",
    icon: "bg-brand-600",
  },
  income: {
    box: "border-income-100 bg-income-50 hover:border-income-200 hover:bg-income-100/60 hover:shadow-income-600/15",
    icon: "bg-income-600",
  },
  expense: {
    box: "border-expense-100 bg-expense-50 hover:border-expense-200 hover:bg-expense-100/60 hover:shadow-expense-600/15",
    icon: "bg-expense-600",
  },
};

const VALUE_TONES = {
  neutral: "text-slate-900",
  positive: "text-income-600",
  negative: "text-expense-600",
};

const SIZES = {
  md: { box: "p-5 sm:p-6", icon: "size-10", svg: "size-5", value: "mt-4 text-2xl" },
  lg: { box: "p-5 sm:p-6", icon: "size-10", svg: "size-5", value: "mt-4 text-3xl sm:text-4xl" },
};

/** A tinted summary figure: label, icon chip, value and an optional note. */
export function StatTile({
  label,
  value,
  tile,
  icon,
  size = "md",
  valueTone = "neutral",
  note,
  className,
}: {
  label: string;
  value: string;
  tile: keyof typeof TILE_TONES;
  icon: keyof typeof ICON_PATHS;
  size?: keyof typeof SIZES;
  valueTone?: keyof typeof VALUE_TONES;
  note?: ReactNode;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <div
      className={cn(
        // Hover stays in place: deeper tint, stronger border and a soft glow in the tile's color.
        "rounded-xl border shadow-sm transition-[background-color,border-color,box-shadow] duration-200 hover:shadow-lg",
        s.box,
        TILE_TONES[tile].box,
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span
          className={cn(
            "flex items-center justify-center rounded-lg text-white shadow-sm",
            s.icon,
            TILE_TONES[tile].icon,
          )}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={s.svg}
          >
            {ICON_PATHS[icon].map((d) => (
              <path key={d} d={d} />
            ))}
          </svg>
        </span>
      </div>
      <p
        className={cn("font-semibold tracking-tight tabular-nums", s.value, VALUE_TONES[valueTone])}
      >
        {value}
      </p>
      {note && <p className="mt-1 text-sm text-slate-500">{note}</p>}
    </div>
  );
}

/** Value tone for a signed balance string. */
export function balanceTone(balance: string): keyof typeof VALUE_TONES {
  const n = Number(balance);
  return n > 0 ? "positive" : n < 0 ? "negative" : "neutral";
}
