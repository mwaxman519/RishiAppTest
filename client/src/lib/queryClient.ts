import { 
  QueryClient, 
  QueryKey, 
  QueryFunction, 
  QueryClientConfig,
  DefaultOptions
} from '@tanstack/react-query';

const API_BASE_URL = '';

/**
 * Default fetch handler for API requests
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Response object
 */
export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  headers: HeadersInit = {}
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const requestUrl = `${API_BASE_URL}${url}`;
    console.log(`Sending ${method} request to ${requestUrl}`);
    
    const response = await fetch(requestUrl, options);
    
    // Handle authentication errors
    if (response.status === 401) {
      console.log('Authentication error, redirecting to login');
    }
  
    // Handle non-200 responses
    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        
        // Handle auth service specific error format
        if (errorData.error && typeof errorData.error === 'object') {
          errorMessage = errorData.error.message || errorMessage;
          
          // Check for validation errors
          if (errorData.error.details && Array.isArray(errorData.error.details)) {
            const validationErrors = errorData.error.details
              .map((detail: any) => detail.message)
              .join(', ');
            if (validationErrors) {
              errorMessage = validationErrors;
            }
          }
        } 
        // Handle generic error format
        else if (errorData.error || errorData.message) {
          errorMessage = errorData.error?.message || errorData.message || errorData.error || errorMessage;
        }
        
        throw new Error(errorMessage);
      } catch (parseErr) {
        console.error('Error parsing error response', parseErr);
        if (parseErr instanceof Error && parseErr.message !== errorMessage) {
          throw parseErr;
        }
        throw new Error(errorMessage);
      }
    }
  
    return response;
  } catch (err) {
    console.error(`API request error for ${url}:`, err);
    throw err;
  }
}

/**
 * Default query function for React Query
 * Handles common error cases and response formatting
 */
export function getQueryFn(options: {
  on401?: 'throw' | 'returnNull';
} = {}): QueryFunction {
  return async ({ queryKey }) => {
    // The first element in the queryKey should be the URL
    const url = queryKey[0] as string;
    
    try {
      const response = await apiRequest('GET', url);
      return response.json();
    } catch (error) {
      // Handle auth errors
      if (
        error instanceof Error &&
        error.message.includes('401') && 
        options.on401 === 'returnNull'
      ) {
        return null;
      }
      throw error;
    }
  };
}

// Default query options
const defaultQueryOptions: DefaultOptions = {
  queries: {
    retry: 1,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    queryFn: getQueryFn(),
  },
};

// Create a QueryClient with default configuration
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});