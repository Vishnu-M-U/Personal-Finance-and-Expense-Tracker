import { z } from "zod";

const MONEY = /^\d{1,10}(\.\d{1,2})?$/;

// Mirrors the backend rules for /api/investments. Values stay strings to match the form inputs.
export const investmentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  type: z.string().min(1, "Choose a type"),
  investedAmount: z
    .string()
    .trim()
    .min(1, "Amount invested is required")
    .regex(MONEY, "Enter a positive amount with up to 2 decimals")
    .refine((value) => Number(value) > 0, "Amount invested must be greater than 0"),
  currentValue: z
    .string()
    .trim()
    .min(1, "Current value is required")
    .regex(MONEY, "Enter an amount with up to 2 decimals"),
});

export type InvestmentFormValues = z.infer<typeof investmentFormSchema>;
