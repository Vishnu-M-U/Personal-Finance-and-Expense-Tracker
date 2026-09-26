import Link from "next/link";
import { CategoryIcon } from "@/components/transactions/CategoryIcon";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import type { CategoryTotal } from "@/types/api";

interface Props {
  title: string;
  /** Green for income, red for expenses: icons, bars and the series total. */
  tone: "income" | "expense";
  /** Total for the whole series, shown under the title. */
  total: string;
  rows: CategoryTotal[];
  emptyText: string;
  /** Transactions page, filtered to this series and period. */
  viewAllHref: string;
}

const TONES = {
  income: {
    verb: "received",
    total: "text-income-600",
    icon: "bg-income-100 text-income-600",
    bar: "bg-income-600",
  },
  expense: {
    verb: "spent",
    total: "text-expense-600",
    icon: "bg-expense-100 text-expense-600",
    bar: "bg-expense-600",
  },
};

/**
 * One row per category, largest first. Bar length is relative to the largest category;
 * the share of the total is shown as text.
 */
export function CategoryBreakdown({ title, tone, total, rows, emptyText, viewAllHref }: Props) {
  const max = Math.max(...rows.map((r) => Number(r.total)), 0);
  const colors = TONES[tone];

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader
        title={title}
        subtitle={
          rows.length > 0 && (
            <>
              <span className={cn("font-semibold tabular-nums", colors.total)}>
                {formatCurrency(total)}
              </span>{" "}
              {colors.verb} across {rows.length} {rows.length === 1 ? "category" : "categories"}
            </>
          )
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
        <p className="py-10 text-center text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="mt-5 space-y-4" aria-label={title}>
          {rows.map((row) => {
            const width = max > 0 ? Math.max((Number(row.total) / max) * 100, 1) : 0;
            return (
              <li
                key={row.categoryId}
                className="flex items-center gap-3"
                title={`${row.name}: ${formatCurrency(row.total)} (${row.percentage}% of total)`}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    colors.icon,
                  )}
                  aria-hidden="true"
                >
                  <CategoryIcon name={row.name} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-slate-900">{row.name}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                      {formatCurrency(row.total)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-slate-100" aria-hidden="true">
                      <div
                        className={cn("h-2 rounded-full", colors.bar)}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right text-xs font-medium tabular-nums text-slate-500">
                      {row.percentage}%
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
