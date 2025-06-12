import { PagedList } from "@/types/paged-list";
import { GridifyQueryBuilder, ConditionalOperator } from "gridify-client";

// Course API Service
export interface CourseApiRequest {
  courseCode: string;
  courseName: string;
  lectureCredit: number;
  labCredit: number;
}

export interface CourseApiResponse {
  courseCode: string;
  courseName: string;
  lectureCredit: number;
  labCredit: number;
}

export interface GridifyQueryParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  filter?: string;
}

// Course API Response interface from Academic Service
export interface CourseBasicResponse {
  courseCode: string;
  courseName: string;
  lectureCredit: number;
  labCredit: number;
}

const API_BASE_URL = '/api/academic/v1';

// Mock data để test khi API chưa sẵn sàng
const mockCoursesData: CourseApiResponse[] = [
  {
    courseCode: 'BAS1234',
    courseName: 'Cơ sở dữ liệu phân tán',
    lectureCredit: 3,
    labCredit: 1,
  },
  {
    courseCode: 'PRO5678',
    courseName: 'Lập trình Web nâng cao',
    lectureCredit: 3,
    labCredit: 2,
  },
  {
    courseCode: 'MAT0011',
    courseName: 'Toán rời rạc ứng dụng',
    lectureCredit: 3,
    labCredit: 0,
  },
];

class CourseService {
  private baseUrl = "/api/academic/v1";

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  }

  private async checkApiAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/courses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAllCourses(queryParams?: GridifyQueryParams): Promise<PagedList<CourseApiResponse>> {
    try {
      const url = new URL(`${this.baseUrl}/courses`, window.location.origin);
      
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

      return this.handleResponse<PagedList<CourseApiResponse>>(response);
    } catch (error) {
      console.warn('API không khả dụng, sử dụng mock data:', error);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Apply basic filtering and pagination to mock data if params provided
      let filteredData = [...mockCoursesData];
      
      if (queryParams?.filter) {
        const filterTerm = queryParams.filter.toLowerCase();
        filteredData = filteredData.filter(course => 
          course.courseCode.toLowerCase().includes(filterTerm) ||
          course.courseName.toLowerCase().includes(filterTerm)
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

  async getCourseById(courseCode: string): Promise<CourseApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/courses/${encodeURIComponent(courseCode)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.handleResponse<CourseApiResponse>(response);
    } catch (error) {
      console.warn('API không khả dụng, sử dụng mock data:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockCourse = mockCoursesData.find(c => c.courseCode === courseCode);
      if (!mockCourse) {
        throw new Error(`Không tìm thấy môn học với mã ${courseCode}`);
      }
      return mockCourse;
    }
  }

  async createCourse(courseData: CourseApiRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      return this.handleResponse<string>(response);
    } catch (error) {
      console.warn('API không khả dụng, sử dụng mock:', error);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if course already exists in mock data
      const exists = mockCoursesData.some(c => c.courseCode === courseData.courseCode);
      if (exists) {
        throw new Error(`Môn học với mã ${courseData.courseCode} đã tồn tại`);
      }
      
      // Add to mock data
      mockCoursesData.push({
        courseCode: courseData.courseCode,
        courseName: courseData.courseName,
        lectureCredit: courseData.lectureCredit,
        labCredit: courseData.labCredit,
      });
      
      return courseData.courseCode;
    }
  }

  async updateCourse(courseCode: string, courseData: CourseApiRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/courses/${encodeURIComponent(courseCode)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      return this.handleResponse<string>(response);
    } catch (error) {
      console.warn('API không khả dụng, sử dụng mock:', error);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const index = mockCoursesData.findIndex(c => c.courseCode === courseCode);
      if (index === -1) {
        throw new Error(`Không tìm thấy môn học với mã ${courseCode}`);
      }
      
      // Update mock data
      mockCoursesData[index] = {
        courseCode: courseData.courseCode,
        courseName: courseData.courseName,
        lectureCredit: courseData.lectureCredit,
        labCredit: courseData.labCredit,
      };
      
      return courseData.courseCode;
    }
  }

  async deleteCourse(courseCode: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/courses/${encodeURIComponent(courseCode)}`, {
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
      
      const index = mockCoursesData.findIndex(c => c.courseCode === courseCode);
      if (index === -1) {
        throw new Error(`Không tìm thấy môn học với mã ${courseCode}`);
      }
      
      // Remove from mock data
      mockCoursesData.splice(index, 1);
    }
  }

  async searchCourses(queryParams?: GridifyQueryParams): Promise<PagedList<CourseApiResponse>> {
    try {
      const url = new URL(`${this.baseUrl}/courses/search`, window.location.origin);
      
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

      return this.handleResponse<PagedList<CourseApiResponse>>(response);
    } catch (error) {
      console.warn('API không khả dụng, sử dụng mock data cho search:', error);
      // Sử dụng lại logic getAllCourses với filter
      return this.getAllCourses(queryParams);
    }
  }

  // Search courses by course code using Academic API via Next.js proxy
  async searchCoursesByCode(courseCodeQuery: string, pageSize: number = 10): Promise<PagedList<CourseBasicResponse>> {
    try {
      // Build gridify query with contains filter
      const query = new GridifyQueryBuilder()
        .setPage(1)
        .setPageSize(pageSize)
        .addCondition("CourseCode", ConditionalOperator.Contains, courseCodeQuery, false, true)
        .build();

      const queryParams = new URLSearchParams();
      if (query.page) queryParams.append('page', (query.page - 1).toString()); // Convert to 0-based
      if (query.pageSize) queryParams.append('pageSize', query.pageSize.toString());
      if (query.filter) queryParams.append('filter', query.filter);
      if (query.orderBy) queryParams.append('orderBy', query.orderBy);

      const url = `/api/academic/v1/courses/search?${queryParams.toString()}`;
      console.log('Searching courses from Academic API via proxy:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error searching courses:', error);
      // Return mock data for development
      const mockCourses: CourseBasicResponse[] = [
        { courseCode: "CS101", courseName: "Nhập môn Lập trình", lectureCredit: 2, labCredit: 1 },
        { courseCode: "CS102", courseName: "Cấu trúc Dữ liệu", lectureCredit: 2, labCredit: 1 },
        { courseCode: "CS201", courseName: "Lập trình Hướng đối tượng", lectureCredit: 3, labCredit: 1 },
      ].filter(course => courseCodeQuery && typeof courseCodeQuery === 'string' && course.courseCode.toLowerCase().includes(courseCodeQuery.toLowerCase()));
      
      return {
        items: mockCourses,
        indexFrom: 0,
        pageIndex: 1,
        pageSize: 10,
        totalCount: mockCourses.length,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };
    }
  }
}

export const courseService = new CourseService(); 