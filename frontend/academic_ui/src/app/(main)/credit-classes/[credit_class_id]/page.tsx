"use client";

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageHeader from '@/components/core/page-header';
import { useAuth } from '@/lib/providers/AuthProvider';
import { UserRole } from '@/types/auth';
import { useCreditClass, useStudentsInCreditClass, useUpdateCreditClass } from '@/hooks/use-credit-classes';
import { StudentDetailResponse } from '@/services/student-service';
import { type UpdateCreditClassRequest } from '@/services/credit-class-service';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, BookOpen, Clock, User, GraduationCap, Edit, Save, X } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CourseSearchCombobox } from '@/components/ui/course-search-combobox';
import { LecturerSearchCombobox } from '@/components/features/lecturers/lecturer-search-combobox';
import { AddStudentToCreditClassDialog } from '@/components/features/credit-classes/add-student-to-credit-class-dialog';

// Define columns for students table
const studentColumns: ColumnDef<StudentDetailResponse>[] = [
  {
    accessorKey: "studentCode",
    header: "Mã sinh viên",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("studentCode")}</div>
    ),
  },
  {
    accessorKey: "firstName",
    header: "Họ",
  },
  {
    accessorKey: "lastName", 
    header: "Tên",
  },
  {
    accessorKey: "classCode",
    header: "Lớp",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("classCode")}</Badge>
    ),
  },
  {
    accessorKey: "isSuspended",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isSuspended = row.getValue("isSuspended") as boolean;
      return (
        <Badge variant={isSuspended ? "destructive" : "secondary"}>
          {isSuspended ? "Đình chỉ" : "Hoạt động"}
        </Badge>
      );
    },
  },
];

// Form schema for editing credit class
const editCreditClassSchema = z.object({
  courseCode: z.string().min(1, "Mã môn học là bắt buộc"),
  groupNumber: z.coerce.number().min(1, "Số nhóm phải lớn hơn 0"),
  semester: z.coerce.number().min(1).max(3, "Học kỳ phải từ 1 đến 3"),
  minStudent: z.coerce.number().min(1, "Sĩ số tối thiểu phải lớn hơn 0"),
  lecturerCode: z.string().min(1, "Mã giảng viên là bắt buộc"),
  academicYearCode: z.string().min(1, "Mã năm học là bắt buộc"),
  isCancelled: z.boolean(),
});

type EditCreditClassFormValues = z.infer<typeof editCreditClassSchema>;

export default function CreditClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const creditClassId = Number(params.credit_class_id);
  
  const facultyCode = user?.role === UserRole.KHOA 
    ? user?.faculty_code || 'it-faculty'
    : 'it-faculty';

  const [studentsParams, setStudentsParams] = useState({
    page: 0,
    pageSize: 50,
  });

  const [isEditMode, setIsEditMode] = useState(false);

  // Form for editing credit class
  const form = useForm<EditCreditClassFormValues>({
    resolver: zodResolver(editCreditClassSchema),
    defaultValues: {
      courseCode: "",
      groupNumber: 1,
      semester: 1,
      minStudent: 30,
      lecturerCode: "",
      academicYearCode: "",
      isCancelled: false,
    },
  });

  // Update mutation
  const updateCreditClassMutation = useUpdateCreditClass(
    facultyCode,
    creditClassId,
    {
      onSuccess: () => {
        setIsEditMode(false);
      },
    }
  );

  // Fetch credit class detail
  const { 
    data: creditClass, 
    isLoading: isLoadingCreditClass, 
    error: creditClassError 
  } = useCreditClass(facultyCode, creditClassId);

  // Fetch students in credit class
  const { 
    data: studentsResponse, 
    isLoading: isLoadingStudents, 
    error: studentsError 
  } = useStudentsInCreditClass(facultyCode, creditClassId, studentsParams);

  const isLoading = isLoadingCreditClass || isLoadingStudents;
  const error = creditClassError || studentsError;

  const studentsInCreditClass = useMemo(() => {
    return studentsResponse?.items || [];
  }, [studentsResponse]);

  const canManage = useMemo(() => 
    user?.role === UserRole.PGV || (user?.role === UserRole.KHOA && user?.faculty_code === facultyCode),
    [user, facultyCode]
  );

  // Initialize form when creditClass data is available and edit mode is enabled
  React.useEffect(() => {
    if (isEditMode && creditClass) {
      form.reset({
        courseCode: creditClass.courseCode,
        groupNumber: creditClass.groupNumber,
        semester: creditClass.semester,
        minStudent: creditClass.minStudent,
        lecturerCode: creditClass.lecturerCode,
        academicYearCode: creditClass.academicYear,
        isCancelled: creditClass.isCancelled,
      });
    }
  }, [isEditMode, creditClass, form]);

  // Submit handler for form
  const onSubmit = async (values: EditCreditClassFormValues) => {
    if (!creditClass) return;
    
    const requestData: UpdateCreditClassRequest = {
      courseCode: values.courseCode,
      groupNumber: values.groupNumber,
      semester: values.semester,
      minStudent: values.minStudent,
      lecturerCode: values.lecturerCode,
      academicYearCode: values.academicYearCode,
      isCancelled: values.isCancelled,
    };
    
    await updateCreditClassMutation.mutateAsync(requestData);
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin lớp tín chỉ...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Không thể tải thông tin lớp tín chỉ
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-4">
              {error.message}
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!creditClass) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Không tìm thấy lớp tín chỉ
            </h3>
            <p className="text-yellow-600 dark:text-yellow-300 mb-4">
              Lớp tín chỉ với ID "{creditClassId}" không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/credit-classes')}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              Về danh sách lớp tín chỉ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalCredits = creditClass.lectureCredit + creditClass.labCredit;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/credit-classes" className="hover:text-gray-700 transition-colors">Lớp tín chỉ</a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 dark:text-gray-100 font-medium">
              {creditClass.courseCode}.{creditClass.groupNumber}
            </li>
          </ol>
        </nav>
      </div>
      
      <PageHeader 
        title={`Chi tiết Lớp tín chỉ: ${creditClass.courseName}`}
        description={`${creditClass.courseCode}.${creditClass.groupNumber} • ${creditClass.lecturerName} • ${studentsInCreditClass.length} sinh viên`}
        actionButton={
          canManage ? (
            <div className="flex gap-2">
              {!isEditMode ? (
                <>
                  <AddStudentToCreditClassDialog
                    facultyCode={facultyCode}
                    creditClassId={creditClassId}
                    courseCode={creditClass.courseCode}
                    groupNumber={creditClass.groupNumber}
                  />
                  <Button onClick={() => setIsEditMode(true)} size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Sửa thông tin
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => form.handleSubmit(onSubmit)()} 
                    size="sm"
                    disabled={updateCreditClassMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateCreditClassMutation.isPending ? "Đang lưu..." : "Lưu"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditMode(false);
                      form.reset();
                    }} 
                    size="sm"
                    disabled={updateCreditClassMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Hủy
                  </Button>
                </>
              )}
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Info Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Thông tin Lớp
            {isEditMode && (
              <Badge variant="secondary" className="ml-2">Đang chỉnh sửa</Badge>
            )}
          </h2>
          
          {!isEditMode ? (
            // Read-only view
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mã Lớp HP</dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                  {creditClass.courseCode}.{creditClass.groupNumber}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tên Môn học</dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">{creditClass.courseName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Giảng viên</dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                  {creditClass.lecturerName} ({creditClass.lecturerCode})
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Học kỳ</dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                  Học kỳ {creditClass.semester} - {creditClass.academicYear}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng tín chỉ</dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                  {totalCredits} tín chỉ ({creditClass.lectureCredit}LT + {creditClass.labCredit}TH)
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sĩ số hiện tại</dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                  <span className="font-semibold text-blue-600">{creditClass.currentStudent}</span> sinh viên
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sĩ số tối thiểu</dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">{creditClass.minStudent}</span> sinh viên
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái</dt>
                <dd className="mt-1">
                  <Badge variant={creditClass.isCancelled ? "destructive" : "secondary"}>
                    {creditClass.isCancelled ? "Đã hủy" : "Hoạt động"}
                  </Badge>
                </dd>
              </div>
              {creditClass.minStudent > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tỷ lệ đầy đủ</dt>
                  <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                    <span className={`font-semibold ${creditClass.currentStudent / creditClass.minStudent >= 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {Math.round((creditClass.currentStudent / creditClass.minStudent) * 100)}%
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          creditClass.currentStudent / creditClass.minStudent >= 0.8 ? 'bg-green-600' : 'bg-yellow-600'
                        }`}
                        style={{ 
                          width: `${Math.min((creditClass.currentStudent / creditClass.minStudent) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            // Edit mode form
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mã môn học *</label>
                <CourseSearchCombobox
                  value={form.watch('courseCode')}
                  onValueChange={(value) => form.setValue('courseCode', value)}
                  placeholder="Tìm và chọn môn học..."
                />
                {form.formState.errors.courseCode && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.courseCode.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Giảng viên *</label>
                <LecturerSearchCombobox
                  value={form.watch('lecturerCode')}
                  onValueChange={(value) => form.setValue('lecturerCode', value)}
                  placeholder="Tìm và chọn giảng viên..."
                />
                {form.formState.errors.lecturerCode && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.lecturerCode.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Số nhóm *</label>
                <Input
                  type="number"
                  min="1"
                  {...form.register('groupNumber')}
                  className="mt-1"
                />
                {form.formState.errors.groupNumber && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.groupNumber.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Học kỳ *</label>
                <Select 
                  value={form.watch('semester')?.toString()} 
                  onValueChange={(value) => form.setValue('semester', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn học kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Học kỳ 1</SelectItem>
                    <SelectItem value="2">Học kỳ 2</SelectItem>
                    <SelectItem value="3">Học kỳ 3</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.semester && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.semester.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Sĩ số tối thiểu *</label>
                <Input
                  type="number"
                  min="1"
                  {...form.register('minStudent')}
                  className="mt-1"
                />
                {form.formState.errors.minStudent && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.minStudent.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mã năm học *</label>
                <Input
                  {...form.register('academicYearCode')}
                  placeholder="Ví dụ: 2023-2024"
                  className="mt-1"
                />
                {form.formState.errors.academicYearCode && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.academicYearCode.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isCancelled"
                  checked={form.watch('isCancelled')}
                  onCheckedChange={(checked) => form.setValue('isCancelled', !!checked)}
                />
                <label
                  htmlFor="isCancelled"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Đã hủy lớp tín chỉ
                </label>
              </div>
            </form>
          )}
        </div>

        {/* Students Table */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Danh sách sinh viên ({studentsInCreditClass.length})
            </h2>
            
            {isLoadingStudents ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3">Đang tải danh sách sinh viên...</span>
              </div>
            ) : studentsError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Lỗi khi tải danh sách sinh viên</p>
              </div>
            ) : (
              <div>
                <DataTable
                  columns={studentColumns}
                  data={studentsInCreditClass}
                />
                
                {/* Custom Pagination */}
                {studentsResponse && studentsResponse.totalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Trang {studentsParams.page + 1} / {studentsResponse.totalPages} 
                      (Tổng {studentsResponse.totalCount} sinh viên)
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStudentsParams(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={studentsParams.page === 0}
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => setStudentsParams(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={studentsParams.page >= (studentsResponse.totalPages - 1)}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
} 