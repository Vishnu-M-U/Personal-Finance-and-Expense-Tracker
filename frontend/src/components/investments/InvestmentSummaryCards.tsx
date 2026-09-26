import { StatTile } from "@/components/ui/StatTile";
import { formatCurrency, formatSignedCurrency, formatSignedPercent } from "@/lib/format";
import type { InvestmentSummary } from "@/types/api";

export function InvestmentSummaryCards({ summary }: { summary: InvestmentSummary }) {
  const ret = Number(summary.totalReturn);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatTile
        label="Total invested"
        value={formatCurrency(summary.totalInvested)}
        tile="balance"
        icon="wallet"
        note="Across all holdings"
      />
      <StatTile
        label="Current value"
        value={formatCurrency(summary.currentValue)}
        tile="neutral"
        icon="chart"
        note="As you last updated it"
      />
      <StatTile
        label="Total returns"
        value={formatSignedCurrency(summary.totalReturn)}
        tile={ret < 0 ? "expense" : "income"}
        icon={ret < 0 ? "down" : "up"}
        valueTone={ret > 0 ? "positive" : ret < 0 ? "negative" : "neutral"}
        note={`${formatSignedPercent(summary.returnPercentage)} overall`}
      />
    </div>
  );
}
