/**
 * Role-Based Access Control (RBAC) Library
 * Provides permission checking and validation functions
 */

import { roles, rolePermissions } from '../shared/schema';

/**
 * Check if user has specific permission
 */
export function checkPermission(userRoles: string[], permission: string): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  // Super admin has all permissions
  if (userRoles.includes('super_admin')) {
    return true;
  }

  // Check if any of the user's roles has the required permission
  for (const role of userRoles) {
    const rolePermissionsList = rolePermissions[role as keyof typeof rolePermissions];
    if (rolePermissionsList && Array.isArray(rolePermissionsList) && rolePermissionsList.includes(permission as any)) {
      return true;
    }
  }

  return false;
}

/**
 * Get all permissions for given roles
 */
export function getUserPermissions(userRoles: string[]): string[] {
  if (!userRoles || userRoles.length === 0) {
    return [];
  }

  const permissions = new Set<string>();

  for (const role of userRoles) {
    const rolePermissionsList = rolePermissions[role as keyof typeof rolePermissions];
    if (rolePermissionsList && Array.isArray(rolePermissionsList)) {
      rolePermissionsList.forEach((permission: any) => permissions.add(permission));
    }
  }

  return Array.from(permissions);
}

/**
 * Check if user has permission (alias for checkPermission)
 */
export function hasPermission(permission: string, userRoles: string[]): boolean {
  return checkPermission(userRoles, permission);
}