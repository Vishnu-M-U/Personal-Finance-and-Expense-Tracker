import Link from "next/link";
import { Amount } from "@/components/transactions/Amount";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import type { Transaction } from "@/types/api";

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Recent transactions</h2>
        <Link
          href="/transactions"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View all
        </Link>
      </div>
      {transactions.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No transactions in this period.</p>
      ) : (
        <ul className="mt-2 divide-y divide-slate-100">
          {transactions.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {t.description ?? t.category.name}
                </p>
                <p className="text-sm text-slate-500">
                  {formatDate(t.date)} · {t.category.name}
                </p>
              </div>
              <Amount amount={t.amount} type={t.type} className="shrink-0 text-sm" />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
