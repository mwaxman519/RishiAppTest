import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { createContext, ReactNode, useContext } from "react";
import { useToast } from "./use-toast";

// User type from API
export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  role: string;
  organizationId?: string;
  isActive?: boolean;
}

// Login input data
export interface LoginData {
  username: string;
  password: string;
}

// Registration input data
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provider component for authentication state
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Query to fetch the current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log('Attempting login with username:', credentials.username);
        const res = await apiRequest("POST", "/api/auth/login", credentials);
        const data = await res.json();
        return data;
      } catch (error) {
        console.error('Login error in mutation:', error);
        throw error;
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error('Login mutation error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    },
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      try {
        console.log('Attempting registration with username:', userData.username);
        // Log the data being sent, but hide sensitive fields
        console.log('Registration data:', {
          ...userData,
          password: '[REDACTED]',
          confirmPassword: '[REDACTED]'
        });
        
        // Add organization option for the auth service API
        const registrationData = {
          ...userData,
          organizationOption: 'default', // Use default organization
          confirmPassword: userData.password // Ensure confirmPassword is provided
        };
        
        // Add timeout to the fetch request to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const res = await apiRequest("POST", "/api/auth-service/routes/register", registrationData, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          // Check if response is ok before parsing JSON
          if (!res.ok) {
            let errorData;
            try {
              errorData = await res.json();
              console.error('Registration error response:', errorData);
            } catch (parseError) {
              console.error('Failed to parse error response:', parseError);
              // If we can't parse the JSON, use status text
              throw new Error(`Registration failed: ${res.status} ${res.statusText}`);
            }
            
            // Extract detailed error message from the response
            let errorMessage = "Registration failed";
            if (errorData.error && typeof errorData.error === 'object') {
              errorMessage = errorData.error.message || errorMessage;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
            
            // Create user-friendly error messages for specific errors
            if (errorMessage.includes('database') || 
                errorMessage.includes('connection') || 
                errorMessage.includes('Database') ||
                errorMessage.includes('initialization') ||
                errorMessage.includes('not been initialized')) {
              errorMessage = "The registration service is currently having database issues. Please try again later or contact support.";
            } else if (errorMessage.includes('password authentication failed')) {
              errorMessage = "Database connection error. Our team has been notified of this issue.";
            } else if (errorMessage.includes('duplicate key') || errorMessage.includes('already exists')) {
              errorMessage = "Username or email already exists. Please choose a different one.";
            } else if (res.status === 500) {
              errorMessage = "Our registration system is currently experiencing technical difficulties. Please try again later.";
            }
            
            throw new Error(errorMessage);
          }
          
          const data = await res.json();
          return data;
        } catch (fetchError) {
          clearTimeout(timeoutId);
          // Handle abort error specifically
          if (fetchError.name === 'AbortError') {
            throw new Error('Registration request timed out. Please check your internet connection and try again.');
          }
          throw fetchError;
        }
      } catch (error) {
        console.error('Registration error in mutation:', error);
        
        // Ensure we return a proper error message even for unexpected errors
        if (error instanceof Error) {
          // Pass the error message through
          throw error;
        } else {
          // Stringify other error types
          throw new Error(String(error) || 'An unknown error occurred during registration');
        }
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.firstName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error('Registration mutation error:', error);
      
      // Create a user-friendly error message
      let errorMessage = error.message || "There was a problem with your registration";
      
      // Format the error message for specific known problems
      if (errorMessage.includes('password authentication')) {
        errorMessage = "Database connection error. Please try again later or contact support.";
      } else if (errorMessage.includes('neondb_owner')) {
        errorMessage = "Database authentication error. Please try again later or contact support.";
      } else if (errorMessage.includes('500')) {
        errorMessage = "The registration service is currently experiencing technical difficulties. Please try again later.";
      }
      
      // Display the error message to the user
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
        duration: 6000, // Show for longer so user can see it
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication state and functions
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}