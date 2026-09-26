import { z } from "zod";
import { amount, dateString, optionalQuery, transactionType } from "../../utils/schemas.js";

const description = z
  .string()
  .trim()
  .max(255, "Description must be at most 255 characters")
  .nullable()
  .transform((value) => (value === "" ? null : value));

export const createTransactionSchema = z.object({
  type: transactionType,
  amount,
  date: dateString,
  categoryId: z.number().int().positive(),
  description: description.optional().transform((value) => value ?? null),
});

export const updateTransactionSchema = z
  .object({
    type: transactionType,
    amount,
    date: dateString,
    categoryId: z.number().int().positive(),
    description,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

export const listTransactionsQuery = z
  .object({
    type: optionalQuery(transactionType),
    categoryId: optionalQuery(z.coerce.number().int().positive()),
    startDate: optionalQuery(dateString),
    endDate: optionalQuery(dateString),
    search: optionalQuery(z.string().trim().max(100)),
    sortBy: optionalQuery(z.enum(["date", "amount", "createdAt"])).transform((v) => v ?? "date"),
    sortOrder: optionalQuery(z.enum(["asc", "desc"])).transform((v) => v ?? "desc"),
    page: optionalQuery(z.coerce.number().int().min(1)).transform((v) => v ?? 1),
    limit: optionalQuery(z.coerce.number().int().min(1).max(100)).transform((v) => v ?? 20),
  })
  .refine((q) => !q.startDate || !q.endDate || q.endDate >= q.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuery>;
