import { useState, useEffect } from 'react';
import { TenantInfo, tenantService } from '@/services/tenant-service';
import { useAuth } from '@/hooks/use-auth';

export function useTenants() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadTenants();
    } else if (!authLoading && !isAuthenticated) {
      // Nếu không authenticated, sử dụng mock data
      setTenants([
        {
          id: "CNTT",
          identifier: "IT-FACULTY", 
          name: "Công Nghệ Thông Tin"
        }
      ]);
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const tenantsData = await tenantService.getTenants();
      setTenants(tenantsData);
      
      // Tự động chọn tenant đầu tiên nếu chỉ có 1 tenant
      if (tenantsData.length === 1) {
        setSelectedTenant(tenantsData[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const selectTenant = (tenant: TenantInfo | null) => {
    setSelectedTenant(tenant);
  };

  const selectTenantById = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    setSelectedTenant(tenant || null);
  };

  return {
    tenants,
    selectedTenant,
    loading,
    error,
    selectTenant,
    selectTenantById,
    refreshTenants: loadTenants,
  };
} 