"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { DeleteTransactionDialog } from "@/components/transactions/DeleteTransactionDialog";
import { Pagination } from "@/components/transactions/Pagination";
import { TransactionFiltersBar } from "@/components/transactions/TransactionFilters";
import { TransactionFormModal } from "@/components/transactions/TransactionFormModal";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { getErrorMessage } from "@/lib/api";
import {
  DEFAULT_SORT,
  filtersToQueryString,
  hasActiveFilters,
  parseFilters,
  type TransactionFilters,
} from "@/lib/transactionFilters";
import type { Transaction } from "@/types/api";

type FormState = { open: false } | { open: true; transaction: Transaction | null };

export function TransactionsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parseFilters(new URLSearchParams(searchParams.toString()));

  // Latest requested filters. router.replace updates the URL asynchronously, so two quick
  // changes (e.g. From then To) must build on this, not on the not-yet-updated URL.
  const latestFilters = useRef(filters);
  useEffect(() => {
    latestFilters.current = parseFilters(new URLSearchParams(searchParams.toString()));
  }, [searchParams]);

  const categories = useCategories();
  const transactions = useTransactions(filters);

  const [form, setForm] = useState<FormState>({ open: false });
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const setFilters = useCallback(
    (next: TransactionFilters) => {
      latestFilters.current = next;
      const query = filtersToQueryString(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  // Any filter change goes back to page 1.
  const updateFilters = useCallback(
    (changes: Partial<TransactionFilters>) => {
      setFilters({ ...latestFilters.current, ...changes, page: 1 });
    },
    [setFilters],
  );

  const clearFilters = () => setFilters({ ...DEFAULT_SORT, page: 1 });

  const sort = (sortBy: TransactionFilters["sortBy"]) => {
    const sortOrder = filters.sortBy === sortBy && filters.sortOrder === "desc" ? "asc" : "desc";
    setFilters({ ...filters, sortBy, sortOrder, page: 1 });
  };

  // If a delete empties the last page, step back to the new last page.
  const meta = transactions.data?.meta;
  useEffect(() => {
    if (meta && meta.totalPages > 0 && meta.page > meta.totalPages) {
      setFilters({ ...filters, page: meta.totalPages });
    }
  }, [meta, filters, setFilters]);

  const rows = transactions.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Transactions</h1>
        <Button onClick={() => setForm({ open: true, transaction: null })}>
          <span aria-hidden="true">+</span> Add transaction
        </Button>
      </div>

      <Card className="p-4">
        <TransactionFiltersBar
          filters={filters}
          categories={categories.data ?? []}
          onChange={updateFilters}
          onClear={clearFilters}
        />
      </Card>

      <Card className="overflow-hidden">
        {transactions.isPending ? (
          <div className="flex justify-center py-16 text-indigo-600">
            <Spinner />
          </div>
        ) : transactions.isError ? (
          <div className="p-4">
            <Alert
              action={
                <Button variant="secondary" onClick={() => transactions.refetch()}>
                  Retry
                </Button>
              }
            >
              {getErrorMessage(transactions.error)}
            </Alert>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            filtered={hasActiveFilters(filters)}
            onAdd={() => setForm({ open: true, transaction: null })}
            onClear={clearFilters}
          />
        ) : (
          <div className={transactions.isPlaceholderData ? "opacity-60 transition-opacity" : ""}>
            <TransactionTable
              transactions={rows}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSort={sort}
              onEdit={(transaction) => setForm({ open: true, transaction })}
              onDelete={setDeleting}
            />
            {meta && (
              <Pagination meta={meta} onPageChange={(page) => setFilters({ ...filters, page })} />
            )}
          </div>
        )}
      </Card>

      <TransactionFormModal
        open={form.open}
        transaction={form.open ? form.transaction : null}
        categories={categories.data ?? []}
        onClose={() => setForm({ open: false })}
      />
      <DeleteTransactionDialog transaction={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}

function EmptyState({
  filtered,
  onAdd,
  onClear,
}: {
  filtered: boolean;
  onAdd: () => void;
  onClear: () => void;
}) {
  return (
    <div className="px-4 py-16 text-center">
      <p className="font-medium text-slate-900">
        {filtered ? "No transactions match your filters" : "No transactions yet"}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {filtered
          ? "Try changing or clearing the filters."
          : "Add your first income or expense to get started."}
      </p>
      <div className="mt-4">
        {filtered ? (
          <Button variant="secondary" onClick={onClear}>
            Clear filters
          </Button>
        ) : (
          <Button onClick={onAdd}>Add transaction</Button>
        )}
      </div>
    </div>
  );
}
