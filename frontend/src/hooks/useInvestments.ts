import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Investment, InvestmentSummary, InvestmentType } from "@/types/api";

export interface InvestmentInput {
  name: string;
  type: InvestmentType;
  investedAmount: string;
  currentValue: string;
}

export function useInvestments() {
  return useQuery({
    queryKey: queryKeys.investments,
    queryFn: async () =>
      (await api.get<{ data: Investment[]; summary: InvestmentSummary }>("/investments")).data,
  });
}

function useInvalidateInvestments() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.investments });
}

export function useCreateInvestment() {
  const invalidate = useInvalidateInvestments();
  return useMutation({
    mutationFn: async (input: InvestmentInput) =>
      (await api.post<{ data: Investment }>("/investments", input)).data.data,
    onSuccess: invalidate,
  });
}

export function useUpdateInvestment() {
  const invalidate = useInvalidateInvestments();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: InvestmentInput }) =>
      (await api.patch<{ data: Investment }>(`/investments/${id}`, input)).data.data,
    onSuccess: invalidate,
  });
}

export function useDeleteInvestment() {
  const invalidate = useInvalidateInvestments();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/investments/${id}`),
    onSuccess: invalidate,
  });
}
