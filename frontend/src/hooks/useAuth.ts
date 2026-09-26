import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { User } from "@/types/api";
import type { LoginValues, RegisterValues } from "@/schemas/auth";

/** The logged-in user, or null when logged out. */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async (): Promise<User | null> => {
      try {
        const res = await api.get<{ data: { user: User } }>("/auth/me");
        return res.data.data.user;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) return null;
        throw error;
      }
    },
    staleTime: 5 * 60_000,
  });
}

/**
 * Sets the current user and drops every other cached query (they belong to the previous user).
 * The `me` query itself is updated in place, not removed, so components watching it re-render.
 */
function switchUser(queryClient: QueryClient, user: User | null) {
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== queryKeys.me[0] });
  queryClient.setQueryData(queryKeys.me, user);
}

function useSession<TValues>(path: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: TValues) => {
      const res = await api.post<{ data: { user: User } }>(path, values);
      return res.data.data.user;
    },
    onSuccess: (user) => switchUser(queryClient, user),
  });
}

export const useLogin = () => useSession<LoginValues>("/auth/login");
export const useRegister = () => useSession<RegisterValues>("/auth/register");

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSettled: () => switchUser(queryClient, null),
  });
}
