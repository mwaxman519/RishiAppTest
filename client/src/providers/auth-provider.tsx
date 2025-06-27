import { createContext, ReactNode, useContext, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Loader2 } from "lucide-react";

// Create a context for the authentication state
interface AuthContextProps {
  children: ReactNode;
}

const AuthContextValue = createContext<{
  isInitializing: boolean;
}>({
  isInitializing: true,
});

/**
 * Provider component that initializes authentication state and permissions
 * Ensures auth data is loaded before rendering children
 */
export function AuthProvider({ children }: AuthContextProps) {
  const { user, isLoading: isUserLoading } = useAuth();
  const { isLoading: isPermissionsLoading } = usePermissions();
  
  // Determine if still initializing auth state
  const isInitializing = isUserLoading || isPermissionsLoading;

  // Show loading indicator while initializing auth
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Provide auth context value to children
  return (
    <AuthContextValue.Provider value={{ isInitializing }}>
      {children}
    </AuthContextValue.Provider>
  );
}

/**
 * Hook to access auth context values
 */
export function useAuthContext() {
  const context = useContext(AuthContextValue);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}