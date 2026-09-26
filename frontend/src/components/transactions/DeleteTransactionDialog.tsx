"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useDeleteTransaction } from "@/hooks/useTransactions";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Transaction } from "@/types/api";
import { Amount } from "./Amount";

export function DeleteTransactionDialog({
  transaction,
  onClose,
}: {
  transaction: Transaction | null;
  onClose: () => void;
}) {
  const remove = useDeleteTransaction();

  const close = () => {
    remove.reset();
    onClose();
  };

  return (
    <Modal open={transaction !== null} onClose={close} title="Delete transaction?">
      {transaction && (
        <div className="space-y-4">
          {remove.isError && <Alert>{getErrorMessage(remove.error)}</Alert>}
          <p className="text-sm text-slate-600">This can&apos;t be undone.</p>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-slate-900">
                {transaction.description ?? transaction.category.name}
              </p>
              <p className="text-slate-500">
                {formatDate(transaction.date)} · {transaction.category.name}
              </p>
            </div>
            <Amount amount={transaction.amount} type={transaction.type} />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={remove.isPending}
              onClick={() => remove.mutate(transaction.id, { onSuccess: close })}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
