"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { DeleteTransactionDialog } from "@/components/transactions/DeleteTransactionDialog";
import { Pagination } from "@/components/transactions/Pagination";
import { TransactionFiltersBar } from "@/components/transactions/TransactionFilters";
import { TransactionFormModal } from "@/components/transactions/TransactionFormModal";
import {
  TransactionTable,
  TransactionTableSkeleton,
} from "@/components/transactions/TransactionTable";
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
      <PageHeader
        title="Transactions"
        description="Track and manage your financial activity"
        action={
          <Button onClick={() => setForm({ open: true, transaction: null })}>
            <span aria-hidden="true" className="text-base leading-none">
              +
            </span>
            Add transaction
          </Button>
        }
      />

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
          <TransactionTableSkeleton />
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
          hasActiveFilters(filters) ? (
            <EmptyState
              icon="search"
              title="No transactions match your filters"
              description="Try a different search, type, category or date range."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon="receipt"
              title="No transactions yet"
              description="Add your first income or expense to start tracking where your money goes."
              action={
                <Button onClick={() => setForm({ open: true, transaction: null })}>
                  Add transaction
                </Button>
              }
            />
          )
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
