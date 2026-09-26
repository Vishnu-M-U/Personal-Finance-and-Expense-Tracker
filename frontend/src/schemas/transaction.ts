import { z } from "zod";

// Mirrors the backend rules in SPEC/api.md. Values stay strings to match the form inputs.
export const transactionFormSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .regex(/^\d{1,10}(\.\d{1,2})?$/, "Enter a positive amount with up to 2 decimals")
    .refine((value) => Number(value) > 0, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  categoryId: z.string().min(1, "Choose a category"),
  description: z.string().trim().max(255, "Description must be at most 255 characters"),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
