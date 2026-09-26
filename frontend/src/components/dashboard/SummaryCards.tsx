import { balanceTone, StatTile } from "@/components/ui/StatTile";
import { formatBalance, formatCurrency } from "@/lib/format";
import type { DashboardSummary } from "@/types/api";

export function SummaryCards({ totals }: { totals: DashboardSummary["totals"] }) {
  const income = Number(totals.income);
  const balance = Number(totals.balance);
  // Share of income kept, for display only.
  const savedPct = income > 0 && balance > 0 ? Math.round((balance / income) * 100) : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatTile
        label="Net balance"
        value={formatBalance(totals.balance)}
        tile="balance"
        icon="wallet"
        size="lg"
        valueTone={balanceTone(totals.balance)}
        note={
          balance < 0
            ? "You spent more than you earned"
            : savedPct !== null
              ? `${savedPct}% of income saved`
              : "Income minus expenses"
        }
        className="sm:col-span-2 lg:col-span-1"
      />
      <StatTile
        label="Total income"
        value={formatCurrency(totals.income)}
        tile="income"
        icon="up"
        note="Money in"
      />
      <StatTile
        label="Total expenses"
        value={formatCurrency(totals.expense)}
        tile="expense"
        icon="down"
        note="Money out"
      />
    </div>
  );
}
