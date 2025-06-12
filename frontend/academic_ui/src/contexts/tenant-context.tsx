'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TenantInfo } from '@/services/tenant-service';

interface TenantContextType {
  selectedTenant: TenantInfo | null;
  setSelectedTenant: (tenant: TenantInfo | null) => void;
  getFacultyCode: () => string;
  getFacultyServicePath: () => string;
  isTenantSupported: (tenant: TenantInfo) => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [selectedTenant, setSelectedTenant] = useState<TenantInfo | null>(null);

  // Lưu tenant được chọn vào localStorage
  useEffect(() => {
    if (selectedTenant) {
      localStorage.setItem('selectedTenant', JSON.stringify(selectedTenant));
    }
  }, [selectedTenant]);

  // Khôi phục tenant từ localStorage khi load
  useEffect(() => {
    const savedTenant = localStorage.getItem('selectedTenant');
    if (savedTenant) {
      try {
        setSelectedTenant(JSON.parse(savedTenant));
      } catch (error) {
        console.error('Lỗi khi khôi phục tenant từ localStorage:', error);
      }
    }
  }, []);

  const getFacultyCode = (): string => {
    if (!selectedTenant) {
      // Default fallback
      return 'it-faculty';
    }
    
    // Map tenant identifier to actual faculty service endpoint
    const facultyMapping: Record<string, string> = {
      'IT-FACULTY': 'it-faculty',
      'VT-FACULTY': 'tel-faculty', // Map VT-FACULTY đến TEL-FACULTY cho faculty-service-tel
    };
    
    return facultyMapping[selectedTenant.identifier] || selectedTenant.identifier.toLowerCase();
  };

  const getFacultyServicePath = (): string => {
    if (!selectedTenant) {
      return 'it';
    }
    
    // Map tenant identifier to API Gateway path
    const servicePathMapping: Record<string, string> = {
      'IT-FACULTY': 'it',
      'VT-FACULTY': 'tel',
    };
    
    return servicePathMapping[selectedTenant.identifier] || 'it';
  };

  const isTenantSupported = (tenant: TenantInfo): boolean => {
    // Hỗ trợ cả IT-FACULTY và VT-FACULTY
    const supportedTenants = ['IT-FACULTY', 'VT-FACULTY'];
    return supportedTenants.includes(tenant.identifier);
  };

  return (
    <TenantContext.Provider value={{
      selectedTenant,
      setSelectedTenant,
      getFacultyCode,
      getFacultyServicePath,
      isTenantSupported,
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
} 