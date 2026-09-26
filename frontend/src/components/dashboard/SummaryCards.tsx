import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { DashboardSummary } from "@/types/api";

function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {value}
      </p>
      {note && <p className="mt-1 text-sm text-slate-500">{note}</p>}
    </Card>
  );
}

export function SummaryCards({ totals }: { totals: DashboardSummary["totals"] }) {
  const balance = Number(totals.balance);
  const balanceText =
    balance < 0 ? `−${formatCurrency(totals.balance.slice(1))}` : formatCurrency(totals.balance);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatTile label="Total income" value={formatCurrency(totals.income)} />
      <StatTile label="Total expenses" value={formatCurrency(totals.expense)} />
      <StatTile
        label="Net balance"
        value={balanceText}
        note={
          balance < 0
            ? "You spent more than you earned"
            : balance > 0
              ? "Income minus expenses"
              : undefined
        }
      />
    </div>
  );
}
