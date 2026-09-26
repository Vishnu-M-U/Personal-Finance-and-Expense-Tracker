import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { TransactionFilters } from "@/lib/transactionFilters";
import type { PaginationMeta, Transaction, TransactionType } from "@/types/api";

export const PAGE_SIZE = 20;

export interface TransactionInput {
  type: TransactionType;
  amount: string;
  date: string;
  categoryId: number;
  description: string | null;
}

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: async () => {
      const res = await api.get<{ data: Transaction[]; meta: PaginationMeta }>("/transactions", {
        params: { ...filters, limit: PAGE_SIZE },
      });
      return res.data;
    },
    // Keep showing the current page while the next page or filter loads.
    placeholderData: keepPreviousData,
  });
}

/** Transactions and dashboard totals both change when a transaction changes. */
function useInvalidateTransactionData() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ]);
}

export function useCreateTransaction() {
  const invalidate = useInvalidateTransactionData();
  return useMutation({
    mutationFn: async (input: TransactionInput) =>
      (await api.post<{ data: Transaction }>("/transactions", input)).data.data,
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateTransactionData();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: TransactionInput }) =>
      (await api.patch<{ data: Transaction }>(`/transactions/${id}`, input)).data.data,
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateTransactionData();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/transactions/${id}`),
    onSuccess: invalidate,
  });
}
