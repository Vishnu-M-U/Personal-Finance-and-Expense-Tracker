import { cn } from "@/lib/cn";
import { formatSignedCurrency, formatSignedPercent } from "@/lib/format";

/** Signed return and % — green for a gain, red for a loss. */
export function ReturnValue({
  amount,
  percentage,
  layout = "stacked",
  className,
}: {
  amount: string;
  percentage: number;
  layout?: "stacked" | "inline";
  className?: string;
}) {
  const n = Number(amount);
  const tone = n > 0 ? "text-income-600" : n < 0 ? "text-expense-600" : "text-slate-500";
  return (
    <span
      className={cn(
        "tabular-nums",
        layout === "stacked" ? "flex flex-col items-end" : "inline-flex items-baseline gap-1.5",
        tone,
        className,
      )}
    >
      <span className="font-semibold">{formatSignedCurrency(amount)}</span>
      <span className={layout === "stacked" ? "text-xs font-medium" : "text-sm font-medium"}>
        {layout === "inline"
          ? `(${formatSignedPercent(percentage)})`
          : formatSignedPercent(percentage)}
      </span>
    </span>
  );
}
