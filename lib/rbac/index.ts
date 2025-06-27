/**
 * Role-Based Access Control (RBAC) system
 * This module provides the core functionality for controlling access to various features
 * based on user roles and permissions.
 */

import { Permission } from '../../types';
import hasPermission, { hasPermissionByRole } from './hasPermission';

// Define available roles in the system
export type RoleType = 'super_admin' | 'admin' | 'manager' | 'staff' | 'client' | 'guest';

// Define the structure of a role
export interface Role {
  name: RoleType;
  description: string;
  permissions: Permission[];
}

// Define the role hierarchy and permissions
export const ROLES: Record<string, Role> = {
  super_admin: {
    name: 'super_admin',
    description: 'Super administrator with full system access',
    permissions: [
      { action: '*', resource: '*' } // Wildcard permission - access to everything
    ]
  },
  admin: {
    name: 'admin',
    description: 'Organization administrator',
    permissions: [
      { action: 'create', resource: 'location' },
      { action: 'read', resource: 'location' },
      { action: 'update', resource: 'location' },
      { action: 'delete', resource: 'location' },
      { action: 'create', resource: 'booking' },
      { action: 'read', resource: 'booking' },
      { action: 'update', resource: 'booking' },
      { action: 'delete', resource: 'booking' },
      { action: 'approve', resource: 'booking' },
      { action: 'read', resource: 'analytics' },
      { action: 'manage', resource: 'staff' }
    ]
  },
  manager: {
    name: 'manager',
    description: 'Location or team manager',
    permissions: [
      { action: 'read', resource: 'location' },
      { action: 'create', resource: 'booking' },
      { action: 'read', resource: 'booking' },
      { action: 'update', resource: 'booking' },
      { action: 'approve', resource: 'booking' }
    ]
  },
  staff: {
    name: 'staff',
    description: 'Regular staff member',
    permissions: [
      { action: 'read', resource: 'location' },
      { action: 'read', resource: 'booking' },
      { action: 'create', resource: 'booking' }
    ]
  },
  client: {
    name: 'client',
    description: 'External client user',
    permissions: [
      { action: 'read', resource: 'location' },
      { action: 'create', resource: 'booking' },
      { action: 'read', resource: 'own_booking' }
    ]
  },
  guest: {
    name: 'guest',
    description: 'Unauthenticated or guest user',
    permissions: [
      { action: 'read', resource: 'public_location' }
    ]
  }
};

/**
 * Get permissions for a given user based on their roles
 * @param userRoles User roles array
 * @returns Array of permissions
 */
export function getUserPermissions(userRoles: string[]): Permission[] {
  const permissions: Permission[] = [];
  
  // Collect permissions from all roles the user has
  userRoles.forEach(role => {
    const roleConfig = ROLES[role];
    if (roleConfig) {
      roleConfig.permissions.forEach(permission => {
        // Only add if not already in the list
        if (!permissions.some(p => 
          p.action === permission.action && 
          p.resource === permission.resource
        )) {
          permissions.push(permission);
        }
      });
    }
  });
  
  return permissions;
}

/**
 * Get all available permissions in the system
 * @returns Array of all permissions
 */
export function getAllPermissions(): Permission[] {
  const allPermissions: Permission[] = [];
  
  Object.values(ROLES).forEach(role => {
    role.permissions.forEach(permission => {
      // Only add if not already in the list
      if (!allPermissions.some(p => 
        p.action === permission.action && 
        p.resource === permission.resource
      )) {
        allPermissions.push(permission);
      }
    });
  });
  
  return allPermissions;
}

/**
 * Check if a role has a specific permission
 * @param role Role name
 * @param action Action to check
 * @param resource Resource to check
 * @returns Boolean indicating if role has permission
 */
export function roleHasPermission(role: string, action: string, resource: string): boolean {
  const roleConfig = ROLES[role];
  if (!roleConfig) return false;
  
  return roleConfig.permissions.some(permission => {
    // Check for wildcard permissions
    if (permission.action === '*' && permission.resource === '*') return true;
    if (permission.action === '*' && permission.resource === resource) return true;
    if (permission.action === action && permission.resource === '*') return true;
    
    return permission.action === action && permission.resource === resource;
  });
}

/**
 * Get role hierarchy level
 * @param role Role name
 * @returns Numeric level of the role
 */
export function getRoleLevel(role: string): number {
  const roleLevels: Record<string, number> = {
    'super_admin': 100,
    'admin': 80,
    'manager': 60,
    'staff': 40,
    'client': 20,
    'guest': 10
  };
  
  return roleLevels[role] || 0;
}

// Export the Permission interface and RBAC functions
export type { Permission };
export { hasPermission, hasPermissionByRole };