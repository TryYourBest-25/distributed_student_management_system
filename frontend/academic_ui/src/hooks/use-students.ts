import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  studentService, 
  type StudentDetailResponse, 
  type RegistrationBasicResponse,
  type GridifyQueryParams,
  type UpdateStudentRequest
} from '@/services/student-service';

// Query keys for student-related queries
export const studentKeys = {
  all: ['students'] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (facultyCode: string, studentCode: string) => [...studentKeys.details(), facultyCode, studentCode] as const,
  registrations: () => [...studentKeys.all, 'registrations'] as const,
  studentRegistrations: (facultyCode: string, studentCode: string, params: GridifyQueryParams) => 
    [...studentKeys.registrations(), facultyCode, studentCode, params] as const,
  searches: () => [...studentKeys.all, 'search'] as const,
  searchByCode: (facultyCode: string, query: string, params: GridifyQueryParams) => 
    [...studentKeys.searches(), facultyCode, query, params] as const,
};

// Get student detail
export const useStudent = (facultyCode: string, studentCode: string) => {
  return useQuery({
    queryKey: studentKeys.detail(facultyCode, studentCode),
    queryFn: async () => {
      const response = await studentService.getStudentById(facultyCode, studentCode);
      return response;
    },
    enabled: !!facultyCode && !!studentCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get student registrations
export const useStudentRegistrations = (
  facultyCode: string, 
  studentCode: string, 
  params: GridifyQueryParams = {}
) => {
  return useQuery({
    queryKey: studentKeys.studentRegistrations(facultyCode, studentCode, params),
    queryFn: async () => {
      const response = await studentService.getStudentRegistrations(facultyCode, studentCode, params);
      return response;
    },
    enabled: !!facultyCode && !!studentCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Search students by code - for active students only
export const useSearchStudentsByCode = (
  facultyCode: string,
  studentCodeQuery: string,
  enabled: boolean = true,
  params: GridifyQueryParams = {}
) => {
  return useQuery({
    queryKey: studentKeys.searchByCode(facultyCode, studentCodeQuery, params),
    queryFn: async () => {
      return studentService.searchStudentsByCode(facultyCode, studentCodeQuery, params);
    },
    enabled: enabled && !!facultyCode && studentCodeQuery.length >= 2,
    staleTime: 30 * 1000, // 30 seconds for search results
  });
};

// Update student mutation
export const useUpdateStudent = (facultyCode: string, studentCode: string, options?: {
  onSuccess?: (newStudentCode?: string) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateStudentRequest) => {
      return studentService.updateStudent(facultyCode, studentCode, data);
    },
    onSuccess: (result, variables) => {
      toast.success(`Đã cập nhật thông tin sinh viên ${variables.firstName} ${variables.lastName} thành công!`);
      
      // Invalidate student detail and registrations with old student code
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.detail(facultyCode, studentCode) 
      });
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.studentRegistrations(facultyCode, studentCode, {}) 
      });
      
      // If student code was changed, also invalidate queries with new student code
      if (variables.newStudentCode && variables.newStudentCode !== studentCode) {
        queryClient.invalidateQueries({ 
          queryKey: studentKeys.detail(facultyCode, variables.newStudentCode) 
        });
        queryClient.invalidateQueries({ 
          queryKey: studentKeys.studentRegistrations(facultyCode, variables.newStudentCode, {}) 
        });
      }
      
      // Pass the new student code to onSuccess callback
      options?.onSuccess?.(variables.newStudentCode);
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi cập nhật sinh viên: ' + error.message);
      options?.onError?.(error);
    },
  });
}; 