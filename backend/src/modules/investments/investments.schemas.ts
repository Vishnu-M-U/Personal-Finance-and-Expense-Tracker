import { z } from "zod";
import { amount, nonNegativeAmount } from "../../utils/schemas.js";

export const investmentType = z.enum([
  "MUTUAL_FUND",
  "STOCKS",
  "GOLD",
  "FIXED_DEPOSIT",
  "BONDS",
  "REAL_ESTATE",
  "CRYPTO",
  "OTHER",
]);

const name = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

export const createInvestmentSchema = z.object({
  name,
  type: investmentType,
  investedAmount: amount,
  currentValue: nonNegativeAmount,
});

export const updateInvestmentSchema = createInvestmentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>;
