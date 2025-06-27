/**
 * TanStack Query Client Configuration
 * Provides centralized query client for data fetching throughout the application
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Default query function for API requests
function defaultQueryFn({ queryKey }: { queryKey: readonly unknown[] }): Promise<any> {
  const [url] = queryKey;
  if (typeof url !== 'string') {
    throw new Error('Query key must start with a URL string');
  }

  return fetch(url).then(res => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  });
}

// API request function for mutations
export async function apiRequest(url: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Default query client options
const defaultOptions: DefaultOptions = {
  queries: {
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    queryFn: defaultQueryFn,
  },
  mutations: {
    retry: false,
  },
};

// Create and export the query client
export const queryClient = new QueryClient({
  defaultOptions,
});

// Additional exports for backwards compatibility
export { QueryClient } from '@tanstack/react-query';

// Export default for compatibility
export default queryClient;