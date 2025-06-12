'use client';

import { useTenants } from '@/hooks/use-tenants';
import { TenantInfo } from '@/services/tenant-service';

interface TenantSelectorProps {
  onTenantChange?: (tenant: TenantInfo | null) => void;
  className?: string;
  disabled?: boolean;
}

export function TenantSelector({ onTenantChange, className = '', disabled = false }: TenantSelectorProps) {
  const { tenants, selectedTenant, loading, error, selectTenant } = useTenants();

  const handleTenantChange = (tenantId: string) => {
    if (tenantId === '') {
      selectTenant(null);
      onTenantChange?.(null);
      return;
    }

    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      selectTenant(tenant);
      onTenantChange?.(tenant);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Đang tải danh sách khoa...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        Lỗi: {error}
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className={`text-gray-600 text-sm ${className}`}>
        Không có khoa nào khả dụng
      </div>
    );
  }

  // Nếu chỉ có 1 tenant, hiển thị thông tin mà không cần dropdown
  if (tenants.length === 1) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm font-medium text-gray-700">Khoa:</span>
        <span className="text-sm text-blue-600 font-semibold">
          {tenants[0].name} ({tenants[0].id})
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label htmlFor="tenant-select" className="text-sm font-medium text-gray-700">
        Chọn Khoa:
      </label>
      <select
        id="tenant-select"
        value={selectedTenant?.id || ''}
        onChange={(e) => handleTenantChange(e.target.value)}
        disabled={disabled}
        className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">-- Chọn khoa --</option>
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name} ({tenant.id})
          </option>
        ))}
      </select>
      {selectedTenant && (
        <span className="text-xs text-gray-500">
          ID: {selectedTenant.identifier}
        </span>
      )}
    </div>
  );
} 