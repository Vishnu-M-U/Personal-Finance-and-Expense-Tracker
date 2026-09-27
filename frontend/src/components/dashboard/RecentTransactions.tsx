import Link from "next/link";
import { Amount } from "@/components/transactions/Amount";
import { CategoryIcon } from "@/components/transactions/CategoryIcon";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { Transaction } from "@/types/api";

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card className="p-5 sm:p-6">
      <CardHeader
        title="Recent transactions"
        subtitle="Latest activity in this period"
        action={
          <Link
            href="/transactions"
            className="rounded-md text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all
          </Link>
        }
      />
      {transactions.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">No transactions in this period.</p>
      ) : (
        <ul className="-mx-2 mt-4 divide-y divide-slate-100">
          {transactions.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-slate-50"
            >
              {/* The amount carries income vs expense; expense chips stay neutral to limit red. */}
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  t.type === "INCOME"
                    ? "bg-income-50 text-income-600"
                    : "bg-slate-100 text-slate-600",
                )}
                aria-hidden="true"
              >
                <CategoryIcon name={t.category.name} className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {t.description ?? t.category.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {t.category.name} · {formatDate(t.date)}
                </p>
              </div>
              <Amount amount={t.amount} type={t.type} className="shrink-0 text-sm font-semibold" />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
