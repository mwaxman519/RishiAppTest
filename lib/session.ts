/**
 * Session management utilities
 * Provides functions for handling user sessions and authentication state
 */

import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Session } from 'next-auth';

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  organizationId?: string;
}

export interface ExtendedSession extends Session {
  user: SessionUser;
}

/**
 * Get session from request
 * @param req Next.js request object
 * @returns Session object or null
 */
export async function getSessionFromRequest(req: NextRequest): Promise<ExtendedSession | null> {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return null;
    }

    return {
      user: {
        id: token.sub as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as string,
        organizationId: token.organizationId as string
      },
      expires: new Date((token.exp as number) * 1000).toISOString()
    };
  } catch (error) {
    console.error('Error getting session from request:', error);
    return null;
  }
}

/**
 * Validate session and check if user is authenticated
 * @param session Session object
 * @returns Boolean indicating if session is valid
 */
export function isValidSession(session: ExtendedSession | null): boolean {
  if (!session?.user?.id) {
    return false;
  }

  const now = new Date();
  const expires = new Date(session.expires);
  
  return expires > now;
}

/**
 * Check if user has required role
 * @param session Session object
 * @param requiredRole Required role
 * @returns Boolean indicating if user has required role
 */
export function hasRequiredRole(session: ExtendedSession | null, requiredRole: string): boolean {
  if (!isValidSession(session)) {
    return false;
  }

  const userRole = session!.user.role;
  const roleHierarchy: Record<string, number> = {
    'super_admin': 100,
    'organization_admin': 80,
    'internal_field_manager': 60,
    'brand_agent': 40
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Get user organization from session
 * @param session Session object
 * @returns Organization ID or null
 */
export function getUserOrganization(session: ExtendedSession | null): string | null {
  if (!isValidSession(session)) {
    return null;
  }

  return session!.user.organizationId || null;
}

/**
 * Create session object for development/testing
 * @param userId User ID
 * @param role User role
 * @param organizationId Organization ID
 * @returns Mock session object
 */
export function createMockSession(
  userId: string, 
  role: string = 'brand_agent', 
  organizationId?: string
): ExtendedSession {
  return {
    user: {
      id: userId,
      email: `user-${userId}@example.com`,
      name: `User ${userId}`,
      role,
      organizationId
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
  };
}