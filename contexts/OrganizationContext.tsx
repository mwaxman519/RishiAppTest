"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export interface Organization {
  id: string;
  name: string;
  type: string;
  tier: string;
  settings?: any;
  isActive: boolean;
}

export interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  error: string | null;
  switchOrganization: (organizationId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { data: session } = useSession();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user organizations
  const fetchOrganizations = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/organizations/user');
      
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data = await response.json();
      
      if (data.success) {
        setOrganizations(data.data || []);
        
        // Set current organization to default or first available
        const defaultOrg = data.data?.find((org: any) => org.is_default) || data.data?.[0];
        if (defaultOrg) {
          setCurrentOrganization(defaultOrg);
        }
      } else {
        throw new Error(data.error || 'Failed to load organizations');
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to a different organization
  const switchOrganization = async (organizationId: string) => {
    const organization = organizations.find(org => org.id === organizationId);
    
    if (!organization) {
      setError('Organization not found');
      return;
    }

    try {
      setError(null);
      
      // Update current organization
      setCurrentOrganization(organization);
      
      // Optionally call API to update user's default organization
      await fetch('/api/organizations/set-default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId }),
      });
      
    } catch (err) {
      console.error('Error switching organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to switch organization');
    }
  };

  // Refresh organizations list
  const refreshOrganizations = async () => {
    await fetchOrganizations();
  };

  // Load organizations when session changes
  useEffect(() => {
    if (session?.user) {
      fetchOrganizations();
    } else {
      setCurrentOrganization(null);
      setOrganizations([]);
      setIsLoading(false);
    }
  }, [session]);

  const contextValue: OrganizationContextType = {
    currentOrganization,
    organizations,
    isLoading,
    error,
    switchOrganization,
    refreshOrganizations,
  };

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  );
}

// Hook to use organization context
export function useOrganization() {
  const context = useContext(OrganizationContext);
  
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  
  return context;
}

// Hook to get current organization ID
export function useCurrentOrganizationId(): string | null {
  const { currentOrganization } = useOrganization();
  return currentOrganization?.id || null;
}

// Hook to check if user has access to specific organization
export function useOrganizationAccess(organizationId: string): boolean {
  const { organizations } = useOrganization();
  return organizations.some(org => org.id === organizationId);
}