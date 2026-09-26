import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { TransactionFilters } from "@/lib/transactionFilters";
import type { Transaction } from "@/types/api";
import { Amount } from "./Amount";

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
          "inline-flex items-center gap-1 font-medium hover:text-slate-900",
          active && "text-slate-900",
        )}
      >
        {label}
        <span aria-hidden="true" className={cn("text-xs", !active && "opacity-30")}>
          {active && sortOrder === "asc" ? "▲" : "▼"}
        </span>
      </button>
    </th>
  );
}

function RowActions({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  onEdit: Props["onEdit"];
  onDelete: Props["onDelete"];
}) {
  const label = transaction.description ?? transaction.category.name;
  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(transaction)}
        className="rounded-md px-2 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
        aria-label={`Edit ${label}`}
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(transaction)}
        className="rounded-md px-2 py-1 text-sm font-medium text-rose-600 hover:bg-rose-50"
        aria-label={`Delete ${label}`}
      >
        Delete
      </button>
    </div>
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
        <thead className="border-b border-slate-200 text-left text-slate-500">
          <tr>
            <SortHeader label="Date" column="date" {...{ sortBy, sortOrder, onSort }} />
            <th scope="col" className="px-4 py-3 font-medium">
              Description
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Category
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Type
            </th>
            <SortHeader
              label="Amount"
              column="amount"
              align="right"
              {...{ sortBy, sortOrder, onSort }}
            />
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(t.date)}</td>
              <td className="max-w-xs truncate px-4 py-3 text-slate-900">
                {t.description ?? <span className="text-slate-400">—</span>}
              </td>
              <td className="px-4 py-3 text-slate-600">{t.category.name}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    t.type === "INCOME"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700",
                  )}
                >
                  {t.type === "INCOME" ? "Income" : "Expense"}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <Amount amount={t.amount} type={t.type} />
              </td>
              <td className="px-4 py-2">
                <RowActions transaction={t} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {transactions.map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">
                {t.description ?? t.category.name}
              </p>
              <p className="text-sm text-slate-500">
                {formatDate(t.date)} · {t.category.name}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <Amount amount={t.amount} type={t.type} />
              <RowActions transaction={t} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
