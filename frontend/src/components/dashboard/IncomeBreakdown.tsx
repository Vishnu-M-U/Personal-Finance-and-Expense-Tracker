import Link from "next/link";
import { CategoryIcon } from "@/components/transactions/CategoryIcon";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { CategoryTotal } from "@/types/api";

interface Props {
  /** Total received in the period. */
  total: string;
  /** Largest first, as the API returns them. */
  rows: CategoryTotal[];
  /** Transactions page, filtered to income and this period. */
  viewAllHref: string;
}

/** Total income and one row per source: no chart, since there are usually only one or two. */
export function IncomeBreakdown({ total, rows, viewAllHref }: Props) {
  return (
    <Card className="p-5 sm:p-6">
      <CardHeader
        title="Income by category"
        subtitle={
          rows.length > 0
            ? `Where your money came from, across ${rows.length} ${rows.length === 1 ? "category" : "categories"}`
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
        <p className="py-10 text-center text-sm text-slate-500">No income in this period.</p>
      ) : (
        <>
          <div className="mt-5 flex items-baseline justify-between gap-3 rounded-lg bg-income-50 px-4 py-3">
            <span className="text-sm text-slate-600">Total income</span>
            <span className="text-xl font-semibold tabular-nums text-income-700">
              {formatCurrency(total)}
            </span>
          </div>
          <ul className="mt-2 divide-y divide-slate-100" aria-label="Income by category">
            {rows.map((row) => (
              <li key={row.categoryId} className="flex items-center gap-3 py-3">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-income-50 text-income-600"
                  aria-hidden="true"
                >
                  <CategoryIcon name={row.name} className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{row.name}</p>
                  <p className="text-xs tabular-nums text-slate-500">{row.percentage}% of income</p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                  {formatCurrency(row.total)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
