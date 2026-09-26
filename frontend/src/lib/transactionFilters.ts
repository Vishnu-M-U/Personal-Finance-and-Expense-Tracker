import type { TransactionType } from "@/types/api";

/** Transaction list filters. Mirrors the query params of GET /api/transactions. */
export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy: "date" | "amount";
  sortOrder: "asc" | "desc";
  page: number;
}
