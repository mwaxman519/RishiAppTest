import { useAuth, User } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { permissionMatches } from "@/lib/utils";
import { 
  ROLE_PERMISSIONS, 
  getRolePermissions, 
  UserRole 
} from "@shared/rbac-roles";

/**
 * Hook to check user permissions
 * Combines role-based permissions with any custom user permissions
 * Uses centralized permission definitions from shared/rbac-roles.ts
 */
export function usePermissions() {
  const { user } = useAuth();
  
  // Fetch additional permissions from API (user-specific permissions)
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/auth/permissions"],
    // Only fetch if user is logged in
    enabled: !!user,
  });
  
  // Get the role-based permissions including inheritance
  const rolePermissions = user?.role 
    ? getRolePermissions(user.role as UserRole)
    : [];
  
  // Combine role-based permissions with any custom permissions from API
  const permissions = user 
    ? [...rolePermissions, ...(data?.permissions || [])]
    : [];
  
  /**
   * Check if user has permission
   * @param requiredPermission The permission to check for (format: "action:resource")
   */
  const hasPermission = (requiredPermission: string): boolean => {
    if (!user) return false;
    
    // Check for negations first (permissions prefixed with !)
    const negations = permissions.filter(p => p.startsWith('!'));
    for (const negation of negations) {
      if (permissionMatches(requiredPermission, [negation.substring(1)])) {
        return false;
      }
    }
    
    // Check for positive permissions
    const positivePermissions = permissions.filter(p => !p.startsWith('!'));
    return permissionMatches(requiredPermission, positivePermissions);
  };
  
  /**
   * Check if user has any permission from a list
   * @param requiredPermissions Array of permissions (any match returns true)
   */
  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (!user || !requiredPermissions || requiredPermissions.length === 0) return false;
    return requiredPermissions.some(perm => hasPermission(perm));
  };
  
  /**
   * Check if user has all permissions from a list
   * @param requiredPermissions Array of permissions (all must match)
   */
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (!user || !requiredPermissions || requiredPermissions.length === 0) return false;
    return requiredPermissions.every(perm => hasPermission(perm));
  };
  
  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
    error
  };
}