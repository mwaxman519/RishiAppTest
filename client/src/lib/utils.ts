import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS support
 * Combines clsx and tailwind-merge to handle conditional classes and conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date with options
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  }
): string {
  const d = typeof date === "string" || typeof date === "number" 
    ? new Date(date) 
    : date;
  
  return new Intl.DateTimeFormat("en-US", options).format(d);
}

/**
 * Format a time with options
 */
export function formatTime(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }
): string {
  const d = typeof date === "string" || typeof date === "number" 
    ? new Date(date) 
    : date;
  
  return new Intl.DateTimeFormat("en-US", options).format(d);
}

// Import RBAC utilities from shared module
import { userHasRole as hasRole, permissionMatches as matchesPermission } from "@shared/rbac-roles";

/**
 * Check if a user has a specific role
 * This re-exports the shared function with additional type safety
 */
export function userHasRole(userRole: string | undefined, requiredRole: string): boolean {
  return hasRole(userRole || "", requiredRole);
}

/**
 * Check if a permission is included in a permission list
 * Supports wildcard matching with '*'
 * This re-exports the shared function with the same interface
 */
export function permissionMatches(
  permission: string, 
  permissionList: string[]
): boolean {
  return matchesPermission(permission, permissionList);
}