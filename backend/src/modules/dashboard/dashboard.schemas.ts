import { z } from "zod";
import { dateString, optionalQuery } from "../../utils/schemas.js";

export const summaryQuery = z
  .object({
    startDate: optionalQuery(dateString),
    endDate: optionalQuery(dateString),
  })
  .refine((q) => !q.startDate || !q.endDate || q.endDate >= q.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export type SummaryQuery = z.infer<typeof summaryQuery>;
