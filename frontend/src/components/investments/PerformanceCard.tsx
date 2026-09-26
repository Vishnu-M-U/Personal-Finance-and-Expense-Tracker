import { Card, CardHeader } from "@/components/ui/Card";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { InvestmentSummary } from "@/types/api";
import { ReturnValue } from "./ReturnValue";

/** Total invested next to current value, as two bars on the same scale. */
export function PerformanceCard({ summary }: { summary: InvestmentSummary }) {
  const invested = Number(summary.totalInvested);
  const current = Number(summary.currentValue);
  const max = Math.max(invested, current);
  const height = (value: number) => (max > 0 ? `${Math.max((value / max) * 100, 2)}%` : "0%");

  const bars = [
    {
      label: "Invested",
      value: summary.totalInvested,
      height: height(invested),
      bar: "bg-slate-300",
    },
    { label: "Current", value: summary.currentValue, height: height(current), bar: "bg-brand-600" },
  ];

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <CardHeader
        title="Investment performance"
        subtitle={
          <>
            Return{" "}
            <ReturnValue
              amount={summary.totalReturn}
              percentage={summary.returnPercentage}
              layout="inline"
            />
          </>
        }
      />
      {max === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Add an investment to compare what you put in with what it&apos;s worth.
        </p>
      ) : (
        <div
          className="mt-6 flex flex-1 items-end justify-center gap-10 sm:gap-16"
          aria-hidden="true"
        >
          {bars.map((b) => (
            <div key={b.label} className="flex w-20 flex-col items-center">
              <span className="mb-2 text-sm font-semibold tabular-nums text-slate-900">
                {formatCompactCurrency(b.value)}
              </span>
              <div className="flex h-40 w-full items-end rounded-t-lg bg-slate-50">
                <div className={`w-full rounded-t-lg ${b.bar}`} style={{ height: b.height }} />
              </div>
              <span className="mt-2 text-xs font-medium text-slate-500">{b.label}</span>
            </div>
          ))}
        </div>
      )}
      {/* Exact figures for screen readers and anyone who wants the full numbers. */}
      {max > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
          <div>
            <dt className="text-slate-500">Invested</dt>
            <dd className="font-semibold tabular-nums text-slate-900">
              {formatCurrency(summary.totalInvested)}
            </dd>
          </div>
          <div className="text-right">
            <dt className="text-slate-500">Current</dt>
            <dd className="font-semibold tabular-nums text-slate-900">
              {formatCurrency(summary.currentValue)}
            </dd>
          </div>
        </dl>
      )}
    </Card>
  );
}
