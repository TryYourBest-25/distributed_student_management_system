import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { lecturerService, type LecturerApiRequest, type GridifyQueryParams } from '@/services/lecturer-service';
import { apiResponseToLecturer, type Lecturer, lecturerToApiRequest } from '@/types/lecturer';

// Query keys for lecturer-related queries
export const lecturerKeys = {
  all: ['lecturers'] as const,
  lists: () => [...lecturerKeys.all, 'list'] as const,
  list: (params: GridifyQueryParams) => [...lecturerKeys.lists(), params] as const,
  details: () => [...lecturerKeys.all, 'detail'] as const,
  detail: (code: string) => [...lecturerKeys.details(), code] as const,
  search: () => [...lecturerKeys.all, 'search'] as const,
  searchByCode: (query: string) => [...lecturerKeys.search(), query] as const,
};

// Hook để lấy danh sách giảng viên
export function useLecturers(queryParams?: GridifyQueryParams) {
  return useQuery({
    queryKey: lecturerKeys.list(queryParams || {}),
    queryFn: () => lecturerService.getAllLecturers(queryParams),
    select: (data) => ({
      ...data,
      items: data.items.map(item => apiResponseToLecturer(item)),
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook để lấy thông tin một giảng viên
export function useLecturer(lecturerCode: string) {
  return useQuery({
    queryKey: lecturerKeys.detail(lecturerCode),
    queryFn: () => lecturerService.getLecturerById(lecturerCode),
    select: (data) => apiResponseToLecturer(data),
    enabled: !!lecturerCode,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook để tạo giảng viên mới
export function useCreateLecturer(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LecturerApiRequest) => lecturerService.createLecturer(data),
    onSuccess: (createdLecturerCode: string, variables: LecturerApiRequest) => {
      // Invalidate và refetch lecturer lists
      queryClient.invalidateQueries({ queryKey: lecturerKeys.lists() });
      
      toast.success(`Đã tạo giảng viên ${variables.lecturerCode} thành công!`);
      
      // Call custom onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error: Error) => {
      console.error('Create lecturer error:', error);
      toast.error(`Lỗi khi tạo giảng viên: ${error.message}`);
    },
  });
}

// Hook để cập nhật giảng viên
export function useUpdateLecturer(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      lecturerCode, 
      data 
    }: { 
      lecturerCode: string; 
      data: LecturerApiRequest 
    }) => lecturerService.updateLecturer(lecturerCode, data),
    onSuccess: (updatedLecturerCode: string, { lecturerCode, data }: { lecturerCode: string; data: LecturerApiRequest }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: lecturerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lecturerKeys.detail(lecturerCode) });
      
      // Nếu lecturerCode thay đổi, cần invalidate detail query cũ và mới
      if (lecturerCode !== data.lecturerCode) {
        queryClient.invalidateQueries({ queryKey: lecturerKeys.detail(data.lecturerCode) });
      }
      
      toast.success(`Đã cập nhật giảng viên ${data.lecturerCode} thành công!`);
      
      // Call custom onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error: Error) => {
      console.error('Update lecturer error:', error);
      toast.error(`Lỗi khi cập nhật giảng viên: ${error.message}`);
    },
  });
}

// Hook để xóa giảng viên
export function useDeleteLecturer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lecturerCode: string) => lecturerService.deleteLecturer(lecturerCode),
    onSuccess: (_, lecturerCode) => {
      // Invalidate và refetch lecturer lists
      queryClient.invalidateQueries({ queryKey: lecturerKeys.lists() });
      // Remove specific lecturer từ cache
      queryClient.invalidateQueries({ queryKey: lecturerKeys.detail(lecturerCode) });
      
      toast.success(`Đã xóa giảng viên ${lecturerCode} thành công!`);
    },
    onError: (error: Error) => {
      console.error('Delete lecturer error:', error);
      toast.error(`Lỗi khi xóa giảng viên: ${error.message}`);
    },
  });
}

// Hook để tìm kiếm giảng viên
export function useSearchLecturers(queryParams?: GridifyQueryParams) {
  return useQuery({
    queryKey: [...lecturerKeys.lists(), 'search', queryParams],
    queryFn: () => lecturerService.searchLecturers(queryParams),
    select: (data) => ({
      ...data,
      items: data.items.map(item => apiResponseToLecturer(item)),
    }),
    enabled: !!queryParams?.filter, // Chỉ chạy khi có filter
    staleTime: 30 * 1000, // 30 seconds cho search
  });
}

// Search lecturers by lecturer code
export const useSearchLecturersByCode = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: lecturerKeys.searchByCode(query),
    queryFn: async () => {
      if (!query || query.length < 2) {
        return { items: [], indexFrom: 0, pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
      }
      return lecturerService.searchLecturersByCode(query);
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}; 