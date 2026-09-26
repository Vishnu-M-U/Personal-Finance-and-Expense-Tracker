import { cn } from "@/lib/cn";
import type { TransactionType } from "@/types/api";

/** "Income" in green or "Expense" in red. */
export function TypeBadge({ type }: { type: TransactionType }) {
  const income = type === "INCOME";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        income ? "bg-income-100 text-income-700" : "bg-expense-100 text-expense-700",
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", income ? "bg-income-600" : "bg-expense-600")}
        aria-hidden="true"
      />
      {income ? "Income" : "Expense"}
    </span>
  );
}
