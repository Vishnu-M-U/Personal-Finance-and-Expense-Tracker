import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Category } from "@/types/api";

/** All predefined categories. They never change, so they're fetched once per session. */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: async () => (await api.get<{ data: Category[] }>("/categories")).data.data,
    staleTime: Infinity,
  });
}
