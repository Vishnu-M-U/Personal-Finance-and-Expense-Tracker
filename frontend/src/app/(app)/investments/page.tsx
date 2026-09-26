"use client";

import { useState } from "react";
import { AllocationCard } from "@/components/investments/AllocationCard";
import { DeleteInvestmentDialog } from "@/components/investments/DeleteInvestmentDialog";
import { InvestmentFormModal } from "@/components/investments/InvestmentFormModal";
import { InvestmentSummaryCards } from "@/components/investments/InvestmentSummaryCards";
import { InvestmentTable } from "@/components/investments/InvestmentTable";
import { PerformanceCard } from "@/components/investments/PerformanceCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useInvestments } from "@/hooks/useInvestments";
import { getErrorMessage } from "@/lib/api";
import type { Investment } from "@/types/api";

type FormState = { open: false } | { open: true; investment: Investment | null };

export default function InvestmentsPage() {
  const investments = useInvestments();
  const [form, setForm] = useState<FormState>({ open: false });
  const [deleting, setDeleting] = useState<Investment | null>(null);

  const add = () => setForm({ open: true, investment: null });
  const data = investments.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investments"
        description="Track your portfolio and monitor your returns"
        action={
          <Button onClick={add}>
            <span aria-hidden="true" className="text-base leading-none">
              +
            </span>
            Add investment
          </Button>
        }
      />

      {investments.isError ? (
        <Alert
          action={
            <Button variant="secondary" onClick={() => investments.refetch()}>
              Retry
            </Button>
          }
        >
          {getErrorMessage(investments.error)}
        </Alert>
      ) : !data ? (
        <InvestmentsSkeleton />
      ) : data.data.length === 0 ? (
        <Card>
          <EmptyState
            icon="receipt"
            title="No investments yet"
            description="Add a mutual fund, stock, gold or any other holding to track what you've invested and what it's worth now."
            action={<Button onClick={add}>Add investment</Button>}
          />
        </Card>
      ) : (
        <>
          <InvestmentSummaryCards summary={data.summary} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AllocationCard summary={data.summary} />
            <PerformanceCard summary={data.summary} />
          </div>
          <InvestmentTable
            investments={data.data}
            onEdit={(investment) => setForm({ open: true, investment })}
            onDelete={setDeleting}
          />
        </>
      )}

      <InvestmentFormModal
        open={form.open}
        investment={form.open ? form.investment : null}
        onClose={() => setForm({ open: false })}
      />
      <DeleteInvestmentDialog investment={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}

function InvestmentsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading investments">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="h-36 animate-pulse bg-slate-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="h-80 animate-pulse bg-slate-100" />
        <Card className="h-80 animate-pulse bg-slate-100" />
      </div>
      <Card className="h-64 animate-pulse bg-slate-100" />
    </div>
  );
}
