"use client";

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/core/page-header';
import { StudentDataTable, Student } from '@/components/features/students/student-data-table';
import { columns as studentColumnsFunction } from '@/components/features/students/student-columns';
import { useAuth } from '@/lib/providers/AuthProvider';
import { UserRole } from '@/types/auth';
import { useClass, useStudentsInClass, useCreateStudentInClass, useDeleteStudentFromClass, useDeleteStudentsFromClass } from '@/hooks/use-classes';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { ClassDetailSkeleton } from '@/components/features/classes/class-detail-skeleton';
import { AddStudentDialog, type AddStudentFormValues } from '@/components/features/students/add-student-dialog';



export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);

  const classCode = params.class_code as string;
  
  const facultyCode = user?.role === UserRole.KHOA 
    ? user?.faculty_code || 'it-faculty'
    : 'it-faculty';

  const { data: classDetails, isLoading: classLoading, error: classError } = useClass(facultyCode, classCode);
  
  const { data: studentsData, isLoading: studentsLoading, error: studentsError } = useStudentsInClass(facultyCode, classCode, {
    page: 0,
    pageSize: 50
  });

  const createStudentMutation = useCreateStudentInClass(facultyCode, classCode, {
    onSuccess: () => {
      setAddStudentDialogOpen(false);
    }
  });

  const deleteStudentMutation = useDeleteStudentFromClass(facultyCode, classCode);
  const deleteStudentsMutation = useDeleteStudentsFromClass(facultyCode, classCode);

  const isLoading = classLoading || studentsLoading;
  const error = classError || studentsError;

  const studentsInClass = useMemo(() => {
    if (!studentsData?.items) return [];
    return studentsData.items.map(student => ({
      id: student.studentCode,
      student_code: student.studentCode,
      full_name: `${student.firstName} ${student.lastName}`,
      gender: (student.gender as "Nam" | "Nữ" | "Khác") || "Nam",
      date_of_birth: student.birthDate || "",
      email: undefined, // API không còn trả về email
      phone_number: undefined,
      class_code: classCode,
    } as Student));
  }, [studentsData, classCode]);

  const studentTableColumns = useMemo(() => studentColumnsFunction(), []);

  const canManageStudents = useMemo(() => 
    user?.role === UserRole.PGV || (user?.role === UserRole.KHOA && user?.faculty_code === classDetails?.faculty_code),
    [user, classDetails]
  );

  const handleAddStudent = async (values: AddStudentFormValues) => {
    const studentData = {
      firstName: values.firstName,
      lastName: values.lastName,
      address: values.address || undefined,
      gender: values.gender ? values.gender === "true" : undefined,
      birthDate: values.birthDate || undefined,
      isSuspended: values.isSuspended || false,
    };
    
    await createStudentMutation.mutateAsync(studentData);
  };

  const handleDeleteStudent = (student: Student) => {
    deleteStudentMutation.mutate(student.student_code);
  };

  const handleDeleteStudents = (students: Student[]) => {
    const studentCodes = students.map(s => s.student_code);
    deleteStudentsMutation.mutate(studentCodes);
  };

  if (isLoading) {
    return <ClassDetailSkeleton />;
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
              Không thể tải thông tin lớp học
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

  if (!classDetails) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Không tìm thấy lớp học
            </h3>
            <p className="text-yellow-600 dark:text-yellow-300 mb-4">
              Lớp học với mã "{classCode}" không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/classes')}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              Về danh sách lớp học
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/classes" className="hover:text-gray-700 transition-colors">Lớp học</a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 dark:text-gray-100 font-medium">{classDetails.class_code}</li>
          </ol>
        </nav>
      </div>
      <PageHeader 
        title={`Chi tiết Lớp học: ${classDetails.class_name}`}
        description={`Mã lớp: ${classDetails.class_code} • ${classDetails.faculty_name} • ${studentsInClass.length} sinh viên`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Thông tin Lớp</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mã Lớp</dt>
              <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">{classDetails.class_code}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tên Lớp</dt>
              <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">{classDetails.class_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Khoa Quản lý</dt>
              <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">{classDetails.faculty_name || classDetails.faculty_code}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Niên khóa</dt>
              <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">{classDetails.academic_year_code}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sĩ số hiện tại</dt>
              <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                <span className="font-semibold text-blue-600">{studentsInClass.length}</span> sinh viên
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sĩ số dự kiến</dt>
              <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                {classDetails.student_count ? (
                  <span className="font-semibold">{classDetails.student_count}</span>
                ) : (
                  <span className='italic text-gray-500'>N/A</span>
                )}
              </dd>
            </div>
            {classDetails.student_count && studentsInClass.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tỷ lệ đầy đủ</dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                  <span className={`font-semibold ${studentsInClass.length / classDetails.student_count >= 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {Math.round((studentsInClass.length / classDetails.student_count) * 100)}%
                  </span>
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
                Danh sách Sinh viên
              </h2>
              {canManageStudents && (
                <Button 
                  size="sm" 
                  onClick={() => setAddStudentDialogOpen(true)}
                  className="w-fit"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Thêm sinh viên
                </Button>
              )}
            </div>
            {studentsInClass.length > 0 && (
              <div className="flex gap-4 mt-2 sm:mt-0 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  <strong>{studentsInClass.filter(s => s.gender === 'Nam').length}</strong> Nam
                </span>
                <span>
                  <strong>{studentsInClass.filter(s => s.gender === 'Nữ').length}</strong> Nữ
                </span>
                <span>
                  <strong>{studentsInClass.filter(s => s.date_of_birth).length}</strong> có ngày sinh
                </span>
              </div>
            )}
          </div>
          {studentsInClass.length > 0 ? (
            <StudentDataTable 
              columns={studentTableColumns}
              data={studentsInClass}
              canManage={canManageStudents}
              classCode={classDetails.class_code}
              facultyCode={facultyCode}
              onDeleteStudent={handleDeleteStudent}
              onDeleteStudents={handleDeleteStudents}
            />
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium mb-2">Chưa có sinh viên nào</p>
                <p className="text-sm">Lớp học này hiện chưa có sinh viên được phân công.</p>
                {canManageStudents && (
                  <p className="text-sm mt-2 text-blue-600 dark:text-blue-400">
                    Sử dụng nút "Thêm sinh viên" ở trên để bắt đầu.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddStudentDialog
        open={addStudentDialogOpen}
        onOpenChange={setAddStudentDialogOpen}
        onSubmit={handleAddStudent}
        isLoading={createStudentMutation.isPending}
        classCode={classCode}
      />
    </div>
  );
} 