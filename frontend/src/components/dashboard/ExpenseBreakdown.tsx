"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { CategoryTotal } from "@/types/api";

interface Props {
  /** Total spent in the period, shown in the middle of the donut. */
  total: string;
  /** Largest first, as the API returns them. */
  rows: CategoryTotal[];
  /** Transactions page, filtered to expenses and this period. */
  viewAllHref: string;
}

/**
 * Slice colors in a fixed order, checked for color-blind separation between neighbours
 * (including the last slice wrapping round to the first). No green or red: those mean
 * income and expense. Categories past the fifth share the gray "rest" slice.
 */
const SLICE_COLORS = ["#4f46e5", "#f59e0b", "#0ea5e9", "#db2777", "#14b8a6"];
const REST_COLOR = "#64748b";

// A circle with circumference 100, so each segment's dash length is its percentage.
const R = 15.9155;
const GAP = 0.6;

interface Slice {
  key: string;
  name: string;
  total: string;
  percentage: number;
  color: string;
  /** For the folded slice: the names it covers. */
  members?: string;
}

/** The top five categories, then everything else folded into one gray slice. */
function toSlices(rows: CategoryTotal[]): Slice[] {
  const toSlice = (row: CategoryTotal, color: string): Slice => ({
    key: String(row.categoryId),
    name: row.name,
    total: row.total,
    percentage: row.percentage,
    color,
  });
  if (rows.length <= SLICE_COLORS.length) {
    return rows.map((row, i) => toSlice(row, SLICE_COLORS[i]));
  }
  const top = rows.slice(0, SLICE_COLORS.length).map((row, i) => toSlice(row, SLICE_COLORS[i]));
  const rest = rows.slice(SLICE_COLORS.length);
  if (rest.length === 1) return [...top, toSlice(rest[0], REST_COLOR)];
  return [
    ...top,
    {
      key: "rest",
      name: `${rest.length} more categories`,
      // Display only: sums of the API's own totals and shares.
      total: rest.reduce((sum, r) => sum + Number(r.total), 0).toFixed(2),
      percentage: Math.round(rest.reduce((sum, r) => sum + r.percentage, 0) * 100) / 100,
      color: REST_COLOR,
      members: rest.map((r) => r.name).join(", "),
    },
  ];
}

/** Long totals switch to the compact form so they fit inside the ring. */
function fitAmount(amount: string): string {
  const full = formatCurrency(amount);
  return full.length > 12 ? formatCompactCurrency(amount) : full;
}

/** Donut of spending by category with a legend; hovering a slice or row shows its figures. */
export function ExpenseBreakdown({ total, rows, viewAllHref }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const slices = toSlices(rows);
  const active = slices.find((s) => s.key === activeKey) ?? null;
  const gap = slices.length > 1 ? GAP : 0;
  // Each segment starts where the previous ones end.
  const segments = slices.map((slice, i) => ({
    ...slice,
    offset: slices.slice(0, i).reduce((sum, s) => sum + s.percentage, 0),
    length: Math.max(slice.percentage - gap, 0.4),
  }));

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader
        title="Expenses by category"
        subtitle={
          rows.length > 0
            ? `Where your money went, across ${rows.length} ${rows.length === 1 ? "category" : "categories"}`
            : undefined
        }
        action={
          <Link
            href={viewAllHref}
            className="rounded-md text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all
          </Link>
        }
      />
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">No expenses in this period.</p>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="relative size-40 shrink-0" onMouseLeave={() => setActiveKey(null)}>
            <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r={R}
                fill="none"
                strokeWidth="3"
                className="stroke-slate-100"
              />
              {segments.map((s) => (
                <circle
                  key={s.key}
                  cx="18"
                  cy="18"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="3"
                  strokeDasharray={`${s.length} ${100 - s.length}`}
                  strokeDashoffset={-s.offset}
                  className={cn(
                    "cursor-default transition-opacity",
                    active && active.key !== s.key && "opacity-30",
                  )}
                  onMouseEnter={() => setActiveKey(s.key)}
                />
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              {active ? (
                <>
                  <span className="line-clamp-2 text-xs leading-tight text-slate-500">
                    {active.name}
                  </span>
                  <span className="mt-0.5 text-base font-semibold tabular-nums text-slate-900">
                    {fitAmount(active.total)}
                  </span>
                  <span className="text-xs tabular-nums text-slate-500">{active.percentage}%</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-slate-500">Total spent</span>
                  <span
                    className="mt-0.5 text-base font-semibold tabular-nums text-slate-900"
                    title={formatCurrency(total)}
                  >
                    {fitAmount(total)}
                  </span>
                </>
              )}
            </div>
          </div>

          <ul className="w-full min-w-0 space-y-0.5" aria-label="Expenses by category">
            {slices.map((s) => (
              <li
                key={s.key}
                className={cn(
                  "-mx-2 flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                  active?.key === s.key && "bg-slate-50",
                )}
                onMouseEnter={() => setActiveKey(s.key)}
                onMouseLeave={() => setActiveKey(null)}
                title={s.members}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate font-medium text-slate-700">{s.name}</span>
                <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                  {formatCurrency(s.total)}
                </span>
                <span className="w-14 shrink-0 text-right text-xs tabular-nums text-slate-500">
                  {s.percentage}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
