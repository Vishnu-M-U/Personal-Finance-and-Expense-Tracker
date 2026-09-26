import { QueryClient } from "@tanstack/react-query";

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry client errors like 401/404; retry network/server errors once.
          const status = (error as { response?: { status?: number } }).response?.status;
          return status === undefined || status >= 500 ? failureCount < 1 : false;
        },
      },
    },
  });
}

/** One client per server render, one shared client in the browser. */
export function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
