import type { TransactionType } from "@/types/api";
import type { TransactionFilters } from "@/lib/transactionFilters";

export const queryKeys = {
  me: ["me"] as const,
  categories: (type?: TransactionType) => ["categories", type ?? "all"] as const,
  transactions: {
    all: ["transactions"] as const,
    list: (filters: TransactionFilters) => ["transactions", filters] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    summary: (startDate: string, endDate: string) => ["dashboard", { startDate, endDate }] as const,
  },
};
