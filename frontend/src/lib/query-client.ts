import { QueryClient } from "@tanstack/react-query";

import { ApiRequestError } from "@/lib/api";

// Retry transient network failures (e.g. backend cold start, DNS/TLS warm-up)
// that surface as "Failed to fetch", but never retry deterministic 4xx errors.
function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiRequestError) {
    const status = error.statusCode;
    // Retry timeouts (408) and 5xx; skip other client errors (4xx).
    const isRetryable = status === 408 || status >= 500;
    return isRetryable && failureCount < 3;
  }

  // Non-API errors are network-level failures -> retry a few times.
  return failureCount < 3;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: shouldRetryQuery,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
});
