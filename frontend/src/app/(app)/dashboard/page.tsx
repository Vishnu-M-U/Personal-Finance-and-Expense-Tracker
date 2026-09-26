"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TransactionFormModal } from "@/components/transactions/TransactionFormModal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCategories } from "@/hooks/useCategories";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { presetRange, type DateRange, type PeriodPreset } from "@/lib/periods";
import { queryKeys } from "@/lib/queryKeys";
import { DEFAULT_SORT, filtersToQueryString } from "@/lib/transactionFilters";
import type { TransactionType, User } from "@/types/api";

export default function DashboardPage() {
  const [preset, setPreset] = useState<PeriodPreset>("thisMonth");
  const [customRange, setCustomRange] = useState<DateRange>(() => presetRange("thisMonth"));
  const [adding, setAdding] = useState(false);

  const range = preset === "custom" ? customRange : presetRange(preset);
  const rangeValid = Boolean(range.startDate && range.endDate && range.startDate <= range.endDate);

  const summary = useDashboardSummary(range, rangeValid);
  const categories = useCategories();
  // The app layout has already loaded the user; read it from the cache rather than refetching.
  const user = useQueryClient().getQueryData<User | null>(queryKeys.me);
  const firstName = user?.name.trim().split(/\s+/)[0];

  const changePreset = (next: PeriodPreset) => {
    // Start a custom range from whatever period was showing.
    if (next === "custom" && preset !== "custom") setCustomRange(range);
    setPreset(next);
  };

  const data = summary.data;
  // "View all" on a breakdown opens Transactions filtered to that type and this period.
  const viewAllHref = (type: TransactionType) =>
    `/transactions?${filtersToQueryString({ ...DEFAULT_SORT, page: 1, type, startDate: range.startDate, endDate: range.endDate })}`;
  const isEmpty = data && data.totals.income === "0.00" && data.totals.expense === "0.00";

  return (
    <div className="space-y-6">
      <DashboardHero
        firstName={firstName}
        rangeLabel={
          rangeValid
            ? `${formatDate(range.startDate)} – ${formatDate(range.endDate)}`
            : "Choose a valid date range"
        }
        onAdd={() => setAdding(true)}
      >
        <PeriodSelector
          preset={preset}
          customRange={customRange}
          onPresetChange={changePreset}
          onCustomRangeChange={setCustomRange}
        />
      </DashboardHero>

      {summary.isError ? (
        <Alert
          action={
            <Button variant="secondary" onClick={() => summary.refetch()}>
              Retry
            </Button>
          }
        >
          {getErrorMessage(summary.error)}
        </Alert>
      ) : !data ? (
        <DashboardSkeleton />
      ) : (
        <div
          className={
            summary.isPlaceholderData ? "space-y-6 opacity-60 transition-opacity" : "space-y-6"
          }
        >
          <SummaryCards totals={data.totals} />

          {isEmpty ? (
            <Card className="px-4 py-16 text-center">
              <p className="font-medium text-slate-900">No transactions in this period</p>
              <p className="mt-1 text-sm text-slate-500">
                Add an income or expense to see your summary here.
              </p>
              <Button className="mt-4" onClick={() => setAdding(true)}>
                Add transaction
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="space-y-6 lg:col-span-3">
                <CategoryBreakdown
                  title="Expenses by category"
                  tone="expense"
                  total={data.totals.expense}
                  rows={data.expenseByCategory}
                  emptyText="No expenses in this period."
                  viewAllHref={viewAllHref("EXPENSE")}
                />
                <CategoryBreakdown
                  title="Income by category"
                  tone="income"
                  total={data.totals.income}
                  rows={data.incomeByCategory}
                  emptyText="No income in this period."
                  viewAllHref={viewAllHref("INCOME")}
                />
              </div>
              <div className="lg:col-span-2">
                <RecentTransactions transactions={data.recentTransactions} />
              </div>
            </div>
          )}
        </div>
      )}

      <TransactionFormModal
        open={adding}
        transaction={null}
        categories={categories.data ?? []}
        onClose={() => setAdding(false)}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card
            key={i}
            className="h-36 animate-pulse bg-slate-100 first:sm:col-span-2 first:lg:col-span-1"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="h-80 animate-pulse bg-slate-100 lg:col-span-3" />
        <Card className="h-80 animate-pulse bg-slate-100 lg:col-span-2" />
      </div>
    </div>
  );
}
