import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TransactionFilters } from "@/lib/transactionFilters";
import type { Transaction } from "@/types/api";
import { RowActions } from "@/components/ui/RowActions";
import { Amount } from "./Amount";
import { CategoryIcon } from "./CategoryIcon";
import { TypeBadge } from "./TypeBadge";

type SortKey = TransactionFilters["sortBy"];

interface Props {
  transactions: Transaction[];
  sortBy: SortKey;
  sortOrder: TransactionFilters["sortOrder"];
  onSort: (sortBy: SortKey) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

function SortHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
  align = "left",
}: {
  label: string;
  column: SortKey;
  sortBy: SortKey;
  sortOrder: "asc" | "desc";
  onSort: (sortBy: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sortBy === column;
  return (
    <th
      scope="col"
      aria-sort={active ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-4 py-3", align === "right" && "text-right")}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-1 rounded font-medium uppercase tracking-wide hover:text-slate-900",
          active && "text-slate-900",
        )}
      >
        {label}
        <span aria-hidden="true" className={cn("text-[10px]", !active && "opacity-30")}>
          {active && sortOrder === "asc" ? "▲" : "▼"}
        </span>
      </button>
    </th>
  );
}

/** Category icon on a light background tinted by type. */
function CategoryChip({
  transaction,
  size = "md",
}: {
  transaction: Transaction;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        size === "sm" ? "size-9" : "size-10",
        transaction.type === "INCOME"
          ? "bg-income-100 text-income-600"
          : "bg-expense-100 text-expense-600",
      )}
      aria-hidden="true"
    >
      <CategoryIcon
        name={transaction.category.name}
        className={size === "sm" ? "size-4" : "size-5"}
      />
    </span>
  );
}

export function TransactionTable({
  transactions,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: Props) {
  return (
    <>
      {/* Desktop */}
      <table className="hidden w-full text-sm md:table">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="py-3 pl-5 pr-4 font-medium">
              Transaction
            </th>
            <SortHeader label="Date" column="date" {...{ sortBy, sortOrder, onSort }} />
            <th scope="col" className="px-4 py-3 font-medium">
              Type
            </th>
            <SortHeader
              label="Amount"
              column="amount"
              align="right"
              {...{ sortBy, sortOrder, onSort }}
            />
            <th scope="col" className="py-3 pl-4 pr-5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((t) => (
            <tr key={t.id} className="transition-colors hover:bg-slate-50">
              <td className="py-3 pl-5 pr-4">
                <div className="flex items-center gap-3">
                  <CategoryChip transaction={t} />
                  <div className="min-w-0">
                    <p className="max-w-xs truncate font-medium text-slate-900">
                      {t.description ?? t.category.name}
                    </p>
                    <p className="text-xs text-slate-500">{t.category.name}</p>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(t.date)}</td>
              <td className="px-4 py-3">
                <TypeBadge type={t.type} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <Amount amount={t.amount} type={t.type} className="font-semibold" />
              </td>
              <td className="py-3 pl-4 pr-5">
                <RowActions
                  label={t.description ?? t.category.name}
                  onEdit={() => onEdit(t)}
                  onDelete={() => onDelete(t)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: one card-like row per transaction */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {transactions.map((t) => (
          <li key={t.id} className="flex gap-3 px-4 py-4">
            <CategoryChip transaction={t} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="truncate font-medium text-slate-900">
                  {t.description ?? t.category.name}
                </p>
                <Amount amount={t.amount} type={t.type} className="shrink-0 font-semibold" />
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {t.category.name} · {formatDate(t.date)}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <TypeBadge type={t.type} />
                <RowActions
                  label={t.description ?? t.category.name}
                  onEdit={() => onEdit(t)}
                  onDelete={() => onDelete(t)}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Placeholder rows while the first page loads. */
export function TransactionTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading transactions">
      <div className="hidden h-11 border-b border-slate-200 bg-slate-50 md:block" />
      <ul className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-4 md:px-5">
            <div className="size-10 shrink-0 animate-pulse rounded-full bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-1/5 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
          </li>
        ))}
      </ul>
    </div>
  );
}
