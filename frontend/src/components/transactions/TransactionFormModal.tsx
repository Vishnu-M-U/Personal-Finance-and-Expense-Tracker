"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  useCreateTransaction,
  useUpdateTransaction,
  type TransactionInput,
} from "@/hooks/useTransactions";
import { getErrorCode, getErrorMessage, getFieldErrors } from "@/lib/api";
import { cn } from "@/lib/cn";
import { todayLocal } from "@/lib/format";
import { transactionFormSchema, type TransactionFormValues } from "@/schemas/transaction";
import type { Category, Transaction, TransactionType } from "@/types/api";

interface Props {
  open: boolean;
  /** The transaction to edit, or null to create a new one. */
  transaction: Transaction | null;
  categories: Category[];
  onClose: () => void;
}

export function TransactionFormModal({ open, transaction, categories, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={transaction ? "Edit transaction" : "Add transaction"}
    >
      {/* Keyed so the form resets whenever a different transaction is opened. */}
      <TransactionForm
        key={transaction?.id ?? "new"}
        transaction={transaction}
        categories={categories}
        onDone={onClose}
      />
    </Modal>
  );
}

const FORM_FIELDS = ["type", "amount", "date", "categoryId", "description"] as const;

function TransactionForm({
  transaction,
  categories,
  onDone,
}: {
  transaction: Transaction | null;
  categories: Category[];
  onDone: () => void;
}) {
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const mutation = transaction ? update : create;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: transaction.amount,
          date: transaction.date,
          categoryId: String(transaction.category.id),
          description: transaction.description ?? "",
        }
      : { type: "EXPENSE", amount: "", date: todayLocal(), categoryId: "", description: "" },
  });

  const type = useWatch({ control, name: "type" });
  const typeCategories = categories.filter((c) => c.type === type);

  const changeType = (next: TransactionType) => {
    setValue("type", next);
    const current = categories.find((c) => String(c.id) === getValues("categoryId"));
    if (current && current.type !== next) setValue("categoryId", "");
  };

  const onSubmit = (values: TransactionFormValues) => {
    const input: TransactionInput = {
      type: values.type,
      amount: values.amount,
      date: values.date,
      categoryId: Number(values.categoryId),
      description: values.description || null,
    };
    const options = {
      onSuccess: onDone,
      onError: (error: unknown) => {
        for (const [field, message] of Object.entries(getFieldErrors(error))) {
          const name = FORM_FIELDS.find((f) => f === field);
          if (name) setError(name, { message });
        }
      },
    };
    if (transaction) update.mutate({ id: transaction.id, input }, options);
    else create.mutate(input, options);
  };

  const showBanner = mutation.isError && getErrorCode(mutation.error) !== "VALIDATION_ERROR";

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      {showBanner && <Alert>{getErrorMessage(mutation.error)}</Alert>}

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-slate-700">Type</legend>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          {(["EXPENSE", "INCOME"] as const).map((option) => (
            <label
              key={option}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-indigo-600",
                type === option
                  ? option === "INCOME"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "bg-white text-rose-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <input
                type="radio"
                value={option}
                checked={type === option}
                onChange={() => changeType(option)}
                className="sr-only"
              />
              {option === "INCOME" ? "Income" : "Expense"}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Amount" htmlFor="amount" error={errors.amount?.message}>
          <Input
            id="amount"
            data-autofocus
            inputMode="decimal"
            placeholder="0.00"
            autoComplete="off"
            aria-invalid={!!errors.amount}
            {...register("amount")}
          />
        </Field>
        <Field label="Date" htmlFor="date" error={errors.date?.message}>
          <Input id="date" type="date" aria-invalid={!!errors.date} {...register("date")} />
        </Field>
      </div>

      <Field label="Category" htmlFor="categoryId" error={errors.categoryId?.message}>
        <Select id="categoryId" aria-invalid={!!errors.categoryId} {...register("categoryId")}>
          <option value="">Choose a category</option>
          {typeCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Description"
        htmlFor="description"
        error={errors.description?.message}
        hint="Optional"
      >
        <Input
          id="description"
          maxLength={255}
          autoComplete="off"
          aria-invalid={!!errors.description}
          {...register("description")}
        />
      </Field>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          {transaction ? "Save changes" : "Add transaction"}
        </Button>
      </div>
    </form>
  );
}
