import React, { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/hooks/use-auth";
import { userHasRole } from "@shared/rbac-roles";

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string | string[];
  requiredRole?: string;
  requireAll?: boolean;
  fallback?: ReactNode;
  hideIfNoAccess?: boolean;
}

/**
 * Component that conditionally renders its children based on user permissions/role
 * Uses the centralized RBAC system to determine access
 * 
 * @example
 * // Render content only if user has 'edit:users' permission
 * <PermissionGuard permission="edit:users">
 *   <EditUserButton />
 * </PermissionGuard>
 * 
 * @example
 * // Render content only if user has all listed permissions
 * <PermissionGuard 
 *   permissions={["view:users", "edit:users"]} 
 *   requireAll
 * >
 *   <UserAdminPanel />
 * </PermissionGuard>
 * 
 * @example
 * // Render content only if user has the required role or higher
 * <PermissionGuard requiredRole="internal_admin">
 *   <AdminControls />
 * </PermissionGuard>
 * 
 * @example
 * // Completely hide content if user lacks permission
 * <PermissionGuard 
 *   permission="view:admin" 
 *   hideIfNoAccess
 * >
 *   <AdminPanel />
 * </PermissionGuard>
 * 
 * @example
 * // Render fallback content if user lacks permission
 * <PermissionGuard 
 *   permission="delete:events" 
 *   fallback={<ReadOnlyView />}
 * >
 *   <EditableView />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  requiredRole,
  requireAll = false,
  fallback = null,
  hideIfNoAccess = false,
}: PermissionGuardProps) {
  const { user } = useAuth();
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  // If no permissions or role is specified, always render children
  if (!permission && !permissions && !requiredRole) {
    return <>{children}</>;
  }

  // Check if user has the required role
  const hasRequiredRole = requiredRole ? user && userHasRole(user.role, requiredRole) : true;

  // Check for permissions
  let hasRequiredPermissions = true;
  
  if (permission) {
    // Single permission check
    hasRequiredPermissions = hasPermission(permission);
  } else if (permissions) {
    // Handle both string and string[] types for permissions
    const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];
    
    if (permissionsArray.length > 0) {
      hasRequiredPermissions = requireAll
        ? hasAllPermissions(permissionsArray)
        : hasAnyPermission(permissionsArray);
    }
  }

  // Render children if user has both the required role AND permissions
  if (hasRequiredRole && hasRequiredPermissions) {
    return <>{children}</>;
  }

  // Skip rendering entirely if hideIfNoAccess is true
  if (hideIfNoAccess) {
    return null;
  }

  // Otherwise render fallback
  return <>{fallback}</>;
}