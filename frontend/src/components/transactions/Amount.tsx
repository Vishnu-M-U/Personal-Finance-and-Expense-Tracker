import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TransactionType } from "@/types/api";

/** Income in green with "+", expense in red with "−". */
export function Amount({
  amount,
  type,
  className,
}: {
  amount: string;
  type: TransactionType;
  className?: string;
}) {
  const income = type === "INCOME";
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        income ? "text-emerald-700" : "text-rose-600",
        className,
      )}
    >
      {income ? "+" : "−"}
      {formatCurrency(amount)}
    </span>
  );
}
