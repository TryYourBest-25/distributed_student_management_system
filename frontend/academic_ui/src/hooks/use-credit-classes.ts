import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  creditClassService, 
  type CreditClassBasicResponse,
  type CreditClassDetailResponse,
  type CreditClassDisplayInfo,
  type GridifyQueryParams,
  type CreateCreditClassRequest,
  type UpdateCreditClassRequest
} from '@/services/credit-class-service';

// Query keys for credit class related queries
export const creditClassKeys = {
  all: ['creditClasses'] as const,
  lists: () => [...creditClassKeys.all, 'list'] as const,
  list: (facultyCode: string, params: GridifyQueryParams) => [...creditClassKeys.lists(), facultyCode, params] as const,
  listWithDisplay: (facultyCode: string, params: GridifyQueryParams) => [...creditClassKeys.lists(), 'display', facultyCode, params] as const,
  details: () => [...creditClassKeys.all, 'detail'] as const,
  detail: (facultyCode: string, creditClassId: number) => [...creditClassKeys.details(), facultyCode, creditClassId] as const,
  students: () => [...creditClassKeys.all, 'students'] as const,
  studentsInClass: (facultyCode: string, creditClassId: number, params: GridifyQueryParams) => [...creditClassKeys.students(), facultyCode, creditClassId, params] as const,
};

// Get credit classes for a faculty
export const useCreditClasses = (facultyCode: string, params: GridifyQueryParams = {}) => {
  return useQuery({
    queryKey: creditClassKeys.list(facultyCode, params),
    queryFn: async () => {
      const response = await creditClassService.getAllCreditClasses(facultyCode, params);
      return response;
    },
    enabled: !!facultyCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get credit classes with display information
export const useCreditClassesWithDisplayInfo = (facultyCode: string, params: GridifyQueryParams = {}) => {
  return useQuery({
    queryKey: creditClassKeys.listWithDisplay(facultyCode, params),
    queryFn: async () => {
      const response = await creditClassService.getCreditClassesWithDisplayInfo(facultyCode, params);
      return response;
    },
    enabled: !!facultyCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get credit class detail by ID
export const useCreditClass = (facultyCode: string, creditClassId: number) => {
  return useQuery({
    queryKey: creditClassKeys.detail(facultyCode, creditClassId),
    queryFn: async () => {
      return creditClassService.getCreditClassById(facultyCode, creditClassId);
    },
    enabled: !!facultyCode && !!creditClassId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get students in credit class
export const useStudentsInCreditClass = (
  facultyCode: string, 
  creditClassId: number, 
  params: GridifyQueryParams = {}
) => {
  return useQuery({
    queryKey: creditClassKeys.studentsInClass(facultyCode, creditClassId, params),
    queryFn: async () => {
      return creditClassService.getStudentsInCreditClass(facultyCode, creditClassId, params);
    },
    enabled: !!facultyCode && !!creditClassId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create credit class mutation
export const useCreateCreditClass = (facultyCode: string, options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCreditClassRequest) => {
      return creditClassService.createCreditClass(facultyCode, data);
    },
    onSuccess: (result, variables) => {
      toast.success(`Đã tạo lớp tín chỉ ${variables.courseCode}.${variables.groupNumber} thành công!`);
      // Invalidate credit classes list
      queryClient.invalidateQueries({ 
        queryKey: creditClassKeys.lists() 
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi tạo lớp tín chỉ: ' + error.message);
      options?.onError?.(error);
    },
  });
};

// Update credit class mutation
export const useUpdateCreditClass = (facultyCode: string, creditClassId: number, options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateCreditClassRequest) => {
      return creditClassService.updateCreditClass(facultyCode, creditClassId, data);
    },
    onSuccess: (result, variables) => {
      toast.success(`Đã cập nhật lớp tín chỉ ${variables.courseCode}.${variables.groupNumber} thành công!`);
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: creditClassKeys.lists() 
      });
      queryClient.invalidateQueries({ 
        queryKey: creditClassKeys.detail(facultyCode, creditClassId) 
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi cập nhật lớp tín chỉ: ' + error.message);
      options?.onError?.(error);
    },
  });
};

// Add student to credit class mutation
export const useAddStudentToCreditClass = (facultyCode: string, creditClassId: number, options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (studentCode: string) => {
      return creditClassService.addStudentToCreditClass(facultyCode, creditClassId, studentCode);
    },
    onSuccess: (result, studentCode) => {
      toast.success(`Đã thêm sinh viên ${studentCode} vào lớp tín chỉ thành công!`);
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: creditClassKeys.studentsInClass(facultyCode, creditClassId, {}) 
      });
      queryClient.invalidateQueries({ 
        queryKey: creditClassKeys.detail(facultyCode, creditClassId) 
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi thêm sinh viên vào lớp tín chỉ: ' + error.message);
      options?.onError?.(error);
    },
  });
};

// Delete credit classes mutation
export const useDeleteCreditClasses = (facultyCode: string, options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (creditClassIds: number[]) => {
      return creditClassService.deleteCreditClasses(facultyCode, creditClassIds);
    },
    onSuccess: (result, creditClassIds) => {
      const count = creditClassIds.length;
      toast.success(`Đã xóa ${count} lớp tín chỉ thành công!`);
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: creditClassKeys.lists() 
      });
      // Invalidate detail queries for deleted classes
      creditClassIds.forEach(id => {
        queryClient.invalidateQueries({ 
          queryKey: creditClassKeys.detail(facultyCode, id) 
        });
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi xóa lớp tín chỉ: ' + error.message);
      options?.onError?.(error);
    },
  });
}; 