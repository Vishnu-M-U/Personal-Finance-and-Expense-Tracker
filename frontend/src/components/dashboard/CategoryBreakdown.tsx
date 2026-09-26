import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { CategoryTotal } from "@/types/api";

interface Props {
  title: string;
  rows: CategoryTotal[];
  emptyText: string;
}

/**
 * Horizontal bars, largest first, one hue (the title names the series).
 * Bar length is relative to the largest category; the share of the total is shown as text.
 */
export function CategoryBreakdown({ title, rows, emptyText }: Props) {
  const max = Math.max(...rows.map((r) => Number(r.total)), 0);

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="mt-4 space-y-1" aria-label={title}>
          {rows.map((row) => {
            const width = max > 0 ? Math.max((Number(row.total) / max) * 100, 1) : 0;
            return (
              <li
                key={row.categoryId}
                className="group -mx-2 rounded-lg px-2 py-2 hover:bg-slate-50"
                title={`${row.name}: ${formatCurrency(row.total)} (${row.percentage}% of total)`}
              >
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate text-slate-700">{row.name}</span>
                  <span className="shrink-0 tabular-nums">
                    <span className="font-medium text-slate-900">{formatCurrency(row.total)}</span>
                    <span className="ml-2 inline-block w-14 text-right text-slate-500">
                      {row.percentage}%
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-slate-100" aria-hidden="true">
                  <div
                    className="h-2 rounded-full bg-indigo-500 transition-[width] group-hover:bg-indigo-600"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
