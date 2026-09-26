"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useDeleteInvestment } from "@/hooks/useInvestments";
import { getErrorMessage } from "@/lib/api";
import { INVESTMENT_TYPE_META } from "@/lib/investments";
import { formatCurrency } from "@/lib/format";
import type { Investment } from "@/types/api";

export function DeleteInvestmentDialog({
  investment,
  onClose,
}: {
  investment: Investment | null;
  onClose: () => void;
}) {
  const remove = useDeleteInvestment();

  const close = () => {
    remove.reset();
    onClose();
  };

  return (
    <Modal open={investment !== null} onClose={close} title="Delete investment?">
      {investment && (
        <div className="space-y-4">
          {remove.isError && <Alert>{getErrorMessage(remove.error)}</Alert>}
          <p className="text-sm text-slate-600">This can&apos;t be undone.</p>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-slate-900">{investment.name}</p>
              <p className="text-slate-500">{INVESTMENT_TYPE_META[investment.type].label}</p>
            </div>
            <span className="font-semibold tabular-nums text-slate-900">
              {formatCurrency(investment.currentValue)}
            </span>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={remove.isPending}
              onClick={() => remove.mutate(investment.id, { onSuccess: close })}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
