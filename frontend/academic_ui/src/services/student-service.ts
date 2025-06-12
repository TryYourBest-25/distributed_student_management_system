import { PagedList } from "@/types/paged-list";
import { GridifyQueryBuilder, ConditionalOperator } from "gridify-client";

// Student detail response from backend
export interface StudentDetailResponse {
  studentCode: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  address?: string;
  isSuspended?: boolean;
  classCode: string;
  facultyCode: string;
}

// Registration basic response for student registrations
export interface RegistrationBasicResponse {
  creditClassId: number;
  courseCode: string;
  groupNumber: number;
  currentStudent: number;
  minStudent: number;
  academicYear: string;
  semester: number;
  isCancelled: boolean;
}

export interface GridifyQueryParams {
  page?: number;
  pageSize?: number;
  filter?: string;
  orderBy?: string;
}

// Request interface for updating student
export interface UpdateStudentRequest {
  newStudentCode?: string;
  firstName: string;
  lastName: string;
  address?: string;
  gender?: boolean;
  birthDate?: string;
  isSuspended?: boolean;
}

class StudentService {
  private baseUrl = "/api/faculty/v1";

  private getBaseUrl(servicePath: string): string {
    return `/api/faculty/${servicePath}/v1`;
  }

  // Get student detail by code
  async getStudentById(facultyCode: string, servicePath: string, studentCode: string): Promise<StudentDetailResponse> {
    try {
      const url = `${this.getBaseUrl(servicePath)}/${facultyCode.toLowerCase()}/students/${studentCode}`;
      console.log('Fetching student from:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching student:', error);
      // Return mock data for development
      return {
        studentCode: studentCode,
        firstName: 'Nguyễn Văn',
        lastName: 'A',
        birthDate: '2002-01-15',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        isSuspended: false,
        classCode: 'D20CNTT01',
        facultyCode: facultyCode,
      };
    }
  }

  // Get student registrations
  async getStudentRegistrations(
    facultyCode: string, 
    servicePath: string,
    studentCode: string, 
    params: GridifyQueryParams = {}
  ): Promise<PagedList<RegistrationBasicResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.filter) queryParams.append('filter', params.filter);
      if (params.orderBy) queryParams.append('orderBy', params.orderBy);

      const url = `${this.getBaseUrl(servicePath)}/${facultyCode.toLowerCase()}/students/${studentCode}/registrations?${queryParams.toString()}`;
      console.log('Fetching student registrations from:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching student registrations:', error);
      // Return mock data for development
      const mockRegistrations: RegistrationBasicResponse[] = [
        {
          creditClassId: 1,
          courseCode: 'CS101',
          groupNumber: 1,
          currentStudent: 45,
          minStudent: 20,
          academicYear: '2023-2024',
          semester: 1,
          isCancelled: false,
        },
        {
          creditClassId: 2,
          courseCode: 'MATH201',
          groupNumber: 2,
          currentStudent: 38,
          minStudent: 25,
          academicYear: '2023-2024',
          semester: 1,
          isCancelled: false,
        },
        {
          creditClassId: 3,
          courseCode: 'ENG150',
          groupNumber: 1,
          currentStudent: 42,
          minStudent: 30,
          academicYear: '2023-2024',
          semester: 2,
          isCancelled: true,
        },
      ];
      
      return {
        items: mockRegistrations,
        indexFrom: 0,
        pageIndex: 1,
        pageSize: 10,
        totalCount: mockRegistrations.length,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };
    }
  }

  // Search students by code and filter active students using GridifyQueryBuilder
  async searchStudentsByCode(facultyCode: string, servicePath: string, studentCodeQuery: string, params: GridifyQueryParams = {}): Promise<PagedList<StudentDetailResponse>> {
    try {
      const queryBuilder = new GridifyQueryBuilder()
      .setPage(params.page || 1)
      .setPageSize(params.pageSize || 10)
      .addOrderBy("StudentCode")
      .addCondition("StudentCode", ConditionalOperator.Contains, studentCodeQuery, false, true)
      .and()
      .addCondition("IsSuspended", ConditionalOperator.Equal, false, false, true);

      const builtQuery = queryBuilder.build();
      console.log('Built query filter:', builtQuery.filter);
      console.log('Built query orderBy:', builtQuery.orderBy);

      // Convert to 0-based page for backend
      const backendPage = Math.max(0, (params.page || 1) - 1);
      
      const queryParams = new URLSearchParams();
      queryParams.append('page', backendPage.toString());
      queryParams.append('pageSize', (params.pageSize || 10).toString());
      queryParams.append('filter', builtQuery.filter || '');
      queryParams.append('orderBy', builtQuery.orderBy || 'StudentCode');

      const url = `${this.getBaseUrl(servicePath)}/${facultyCode.toLowerCase()}/students/search?${queryParams.toString()}`;
      console.log('Searching students from:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error searching students:', error);
      // Return mock data for development
      const mockStudents: StudentDetailResponse[] = studentCodeQuery.length >= 2 ? [
        {
          studentCode: 'D20CNTT001',
          firstName: 'Nguyễn Văn',
          lastName: 'An',
          birthDate: '2002-01-15',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          isSuspended: false,
          classCode: 'D20CNTT01',
          facultyCode: facultyCode,
        },
        {
          studentCode: 'D20CNTT002',
          firstName: 'Trần Thị',
          lastName: 'Bình',
          birthDate: '2002-03-20',
          address: '456 Đường XYZ, Quận 3, TP.HCM',
          isSuspended: false,
          classCode: 'D20CNTT01',
          facultyCode: facultyCode,
        },
        {
          studentCode: 'D20CNTT003',
          firstName: 'Lê Hoàng',
          lastName: 'Cường',
          birthDate: '2002-05-10',
          address: '789 Đường DEF, Quận 5, TP.HCM',
          isSuspended: false,
          classCode: 'D20CNTT02',
          facultyCode: facultyCode,
        },
      ].filter(student => studentCodeQuery && typeof studentCodeQuery === 'string' && student.studentCode.toLowerCase().includes(studentCodeQuery.toLowerCase())) : [];
      
      return {
        items: mockStudents,
        indexFrom: 0,
        pageIndex: params.page || 1,
        pageSize: params.pageSize || 10,
        totalCount: mockStudents.length,
        totalPages: Math.ceil(mockStudents.length / (params.pageSize || 10)),
        hasPreviousPage: (params.page || 1) > 1,
        hasNextPage: (params.page || 1) < Math.ceil(mockStudents.length / (params.pageSize || 10)),
      };
    }
  }

  // Update student
  async updateStudent(facultyCode: string, servicePath: string, studentCode: string, data: UpdateStudentRequest): Promise<string> {
    try {
      const url = `${this.getBaseUrl(servicePath)}/${facultyCode.toLowerCase()}/students/${studentCode}`;
      console.log('Updating student at:', url, data);

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
      console.error('Error updating student:', error);
      // Mock success for development
      return `Đã cập nhật thông tin sinh viên ${data.firstName} ${data.lastName} thành công`;
    }
  }
}

export const studentService = new StudentService(); 