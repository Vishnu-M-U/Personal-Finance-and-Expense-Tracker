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

export const DEFAULT_SORT = { sortBy: "date", sortOrder: "desc" } as const;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function positiveInt(value: string | null): number | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

/** Reads filters from the URL, ignoring anything invalid. */
export function parseFilters(params: URLSearchParams): TransactionFilters {
  const type = params.get("type");
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");
  const sortBy = params.get("sortBy");
  const sortOrder = params.get("sortOrder");

  return {
    type: type === "INCOME" || type === "EXPENSE" ? type : undefined,
    categoryId: positiveInt(params.get("categoryId")),
    startDate: startDate && DATE_RE.test(startDate) ? startDate : undefined,
    endDate: endDate && DATE_RE.test(endDate) ? endDate : undefined,
    search: params.get("search")?.trim() || undefined,
    sortBy: sortBy === "amount" ? "amount" : DEFAULT_SORT.sortBy,
    sortOrder: sortOrder === "asc" ? "asc" : DEFAULT_SORT.sortOrder,
    page: positiveInt(params.get("page")) ?? 1,
  };
}

/** Writes filters to a query string, leaving out defaults and empty values. */
export function filtersToQueryString(filters: TransactionFilters): string {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.categoryId) params.set("categoryId", String(filters.categoryId));
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.search) params.set("search", filters.search);
  if (filters.sortBy !== DEFAULT_SORT.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder !== DEFAULT_SORT.sortOrder) params.set("sortOrder", filters.sortOrder);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return Boolean(
    filters.type || filters.categoryId || filters.startDate || filters.endDate || filters.search,
  );
}
