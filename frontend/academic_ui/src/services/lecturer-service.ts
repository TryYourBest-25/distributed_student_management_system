import { PagedList } from "@/types/paged-list";
import { GridifyQueryBuilder, ConditionalOperator } from "gridify-client";

// Lecturer API Response interface matching backend LecturerResponse
export interface LecturerBasicResponse {
  lecturerCode: string;
  firstName: string;
  lastName: string;
  degree?: string;
  academicRank?: string;
  specialization?: string;
  facultyCode: string;
}

// Lecturer API Service interfaces  
export interface LecturerApiRequest {
  lecturerCode: string;
  firstName: string;
  lastName: string;
  degree?: string;
  academicRank?: string;
  specialization?: string;
  facultyCode: string;
}

export interface LecturerApiResponse {
  lecturerCode: string;
  firstName: string;
  lastName: string;
  degree?: string;
  academicRank?: string;
  specialization?: string;
  facultyCode: string;
}

export interface GridifyQueryParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  filter?: string;
}

const API_BASE_URL = '/api/academic';

// Mock data để test khi API chưa sẵn sàng
const mockLecturersData: LecturerApiResponse[] = [
  {
    lecturerCode: 'GV001',
    firstName: 'Nguyễn',
    lastName: 'Văn An',
    degree: 'Tiến sĩ',
    academicRank: 'Phó giáo sư',
    specialization: 'Khoa học máy tính',
    facultyCode: 'CNTT',
  },
  {
    lecturerCode: 'GV002',
    firstName: 'Trần',
    lastName: 'Thị Bình',
    degree: 'Thạc sĩ',
    academicRank: 'Giảng viên',
    specialization: 'Điện tử viễn thông',
    facultyCode: 'DTVT',
  },
  {
    lecturerCode: 'GV003',
    firstName: 'Lê',
    lastName: 'Văn Cường',
    degree: 'Tiến sĩ',
    academicRank: 'Giảng viên chính',
    specialization: 'Cơ khí ứng dụng',
    facultyCode: 'CK',
  },
];

class LecturerService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  }

  async getAllLecturers(queryParams?: GridifyQueryParams): Promise<PagedList<LecturerApiResponse>> {
    try {
      const url = new URL(`${API_BASE_URL}/lecturers`, window.location.origin);
      
      // Luôn gửi page và pageSize (bắt buộc cho backend)
      const page = queryParams?.page ?? 0;
      const pageSize = queryParams?.pageSize ?? 10;
      
      url.searchParams.append('page', page.toString());
      url.searchParams.append('pageSize', pageSize.toString());
      
      // Các tham số tùy chọn
      if (queryParams?.orderBy) {
        url.searchParams.append('orderBy', queryParams.orderBy);
      }
      if (queryParams?.filter) {
        url.searchParams.append('filter', queryParams.filter);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.handleResponse<PagedList<LecturerApiResponse>>(response);
    } catch (error) {
      console.warn('API không khả dụng, sử dụng mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Apply filtering and pagination to mock data
      let filteredData = [...mockLecturersData];
      
      if (queryParams?.filter) {
        const filterTerm = queryParams.filter.toLowerCase();
        filteredData = filteredData.filter(lecturer => 
          lecturer.lecturerCode.toLowerCase().includes(filterTerm) ||
          lecturer.firstName.toLowerCase().includes(filterTerm) ||
          lecturer.lastName.toLowerCase().includes(filterTerm) ||
          lecturer.specialization?.toLowerCase().includes(filterTerm)
        );
      }

      // Apply sorting
      if (queryParams?.orderBy) {
        const [field, direction] = queryParams.orderBy.split(' ');
        const isDesc = direction?.toLowerCase() === 'desc';
        
        filteredData.sort((a, b) => {
          const aVal = (a as any)[field];
          const bVal = (b as any)[field];
          const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return isDesc ? -comparison : comparison;
        });
      }

      // Apply pagination
      const page = queryParams?.page ?? 0;
      const pageSize = queryParams?.pageSize ?? 10;
      const startIndex = page * pageSize;
      const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

      return {
        items: paginatedData,
        pageIndex: page,
        pageSize: pageSize,
        totalCount: filteredData.length,
        totalPages: Math.ceil(filteredData.length / pageSize),
        hasPreviousPage: page > 0,
        hasNextPage: page < Math.ceil(filteredData.length / pageSize) - 1,
        indexFrom: 1,
      };
    }
  }

  async getLecturerById(lecturerCode: string): Promise<LecturerApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/lecturers/${encodeURIComponent(lecturerCode)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.handleResponse<LecturerApiResponse>(response);
    } catch (error) {
      console.warn('API không khả dụng, sử dụng mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockLecturer = mockLecturersData.find(l => l.lecturerCode === lecturerCode);
      if (!mockLecturer) {
        throw new Error(`Không tìm thấy giảng viên với mã ${lecturerCode}`);
      }
      return mockLecturer;
    }
  }

  async createLecturer(lecturerData: LecturerApiRequest): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/lecturers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lecturerData),
      });

      return this.handleResponse<string>(response);
    } catch (error) {
      console.warn('API không khả dụng, sử dụng mock:', error);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if lecturer already exists in mock data
      const exists = mockLecturersData.some(l => l.lecturerCode === lecturerData.lecturerCode);
      if (exists) {
        throw new Error(`Giảng viên với mã ${lecturerData.lecturerCode} đã tồn tại`);
      }
      
      // Add to mock data
      mockLecturersData.push({
        lecturerCode: lecturerData.lecturerCode,
        firstName: lecturerData.firstName,
        lastName: lecturerData.lastName,
        degree: lecturerData.degree,
        academicRank: lecturerData.academicRank,
        specialization: lecturerData.specialization,
        facultyCode: lecturerData.facultyCode,
      });
      
      return lecturerData.lecturerCode;
    }
  }

  async updateLecturer(lecturerCode: string, lecturerData: LecturerApiRequest): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/lecturers/${encodeURIComponent(lecturerCode)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lecturerData),
      });

      return this.handleResponse<string>(response);
    } catch (error) {
      console.warn('API không khả dụng, sử dụng mock:', error);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const index = mockLecturersData.findIndex(l => l.lecturerCode === lecturerCode);
      if (index === -1) {
        throw new Error(`Không tìm thấy giảng viên với mã ${lecturerCode}`);
      }
      
      // Update mock data
      mockLecturersData[index] = {
        lecturerCode: lecturerData.lecturerCode,
        firstName: lecturerData.firstName,
        lastName: lecturerData.lastName,
        degree: lecturerData.degree,
        academicRank: lecturerData.academicRank,
        specialization: lecturerData.specialization,
        facultyCode: lecturerData.facultyCode,
      };
      
      return lecturerData.lecturerCode;
    }
  }

  async deleteLecturer(lecturerCode: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/lecturers/${encodeURIComponent(lecturerCode)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.warn('API không khả dụng, sử dụng mock:', error);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = mockLecturersData.findIndex(l => l.lecturerCode === lecturerCode);
      if (index === -1) {
        throw new Error(`Không tìm thấy giảng viên với mã ${lecturerCode}`);
      }
      
      // Remove from mock data
      mockLecturersData.splice(index, 1);
    }
  }

  async searchLecturersByCode(lecturerCodeQuery: string, pageSize: number = 10): Promise<PagedList<LecturerBasicResponse>> {
    try {
      // Build gridify query with contains filter  
      const query = new GridifyQueryBuilder()
        .setPage(1)
        .setPageSize(pageSize)
        .addCondition("LecturerCode", ConditionalOperator.Contains, lecturerCodeQuery, false, true)
        .build();

      const queryParams = new URLSearchParams();
      if (query.page) queryParams.append('page', (query.page - 1).toString()); // Convert to 0-based
      if (query.pageSize) queryParams.append('pageSize', query.pageSize.toString());
      if (query.filter) queryParams.append('filter', query.filter);
      if (query.orderBy) queryParams.append('orderBy', query.orderBy);

      const url = `/api/academic/lecturers/search?${queryParams.toString()}`;
      console.log('Searching lecturers from Academic API via proxy:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error searching lecturers:', error);
      // Return mock data for development
      const mockLecturers: LecturerBasicResponse[] = mockLecturersData.filter(lecturer => 
        lecturer.lecturerCode.toLowerCase().includes(lecturerCodeQuery.toLowerCase())
      );
      
      return {
        items: mockLecturers.slice(0, pageSize),
        indexFrom: 0,
        pageIndex: 1,
        pageSize: pageSize,
        totalCount: mockLecturers.length,
        totalPages: Math.ceil(mockLecturers.length / pageSize),
        hasPreviousPage: false,
        hasNextPage: mockLecturers.length > pageSize,
      };
    }
  }

  async searchLecturers(queryParams?: GridifyQueryParams): Promise<PagedList<LecturerApiResponse>> {
    try {
      const url = new URL(`${API_BASE_URL}/lecturers/search`, window.location.origin);
      
      // Luôn gửi page và pageSize (bắt buộc cho backend)
      const page = queryParams?.page ?? 0;
      const pageSize = queryParams?.pageSize ?? 10;
      
      url.searchParams.append('page', page.toString());
      url.searchParams.append('pageSize', pageSize.toString());
      
      // Các tham số tùy chọn
      if (queryParams?.orderBy) {
        url.searchParams.append('orderBy', queryParams.orderBy);
      }
      if (queryParams?.filter) {
        url.searchParams.append('filter', queryParams.filter);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.handleResponse<PagedList<LecturerApiResponse>>(response);
    } catch (error) {
      console.warn('API không khả dụng, sử dụng mock data cho search:', error);
      // Sử dụng lại logic getAllLecturers với filter
      return this.getAllLecturers(queryParams);
    }
  }
}

export const lecturerService = new LecturerService(); 