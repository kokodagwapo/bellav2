import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api/client';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  settings?: any;
}

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  setTenant: (tenant: Tenant | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTenant();
  }, []);

  const loadTenant = async () => {
    try {
      // Check if API URL is localhost (development) or if we're in production without a valid API URL
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const isLocalhost = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      // Skip API calls if we're in production and API URL is localhost (not configured)
      if (isProduction && (isLocalhost || !apiUrl)) {
        console.warn('API URL not configured for production. Skipping tenant fetch.');
        setIsLoading(false);
        return;
      }

      // Try to detect tenant from subdomain
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      // If subdomain exists and isn't 'www' or 'localhost', fetch tenant
      if (subdomain && subdomain !== 'www' && subdomain !== 'localhost' && !isLocalhost) {
        const tenantData = await apiClient.get<Tenant>(`/tenants/by-slug/${subdomain}`);
        setTenant(tenantData);
        localStorage.setItem('tenant_id', tenantData.id);
      } else {
        // Try to load from localStorage
        const tenantId = localStorage.getItem('tenant_id');
        if (tenantId && !isLocalhost) {
          const tenantData = await apiClient.get<Tenant>(`/tenants/${tenantId}`);
          setTenant(tenantData);
        }
      }
    } catch (error) {
      // Silently fail - don't block the app if tenant loading fails
      console.debug('Failed to load tenant (non-blocking):', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    tenant,
    isLoading,
    setTenant,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

