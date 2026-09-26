import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { DateRange } from "@/lib/periods";
import type { DashboardSummary } from "@/types/api";

export function useDashboardSummary({ startDate, endDate }: DateRange, enabled = true) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(startDate, endDate),
    queryFn: async () =>
      (
        await api.get<{ data: DashboardSummary }>("/dashboard/summary", {
          params: { startDate, endDate },
        })
      ).data.data,
    placeholderData: keepPreviousData,
    enabled,
  });
}
