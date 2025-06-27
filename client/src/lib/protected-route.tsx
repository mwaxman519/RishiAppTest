import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { userHasRole } from "@shared/rbac-roles";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
  requiredRole?: string;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  redirectTo?: string;
  accessDeniedRedirect?: string;
};

/**
 * Route component that protects its content with authentication and permission checks
 * Redirects to auth page if user is not authenticated
 * Optionally checks for a specific role or permission requirements
 */
export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
  permission,
  permissions = [],
  requireAll = false,
  redirectTo = "/auth",
  accessDeniedRedirect = "/", // Where to redirect on permission denied
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { 
    hasPermission, 
    hasAllPermissions, 
    hasAnyPermission,
    isLoading: permissionsLoading 
  } = usePermissions();

  // While loading auth or permissions state, show spinner
  if (isLoading || permissionsLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // If no user is authenticated, redirect to auth page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to={redirectTo} />
      </Route>
    );
  }

  // Role check: if a specific role is required, check that the user has it
  if (requiredRole && !userHasRole(user.role, requiredRole)) {
    return (
      <Route path={path}>
        <Redirect to={accessDeniedRedirect} />
      </Route>
    );
  }

  // Permission check: if specific permission(s) are required, check user has them
  let hasRequiredPermissions = true;

  if (permission) {
    hasRequiredPermissions = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasRequiredPermissions = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  if (!hasRequiredPermissions) {
    return (
      <Route path={path}>
        <Redirect to={accessDeniedRedirect} />
      </Route>
    );
  }

  // User is authenticated and has required role/permissions
  return <Route path={path} component={Component} />;
}