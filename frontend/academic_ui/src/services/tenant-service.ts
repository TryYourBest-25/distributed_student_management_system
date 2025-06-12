export interface TenantInfo {
  id: string;
  identifier: string;
  name: string;
  location?: {
    public?: string;
    private?: string;
  };
}

class TenantService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  }

  async getTenants(): Promise<TenantInfo[]> {
    try {
      // Gọi API route của Academic UI thay vì trực tiếp đến API Gateway
      const response = await fetch('/api/tenants', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      return this.handleResponse<TenantInfo[]>(response);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tenants:', error);
      
      // Mock data để test khi API không khả dụng hoặc không có quyền
      return [
        {
          id: "CNTT",
          identifier: "IT-FACULTY", 
          name: "Công Nghệ Thông Tin"
        },
        {
          id: "DTVT",
          identifier: "VT-FACULTY",
          name: "Điện Tử Viễn thông"
        }
      ];
    }
  }

  async getTenantById(tenantId: string): Promise<TenantInfo | null> {
    const tenants = await this.getTenants();
    return tenants.find(t => t.id === tenantId) || null;
  }

  async getTenantByIdentifier(identifier: string): Promise<TenantInfo | null> {
    const tenants = await this.getTenants();
    return tenants.find(t => t.identifier === identifier) || null;
  }
}

export const tenantService = new TenantService();
export default tenantService; 