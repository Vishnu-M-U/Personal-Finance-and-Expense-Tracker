"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  useCreateInvestment,
  useUpdateInvestment,
  type InvestmentInput,
} from "@/hooks/useInvestments";
import { getErrorCode, getErrorMessage, getFieldErrors } from "@/lib/api";
import { INVESTMENT_TYPES, INVESTMENT_TYPE_META } from "@/lib/investments";
import { investmentFormSchema, type InvestmentFormValues } from "@/schemas/investment";
import type { Investment, InvestmentType } from "@/types/api";

interface Props {
  open: boolean;
  /** The investment to edit, or null to add a new one. */
  investment: Investment | null;
  onClose: () => void;
}

export function InvestmentFormModal({ open, investment, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={investment ? "Edit investment" : "Add investment"}>
      {/* Keyed so the form resets whenever a different investment is opened. */}
      <InvestmentForm key={investment?.id ?? "new"} investment={investment} onDone={onClose} />
    </Modal>
  );
}

const FORM_FIELDS = ["name", "type", "investedAmount", "currentValue"] as const;

function InvestmentForm({
  investment,
  onDone,
}: {
  investment: Investment | null;
  onDone: () => void;
}) {
  const create = useCreateInvestment();
  const update = useUpdateInvestment();
  const mutation = investment ? update : create;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: investment
      ? {
          name: investment.name,
          type: investment.type,
          investedAmount: investment.investedAmount,
          currentValue: investment.currentValue,
        }
      : { name: "", type: "", investedAmount: "", currentValue: "" },
  });

  const onSubmit = (values: InvestmentFormValues) => {
    const input: InvestmentInput = {
      name: values.name,
      type: values.type as InvestmentType,
      investedAmount: values.investedAmount,
      currentValue: values.currentValue,
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
    if (investment) update.mutate({ id: investment.id, input }, options);
    else create.mutate(input, options);
  };

  const showBanner = mutation.isError && getErrorCode(mutation.error) !== "VALIDATION_ERROR";

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      {showBanner && <Alert>{getErrorMessage(mutation.error)}</Alert>}

      <Field label="Name" htmlFor="inv-name" error={errors.name?.message}>
        <Input
          id="inv-name"
          data-autofocus
          maxLength={100}
          autoComplete="off"
          placeholder="e.g. Nippon Small Cap"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
      </Field>

      <Field label="Type" htmlFor="inv-type" error={errors.type?.message}>
        <Select id="inv-type" aria-invalid={!!errors.type} {...register("type")}>
          <option value="">Choose a type</option>
          {INVESTMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {INVESTMENT_TYPE_META[type].label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Amount invested"
          htmlFor="inv-invested"
          error={errors.investedAmount?.message}
        >
          <Input
            id="inv-invested"
            inputMode="decimal"
            placeholder="0.00"
            autoComplete="off"
            aria-invalid={!!errors.investedAmount}
            {...register("investedAmount")}
          />
        </Field>
        <Field
          label="Current value"
          htmlFor="inv-current"
          error={errors.currentValue?.message}
          hint="Update this whenever the value changes"
        >
          <Input
            id="inv-current"
            inputMode="decimal"
            placeholder="0.00"
            autoComplete="off"
            aria-invalid={!!errors.currentValue}
            {...register("currentValue")}
          />
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          {investment ? "Save changes" : "Add investment"}
        </Button>
      </div>
    </form>
  );
}
