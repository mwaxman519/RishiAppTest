
"use client"

import React, { createContext, useContext, useState } from 'react';

type OrganizationContextType = {
  organization: string | null;
  setOrganization: (org: string | null) => void;
};

const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  setOrganization: () => {},
});

export const OrganizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [organization, setOrganization] = useState<string | null>(null);

  return (
    <OrganizationContext.Provider value={{ organization, setOrganization }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => useContext(OrganizationContext);
