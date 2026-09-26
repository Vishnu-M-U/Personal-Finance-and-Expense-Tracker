import { Card, CardHeader } from "@/components/ui/Card";
import { INVESTMENT_TYPE_META } from "@/lib/investments";
import { cn } from "@/lib/cn";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { InvestmentSummary } from "@/types/api";

// A circle with circumference 100, so each segment's dash length is its percentage.
const R = 15.9155;
const GAP = 0.8;

/** Donut of current value by type, with a legend. */
export function AllocationCard({ summary }: { summary: InvestmentSummary }) {
  const { allocation } = summary;
  const gap = allocation.length > 1 ? GAP : 0;
  // Each segment starts where the previous ones end.
  const segments = allocation.map((slice, i) => ({
    ...slice,
    offset: allocation.slice(0, i).reduce((sum, s) => sum + s.percentage, 0),
    length: Math.max(slice.percentage - gap, 0.5),
  }));

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader title="Portfolio allocation" subtitle="Share of current value by type" />
      {allocation.length === 0 || Number(summary.currentValue) === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Allocation appears once your investments have a current value.
        </p>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="relative size-44 shrink-0">
            <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r={R}
                fill="none"
                strokeWidth="3.5"
                className="stroke-slate-100"
              />
              {segments.map((slice) => (
                <circle
                  key={slice.type}
                  cx="18"
                  cy="18"
                  r={R}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray={`${slice.length} ${100 - slice.length}`}
                  strokeDashoffset={-slice.offset}
                  className={INVESTMENT_TYPE_META[slice.type].text}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-500">Current value</span>
              <span className="text-lg font-semibold tabular-nums text-slate-900">
                {formatCompactCurrency(summary.currentValue)}
              </span>
            </div>
          </div>

          <ul className="w-full space-y-3" aria-label="Allocation by type">
            {allocation.map((slice) => (
              <li key={slice.type} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    "size-2.5 shrink-0 rounded-full",
                    INVESTMENT_TYPE_META[slice.type].dot,
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate font-medium text-slate-700">
                  {INVESTMENT_TYPE_META[slice.type].label}
                </span>
                <span className="tabular-nums text-slate-500">
                  {formatCurrency(slice.currentValue)}
                </span>
                <span className="w-14 text-right font-semibold tabular-nums text-slate-900">
                  {slice.percentage}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
