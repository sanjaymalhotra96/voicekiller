import { QueryClient } from '@tanstack/react-query';
import { toAppError } from '@/lib/errors';
import { startNetworkSync } from '@/lib/network';

// Pause requests while offline, resume and refetch on reconnect.
startNetworkSync();

// Only retry failures that can fix themselves (network blips).
const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < 2 && toAppError(error).code === 'network';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: shouldRetry,
    },
    mutations: {
      retry: false,
    },
  },
});
