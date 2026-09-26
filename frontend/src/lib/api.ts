import axios, { isAxiosError } from "axios";
import type { ApiErrorBody } from "@/types/api";
import { getQueryClient } from "./queryClient";
import { queryKeys } from "./queryKeys";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Auth endpoints report 401 as a normal outcome (e.g. wrong password, not logged in).
const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/me"];

api.interceptors.response.use(undefined, (error) => {
  if (
    isAxiosError(error) &&
    error.response?.status === 401 &&
    !AUTH_PATHS.includes(error.config?.url ?? "")
  ) {
    // Session expired: mark the user as logged out. The (app) layout then redirects to /login.
    const queryClient = getQueryClient();
    queryClient.setQueryData(queryKeys.me, null);
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "me" });
  }
  return Promise.reject(error);
});

function errorBody(error: unknown): ApiErrorBody["error"] | undefined {
  if (isAxiosError<ApiErrorBody>(error)) return error.response?.data?.error;
  return undefined;
}

/** A user-facing message for any error thrown by an API call. */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error) && !error.response) {
    return "Can't reach the server. Check your connection and try again.";
  }
  return errorBody(error)?.message ?? "Something went wrong. Please try again.";
}

/** Field-level validation errors from a 400 response, keyed by field name. */
export function getFieldErrors(error: unknown): Record<string, string> {
  const details = errorBody(error)?.details ?? [];
  return Object.fromEntries(details.map((d) => [d.field, d.message]));
}

export function getErrorCode(error: unknown): string | undefined {
  return errorBody(error)?.code;
}
