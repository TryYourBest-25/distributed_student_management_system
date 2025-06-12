import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { classService, type ClassApiRequest, type GridifyQueryParams, type CreateStudentRequest } from '@/services/class-service';
import { apiResponseToClass, type Class, classToApiRequest } from '@/types/class';

// Query keys for class-related queries
export const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  list: (facultyCode: string, servicePath: string, params: GridifyQueryParams) => [...classKeys.lists(), facultyCode, servicePath, params] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (facultyCode: string, servicePath: string, code: string) => [...classKeys.details(), facultyCode, servicePath, code] as const,
  students: () => [...classKeys.all, 'students'] as const,
  studentsInClass: (facultyCode: string, servicePath: string, classCode: string, params: GridifyQueryParams) => [...classKeys.students(), facultyCode, servicePath, classCode, params] as const,
};

// Mock faculties for mapping
const mockFaculties = [
  { code: 'CNTT', name: 'Khoa Công nghệ Thông tin' },
  { code: 'DTVT', name: 'Khoa Điện tử Viễn thông' },
  { code: 'CK', name: 'Khoa Cơ khí' },
];

// Get all classes for a faculty
export const useClasses = (facultyCode: string, servicePath: string) => {
  return useQuery({
    queryKey: classKeys.lists(),
    queryFn: async () => {
      const response = await classService.getAllClasses(facultyCode, servicePath, {
        page: 0,
        pageSize: 50
      });
      
      return response.items.map(item => apiResponseToClass(item));
    },
    enabled: !!facultyCode && !!servicePath,
    staleTime: 5 * 60 * 1000, // 5 minutes to prevent duplicate calls
  });
};

// Get single class
export const useClass = (facultyCode: string, servicePath: string, classCode: string) => {
  return useQuery({
    queryKey: classKeys.detail(facultyCode, servicePath, classCode),
    queryFn: async () => {
      const response = await classService.getClassById(facultyCode, servicePath, classCode);
      return apiResponseToClass(response);
    },
    enabled: !!facultyCode && !!servicePath && !!classCode,
    staleTime: 5 * 60 * 1000,
  });
};

// Get students in class
export const useStudentsInClass = (facultyCode: string, servicePath: string, classCode: string, params: GridifyQueryParams = {}) => {
  return useQuery({
    queryKey: classKeys.studentsInClass(facultyCode, servicePath, classCode, params),
    queryFn: async () => {
      const response = await classService.getStudentsInClass(facultyCode, servicePath, classCode, params);
      return response;
    },
    enabled: !!facultyCode && !!servicePath && !!classCode,
    staleTime: 5 * 60 * 1000,
  });
};

// Create class mutation
export const useCreateClass = (facultyCode: string, servicePath: string, options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ClassApiRequest) => {
      return classService.createClass(facultyCode, servicePath, data);
    },
    onSuccess: (result, variables) => {
      toast.success(`Đã tạo lớp ${variables.classCode} thành công!`);
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi thêm lớp học: ' + error.message);
      options?.onError?.(error);
    },
  });
};

// Update class mutation
export const useUpdateClass = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ facultyCode, servicePath, classCode, data }: { 
      facultyCode: string; 
      servicePath: string;
      classCode: string; 
      data: ClassApiRequest 
    }) => {
      return classService.updateClass(facultyCode, servicePath, classCode, data);
    },
    onSuccess: (result, variables) => {
      toast.success('Cập nhật lớp học thành công');
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: classKeys.detail(variables.facultyCode, variables.servicePath, variables.classCode) 
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi cập nhật lớp học: ' + error.message);
      options?.onError?.(error);
    },
  });
};

// Delete class mutation
export const useDeleteClass = (facultyCode: string, servicePath: string, options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (classCode: string) => {
      return classService.deleteClass(facultyCode, servicePath, classCode);
    },
    onSuccess: (result, classCode) => {
      toast.success(`Đã xóa lớp ${classCode} thành công!`);
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi xóa lớp học: ' + error.message);
      options?.onError?.(error);
    },
  });
};

// Delete multiple classes mutation
export const useDeleteClasses = (facultyCode: string, servicePath: string, options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (classCodes: string[]) => {
      return classService.deleteClassesByIds(facultyCode, servicePath, classCodes);
    },
    onSuccess: (result, classCodes) => {
      const count = classCodes.length;
      toast.success(`Đã xóa ${count} lớp thành công!`);
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      // Invalidate detail queries for deleted classes
      classCodes.forEach(classCode => {
        queryClient.invalidateQueries({ 
          queryKey: classKeys.detail(facultyCode, servicePath, classCode) 
        });
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi xóa lớp học: ' + error.message);
      options?.onError?.(error);
    },
  });
};

// Search classes
export const useSearchClasses = (facultyCode: string, servicePath: string, query: string, params: GridifyQueryParams = {}) => {
  return useQuery({
    queryKey: [...classKeys.lists(), 'search', facultyCode, servicePath, query, params],
    queryFn: async () => {
      const response = await classService.searchClasses(facultyCode, servicePath, query, params);
      
      return {
        ...response,
        items: response.items.map(item => apiResponseToClass(item))
      };
    },
    enabled: !!facultyCode && !!servicePath && !!query,
    staleTime: 5 * 60 * 1000,
  });
};

// Create student in class mutation
export const useCreateStudentInClass = (facultyCode: string, servicePath: string, classCode: string, options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateStudentRequest) => {
      return classService.createStudentInClass(facultyCode, servicePath, classCode, data);
    },
    onSuccess: (result, variables) => {
      toast.success(`Đã thêm sinh viên ${variables.firstName} ${variables.lastName} vào lớp ${classCode} thành công!`);
      queryClient.invalidateQueries({ 
        queryKey: classKeys.studentsInClass(facultyCode, servicePath, classCode, {}) 
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi thêm sinh viên vào lớp: ' + error.message);
      options?.onError?.(error);
    },
  });
};

// Delete student from class mutation
export const useDeleteStudentFromClass = (facultyCode: string, servicePath: string, classCode: string, options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (studentCode: string) => {
      return classService.deleteStudentFromClass(facultyCode, servicePath, studentCode);
    },
    onSuccess: (result, studentCode) => {
      toast.success(`Đã xóa sinh viên ${studentCode} khỏi lớp ${classCode} thành công!`);
      queryClient.invalidateQueries({ 
        queryKey: classKeys.studentsInClass(facultyCode, servicePath, classCode, {}) 
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi xóa sinh viên khỏi lớp: ' + error.message);
      options?.onError?.(error);
    },
  });
};

// Delete multiple students from class mutation
export const useDeleteStudentsFromClass = (facultyCode: string, servicePath: string, classCode: string, options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (studentCodes: string[]) => {
      return classService.deleteStudentsFromClass(facultyCode, servicePath, studentCodes);
    },
    onSuccess: (result, studentCodes) => {
      const count = studentCodes.length;
      toast.success(`Đã xóa ${count} sinh viên khỏi lớp ${classCode} thành công!`);
      queryClient.invalidateQueries({ 
        queryKey: classKeys.studentsInClass(facultyCode, servicePath, classCode, {}) 
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi xóa sinh viên khỏi lớp: ' + error.message);
      options?.onError?.(error);
    },
  });
}; 