"use client";

import { useState } from "react";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
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

export default function DashboardPage() {
  const [preset, setPreset] = useState<PeriodPreset>("thisMonth");
  const [customRange, setCustomRange] = useState<DateRange>(() => presetRange("thisMonth"));
  const [adding, setAdding] = useState(false);

  const range = preset === "custom" ? customRange : presetRange(preset);
  const rangeValid = Boolean(range.startDate && range.endDate && range.startDate <= range.endDate);

  const summary = useDashboardSummary(range, rangeValid);
  const categories = useCategories();

  const changePreset = (next: PeriodPreset) => {
    // Start a custom range from whatever period was showing.
    if (next === "custom" && preset !== "custom") setCustomRange(range);
    setPreset(next);
  };

  const data = summary.data;
  const isEmpty = data && data.totals.income === "0.00" && data.totals.expense === "0.00";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {rangeValid
              ? `${formatDate(range.startDate)} – ${formatDate(range.endDate)}`
              : "Choose a valid date range"}
          </p>
        </div>
        <PeriodSelector
          preset={preset}
          customRange={customRange}
          onPresetChange={changePreset}
          onCustomRangeChange={setCustomRange}
        />
      </div>

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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <CategoryBreakdown
                  title="Expenses by category"
                  rows={data.expenseByCategory}
                  emptyText="No expenses in this period."
                />
                <CategoryBreakdown
                  title="Income by category"
                  rows={data.incomeByCategory}
                  emptyText="No income in this period."
                />
              </div>
              <RecentTransactions transactions={data.recentTransactions} />
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="h-28 animate-pulse bg-slate-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="h-72 animate-pulse bg-slate-100" />
        <Card className="h-72 animate-pulse bg-slate-100" />
      </div>
    </div>
  );
}
