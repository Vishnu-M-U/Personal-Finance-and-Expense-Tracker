import { z } from "zod";

/** Shared Zod building blocks for request validation. */

export const transactionType = z.enum(["INCOME", "EXPENSE"]);

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

/** A real calendar date in YYYY-MM-DD format. */
export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, "Invalid date");

/** A money amount (number or numeric string) as a string with at most 2 decimals. */
const money = z
  .union([z.number(), z.string().trim()])
  .transform((value) => String(value))
  .pipe(
    z
      .string()
      .regex(/^\d{1,10}(\.\d{1,2})?$/, "Amount must be a number with at most 2 decimal places"),
  );

/**
 * A positive money amount with at most 2 decimals, up to 9,999,999,999.99.
 * Accepts a number or numeric string; always outputs a string so no float math happens.
 */
export const amount = money.refine((value) => Number(value) > 0, "Amount must be greater than 0");

/** Like `amount`, but zero is allowed (e.g. an investment that lost all its value). */
export const nonNegativeAmount = money;

/** Treats an empty query-string value (e.g. `?search=`) as absent. */
export function optionalQuery<T extends z.ZodType>(schema: T) {
  return z.preprocess((value) => (value === "" ? undefined : value), schema.optional());
}
