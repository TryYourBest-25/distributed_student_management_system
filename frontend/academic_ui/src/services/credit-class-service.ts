import { PagedList } from "@/types/paged-list";
import { StudentDetailResponse } from "@/services/student-service";

// Credit Class API Response interface matching backend CreditClassBasicResponse
export interface CreditClassBasicResponse {
  creditClassId: number;
  courseCode: string;
  groupNumber: number;
  currentStudent: number;
  minStudent: number;
  academicYear: string;
  semester: number;
  isCancelled: boolean;
}

// Credit Class Detail Response interface matching backend CreditClassDetailResponse
export interface CreditClassDetailResponse {
  creditClassId: number;
  courseCode: string;
  groupNumber: number;
  currentStudent: number;
  minStudent: number;
  academicYear: string;
  semester: number;
  lecturerName: string;
  lecturerCode: string;
  courseName: string;
  lectureCredit: number;
  labCredit: number;
  isCancelled: boolean;
}

// Extended interface for display purposes (can include additional computed fields)
export interface CreditClassDisplayInfo extends CreditClassBasicResponse {
  displayCode?: string; // e.g., "CS101.1" (courseCode + groupNumber)
  capacityStatus?: 'full' | 'available' | 'low';
}

export interface GridifyQueryParams {
  page?: number;
  pageSize?: number;
  filter?: string;
  orderBy?: string;
}

// Create Credit Class Request interface matching backend CreditClassBasicRequest
export interface CreateCreditClassRequest {
  lecturerCode: string;
  courseCode: string;
  groupNumber: number;
  semester: number;
  minStudent: number;
  academicYearCode: string;
}

// Update Credit Class Request interface matching backend UpdateCreditClassRequest
export interface UpdateCreditClassRequest {
  lecturerCode: string;
  courseCode: string;
  groupNumber: number;
  semester: number;
  minStudent: number;
  academicYearCode: string;
  isCancelled: boolean;
}

class CreditClassService {
  private getBaseUrl(servicePath: string): string {
    return `/api/faculty/${servicePath}/v1`;
  }

  // Get all credit classes for a specific faculty
  async getAllCreditClasses(facultyCode: string, servicePath: string, params: GridifyQueryParams = {}): Promise<PagedList<CreditClassBasicResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.filter) queryParams.append('filter', params.filter);
      if (params.orderBy) queryParams.append('orderBy', params.orderBy);

      const url = `${this.getBaseUrl(servicePath)}/${facultyCode.toLowerCase()}/creditclasses?${queryParams.toString()}`;
      console.log('Fetching credit classes from:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching credit classes:', error);
      throw error;
    }
  }

  // Transform basic response to display info
  transformToDisplayInfo(creditClass: CreditClassBasicResponse): CreditClassDisplayInfo {
    const displayCode = `${creditClass.courseCode}.${creditClass.groupNumber}`;
    
    let capacityStatus: 'full' | 'available' | 'low' = 'available';
    if (creditClass.currentStudent >= creditClass.minStudent * 0.9) {
      capacityStatus = 'full';
    } else if (creditClass.currentStudent < creditClass.minStudent * 0.5) {
      capacityStatus = 'low';
    }

    return {
      ...creditClass,
      displayCode,
      capacityStatus,
    };
  }

  // Get credit classes with display information
  async getCreditClassesWithDisplayInfo(facultyCode: string, servicePath: string, params: GridifyQueryParams = {}): Promise<PagedList<CreditClassDisplayInfo>> {
    const response = await this.getAllCreditClasses(facultyCode, servicePath, params);
    
    return {
      ...response,
      items: response.items.map(item => this.transformToDisplayInfo(item)),
    };
  }

  // Get credit class detail by ID
  async getCreditClassById(facultyCode: string, servicePath: string, creditClassId: number): Promise<CreditClassDetailResponse> {
    try {
      const url = `${this.getBaseUrl(servicePath)}/${facultyCode.toLowerCase()}/creditclasses/${creditClassId}`;
      console.log('Fetching credit class detail from:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Không tìm thấy lớp tín chỉ với ID: ${creditClassId}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response không phải JSON format');
      }
      
      const text = await response.text();
      if (!text.trim()) {
        throw new Error('Response rỗng từ server');
      }
      
      try {
        const data = JSON.parse(text);
        if (!data) {
          throw new Error(`Không tìm thấy lớp tín chỉ với ID: ${creditClassId}`);
        }
        return data;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', text);
        throw new Error('Không thể parse JSON response');
      }
    } catch (error) {
      console.error('Error fetching credit class detail:', error);
      throw error;
    }
  }

  // Get students in credit class
  async getStudentsInCreditClass(
    facultyCode: string, 
    servicePath: string, 
    creditClassId: number, 
    params: GridifyQueryParams = {}
  ): Promise<PagedList<StudentDetailResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.filter) queryParams.append('filter', params.filter);
      if (params.orderBy) queryParams.append('orderBy', params.orderBy);

      const url = `${this.getBaseUrl(servicePath)}/${facultyCode.toLowerCase()}/creditclasses/${creditClassId}/students?${queryParams.toString()}`;
      console.log('Fetching students in credit class from:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Không tìm thấy lớp tín chỉ với ID: ${creditClassId}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response không phải JSON format');
      }
      
      const text = await response.text();
      if (!text.trim()) {
        throw new Error('Response rỗng từ server');
      }
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', text);
        throw new Error('Không thể parse JSON response');
      }
    } catch (error) {
      console.error('Error fetching students in credit class:', error);
      throw error;
    }
  }

  // Create new credit class
  async createCreditClass(facultyCode: string, servicePath: string, data: CreateCreditClassRequest): Promise<string> {
    try {
      const url = `${this.getBaseUrl(servicePath)}/${facultyCode.toLowerCase()}/creditclasses`;
      console.log('Creating credit class at:', url, data);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.text();
    } catch (error) {
      console.error('Error creating credit class:', error);
      throw error;
    }
  }

  // Update existing credit class
  async updateCreditClass(facultyCode: string, servicePath: string, creditClassId: number, data: UpdateCreditClassRequest): Promise<string> {
    try {
      const url = `${this.getBaseUrl(servicePath)}/${facultyCode.toLowerCase()}/creditclasses/${creditClassId}`;
      console.log('Updating credit class at:', url, data);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.text();
    } catch (error) {
      console.error('Error updating credit class:', error);
      throw error;
    }
  }

  // Add student to credit class
  async addStudentToCreditClass(facultyCode: string, servicePath: string, creditClassId: number, studentCode: string): Promise<string> {
    try {
      const url = `${this.getBaseUrl(servicePath)}/${facultyCode.toLowerCase()}/creditclasses/${creditClassId}/students/${studentCode}?isCancelled=false`;
      console.log('Adding student to credit class at:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.text();
    } catch (error) {
      console.error('Error adding student to credit class:', error);
      throw error;
    }
  }

  // Delete credit classes (bulk delete)
  async deleteCreditClasses(facultyCode: string, servicePath: string, creditClassIds: number[]): Promise<void> {
    try {
      const url = `${this.getBaseUrl(servicePath)}/${facultyCode.toLowerCase()}/creditclasses/bulk`;
      console.log('Deleting credit classes:', url, creditClassIds);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creditClassIds),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Credit classes deleted successfully');
    } catch (error) {
      console.error('Error deleting credit classes:', error);
      throw error;
    }
  }
}

export const creditClassService = new CreditClassService(); 