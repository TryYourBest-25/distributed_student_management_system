import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseService, CourseApiRequest, CourseApiResponse, type CourseBasicResponse } from '@/services/course-service';
import { Course, apiResponseToCourse } from '@/types/course';
import { toast } from 'sonner';

// Query keys for course-related queries
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: string) => [...courseKeys.lists(), { filters }] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  search: () => [...courseKeys.all, 'search'] as const,
  searchByCode: (query: string) => [...courseKeys.search(), query] as const,
};

// Hook để lấy danh sách môn học
export function useCourses() {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: async () => {
      const apiResponse = await courseService.getAllCourses();
      return apiResponse.items.map(apiResponseToCourse);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook để lấy thông tin chi tiết môn học
export function useCourse(courseCode: string) {
  return useQuery({
    queryKey: courseKeys.detail(courseCode),
    queryFn: async () => {
      const apiResponse = await courseService.getCourseById(courseCode);
      return apiResponseToCourse(apiResponse);
    },
    enabled: !!courseCode,
  });
}

// Hook để tạo môn học mới
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CourseApiRequest) => courseService.createCourse(data),
    onSuccess: (newCourseCode: string, variables: CourseApiRequest) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success(`Đã tạo môn học ${variables.courseCode} thành công!`);
    },
    onError: (error: Error) => {
      console.error('Create course error:', error);
      toast.error(`Lỗi khi tạo môn học: ${error.message}`);
    },
  });
}

// Hook để cập nhật môn học
export function useUpdateCourse(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      courseCode, 
      data 
    }: { 
      courseCode: string; 
      data: CourseApiRequest 
    }) => courseService.updateCourse(courseCode, data),
    onSuccess: (updatedCourseCode: string, { courseCode, data }: { courseCode: string; data: CourseApiRequest }) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseCode) });
      
      if (courseCode !== data.courseCode) {
        queryClient.invalidateQueries({ queryKey: courseKeys.detail(data.courseCode) });
      }
      
      toast.success(`Đã cập nhật môn học ${data.courseCode} thành công!`);
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error: Error) => {
      console.error('Update course error:', error);
      toast.error(`Lỗi khi cập nhật môn học: ${error.message}`);
    },
  });
}

// Hook để xóa môn học
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseCode: string) => courseService.deleteCourse(courseCode),
    onSuccess: (_: void, courseCode: string) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.removeQueries({ queryKey: courseKeys.detail(courseCode) });
      
      toast.success(`Đã xóa môn học ${courseCode} thành công!`);
    },
    onError: (error: Error) => {
      console.error('Delete course error:', error);
      toast.error(`Lỗi khi xóa môn học: ${error.message}`);
    },
  });
}

// Search courses by course code
export const useSearchCoursesByCode = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: courseKeys.searchByCode(query),
    queryFn: async () => {
      if (!query || query.length < 2) {
        return { items: [], indexFrom: 0, pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
      }
      return courseService.searchCoursesByCode(query);
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}; 