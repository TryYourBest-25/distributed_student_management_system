"use client";

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageHeader from '@/components/core/page-header';
import { useAuth } from '@/lib/providers/AuthProvider';
import { UserRole } from '@/types/auth';
import { useStudent, useStudentRegistrations, useUpdateStudent } from '@/hooks/use-students';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, User, Calendar, MapPin, AlertTriangle, BookOpen, Edit, Save, X } from 'lucide-react';
import { StudentDetailSkeleton } from '@/components/features/students/student-detail-skeleton';

const updateStudentSchema = z.object({
  newStudentCode: z.string().optional().refine((code) => {
    if (!code) return true;
    const regex = /^\d{3}$/;
    return regex.test(code);
  }, "Mã sinh viên phải là 3 chữ số"),
  firstName: z.string().min(1, "Họ là bắt buộc"),
  lastName: z.string().min(1, "Tên là bắt buộc"),
  gender: z.enum(["true", "false"]).optional(),
  birthDate: z.string().optional().refine((date) => {
    if (!date) return true;
    
    // Accept multiple formats: dd/MM/yyyy, d/M/yyyy, yyyy-MM-dd
    const formats = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // d/M/yyyy or dd/MM/yyyy
      /^\d{4}-\d{1,2}-\d{1,2}$/,   // yyyy-M-d or yyyy-MM-dd
    ];
    
    return formats.some(regex => regex.test(date.trim()));
  }, "Ngày sinh phải có định dạng dd/MM/yyyy hoặc yyyy-MM-dd"),
  address: z.string().optional().or(z.literal('')),
  isSuspended: z.boolean().optional(),
});

type UpdateStudentFormValues = z.infer<typeof updateStudentSchema>;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);

  const studentCode = params.student_code as string;
  
  const facultyCode = user?.role === UserRole.KHOA 
    ? user?.faculty_code || 'it-faculty'
    : 'it-faculty';

  const { data: studentDetails, isLoading: studentLoading, error: studentError } = useStudent(facultyCode, studentCode);
  
  const { data: registrationsData, isLoading: registrationsLoading, error: registrationsError } = useStudentRegistrations(facultyCode, studentCode, {
    page: 0,
    pageSize: 50
  });

  const updateStudentMutation = useUpdateStudent(facultyCode, studentCode, {
    onSuccess: (newStudentCode) => {
      setEditMode(false);
      // If student code was changed, redirect to the new URL
      if (newStudentCode && newStudentCode !== studentCode) {
        router.replace(`/students/${newStudentCode}`);
      }
    }
  });

  const form = useForm<UpdateStudentFormValues>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: {
      newStudentCode: '',
      firstName: '',
      lastName: '',
      gender: 'true',
      birthDate: '',
      address: '',
      isSuspended: false,
    },
  });

  // Extract student code parts
  const studentCodePrefix = useMemo(() => {
    if (!studentDetails?.studentCode) return '';
    return studentDetails.studentCode.slice(0, -3);
  }, [studentDetails?.studentCode]);

  const studentCodeSuffix = useMemo(() => {
    if (!studentDetails?.studentCode) return '';
    return studentDetails.studentCode.slice(-3);
  }, [studentDetails?.studentCode]);

  // Convert ISO date to dd/MM/yyyy format
  const convertToDisplayDate = (isoDate?: string) => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return isoDate;
    }
  };

  // Update form when student data loads
  React.useEffect(() => {
    if (studentDetails) {
      form.reset({
        newStudentCode: studentCodeSuffix,
        firstName: studentDetails.firstName || '',
        lastName: studentDetails.lastName || '',
        gender: 'true',
        birthDate: convertToDisplayDate(studentDetails.birthDate),
        address: studentDetails.address || '',
        isSuspended: studentDetails.isSuspended || false,
      });
    }
  }, [studentDetails, studentCodeSuffix, form]);

  const isLoading = studentLoading || registrationsLoading;
  const error = studentError || registrationsError;

  const registrationStats = useMemo(() => {
    if (!registrationsData?.items) return { total: 0, active: 0, cancelled: 0 };
    
    return {
      total: registrationsData.items.length,
      active: registrationsData.items.filter(r => !r.isCancelled).length,
      cancelled: registrationsData.items.filter(r => r.isCancelled).length,
    };
  }, [registrationsData]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const canManageStudents = useMemo(() => 
    user?.role === UserRole.PGV || (user?.role === UserRole.KHOA && user?.faculty_code === facultyCode),
    [user, facultyCode]
  );

  // Convert various date formats to dd/MM/yyyy format for API
  const convertToAPIDate = (dateInput?: string) => {
    if (!dateInput) return undefined;
    
    const trimmedDate = dateInput.trim();
    
    try {
      // If already in dd/MM/yyyy format, validate and return
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmedDate)) {
        const [day, month, year] = trimmedDate.split('/');
        if (day && month && year) {
          // Validate the date
          const testDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(testDate.getTime())) {
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
          }
        }
      }
      
      // If in ISO format (yyyy-MM-dd), convert to dd/MM/yyyy
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmedDate)) {
        const [year, month, day] = trimmedDate.split('-');
        if (day && month && year) {
          // Validate the date
          const testDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(testDate.getTime())) {
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
          }
        }
      }
      
      return undefined;
    } catch {
      return undefined;
    }
  };

  const handleUpdateStudent = async (values: UpdateStudentFormValues) => {
    console.log('Form values:', values);
    
    const newFullStudentCode = values.newStudentCode ? 
      `${studentCodePrefix}${values.newStudentCode}` : 
      studentDetails?.studentCode;
    
    const convertedBirthDate = convertToAPIDate(values.birthDate);
    console.log('Birth date conversion:', {
      input: values.birthDate,
      output: convertedBirthDate,
      expected_format: 'dd/MM/yyyy'
    });
    
    const updateData = {
      newStudentCode: newFullStudentCode !== studentDetails?.studentCode ? newFullStudentCode : undefined,
      firstName: values.firstName,
      lastName: values.lastName,
      address: values.address || undefined,
      gender: values.gender ? values.gender === "true" : undefined,
      birthDate: convertedBirthDate,
      isSuspended: values.isSuspended || false,
    };
    
    console.log('Update data being sent to API:', updateData);
    await updateStudentMutation.mutateAsync(updateData);
  };

  if (isLoading) {
    return <StudentDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <a href="/classes" className="hover:text-gray-700 transition-colors">Lớp học</a>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <span className="text-gray-500">...</span>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 dark:text-gray-100 font-medium">
                {studentCode}
              </li>
            </ol>
          </nav>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Không thể tải thông tin sinh viên
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

  if (!studentDetails) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <a href="/classes" className="hover:text-gray-700 transition-colors">Lớp học</a>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <span className="text-gray-500">...</span>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 dark:text-gray-100 font-medium">
                {studentCode}
              </li>
            </ol>
          </nav>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Không tìm thấy sinh viên
            </h3>
            <p className="text-yellow-600 dark:text-yellow-300 mb-4">
              Sinh viên với mã "{studentCode}" không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/students')}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              Về danh sách sinh viên
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
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/classes" className="hover:text-gray-700 transition-colors">Lớp học</a>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <a href={`/classes/${studentDetails.classCode}`} className="hover:text-gray-700 transition-colors">
                {studentDetails.classCode}
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 dark:text-gray-100 font-medium">
              {studentDetails.studentCode}
            </li>
          </ol>
        </nav>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <PageHeader 
          title={`Chi tiết Sinh viên: ${studentDetails.firstName} ${studentDetails.lastName}`}
          description={`Mã sinh viên: ${studentDetails.studentCode} • Lớp: ${studentDetails.classCode} • ${registrationStats.total} đăng ký`}
        />
        {canManageStudents && (
          <div className="flex gap-2 mt-4 sm:mt-0">
            {editMode ? (
              <>
                <Button 
                  onClick={form.handleSubmit(handleUpdateStudent)}
                  disabled={updateStudentMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateStudentMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setEditMode(false);
                    form.reset();
                  }}
                  disabled={updateStudentMutation.isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Hủy
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setEditMode(true)}
                className="mt-4 sm:mt-0"
              >
                <Edit className="mr-2 h-4 w-4" />
                Sửa thông tin
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <User className="mr-2 h-5 w-5" />
            Thông tin Sinh viên
          </h2>
          
          {editMode ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateStudent)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="newStudentCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">Mã sinh viên</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-0 border rounded-md">
                          <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 border-r text-sm font-mono text-gray-600 dark:text-gray-300">
                            {studentCodePrefix}
                          </div>
                          <Input 
                            {...field}
                            placeholder="000"
                            className="border-0 rounded-l-none font-mono text-center w-20 focus-visible:ring-0"
                            maxLength={3}
                          />
                        </div>
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">Chỉ có thể thay đổi 3 chữ số cuối</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">Họ</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập họ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">Tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        Ngày sinh
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="dd/MM/yyyy hoặc yyyy-MM-dd" 
                          {...field}
                          onChange={(e) => {
                            let value = e.target.value;
                            // Auto-format dd/MM/yyyy when user types numbers
                            if (/^\d{8}$/.test(value.replace(/\D/g, ''))) {
                              const numbers = value.replace(/\D/g, '');
                              if (numbers.length === 8) {
                                value = `${numbers.slice(0,2)}/${numbers.slice(2,4)}/${numbers.slice(4,8)}`;
                              }
                            }
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">
                        Ví dụ: 26/06/2004 hoặc 2004-06-26
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        Địa chỉ
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Nhập địa chỉ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Lớp học</label>
                  <div className="mt-1 text-md text-gray-900 dark:text-gray-100">{studentDetails.classCode}</div>
                  <p className="text-xs text-gray-500 mt-1">Lớp học không thể thay đổi</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Khoa quản lý</label>
                  <div className="mt-1 text-md text-gray-900 dark:text-gray-100">{studentDetails.facultyCode}</div>
                  <p className="text-xs text-gray-500 mt-1">Khoa quản lý không thể thay đổi</p>
                </div>
                
                <FormField
                  control={form.control}
                  name="isSuspended"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        <AlertTriangle className="mr-1 h-4 w-4" />
                        Tình trạng
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className="text-sm">Đình chỉ học tập</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          ) : (
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mã sinh viên</dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100 font-medium">{studentDetails.studentCode}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Họ và tên</dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                  {studentDetails.firstName} {studentDetails.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Ngày sinh
                </dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                  {formatDate(studentDetails.birthDate)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  Địa chỉ
                </dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                  {studentDetails.address || <span className="italic text-gray-500">Chưa cập nhật</span>}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Lớp học</dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600 hover:text-blue-800"
                    onClick={() => router.push(`/classes/${studentDetails.classCode}`)}
                  >
                    {studentDetails.classCode}
                  </Button>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Khoa quản lý</dt>
                <dd className="mt-1 text-md text-gray-900 dark:text-gray-100">{studentDetails.facultyCode}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  Tình trạng
                </dt>
                <dd className="mt-1">
                  <Badge variant={studentDetails.isSuspended ? "destructive" : "default"} 
                         className={studentDetails.isSuspended ? "" : "bg-green-100 text-green-800 hover:bg-green-200"}>
                    {studentDetails.isSuspended ? "Đã nghỉ học" : "Đang học"}
                  </Badge>
                </dd>
              </div>
            </dl>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center mb-2 sm:mb-0">
              <BookOpen className="mr-2 h-5 w-5" />
              Danh sách Đăng ký Tín chỉ
            </h2>
            {registrationStats.total > 0 && (
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  <strong className="text-blue-600">{registrationStats.total}</strong> tổng cộng
                </span>
                <span>
                  <strong className="text-green-600">{registrationStats.active}</strong> đã đăng ký
                </span>
                {registrationStats.cancelled > 0 && (
                  <span>
                    <strong className="text-red-600">{registrationStats.cancelled}</strong> đã hủy
                  </span>
                )}
              </div>
            )}
          </div>
          
          {registrationsData?.items && registrationsData.items.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã môn học</TableHead>
                    <TableHead className="text-center">Nhóm</TableHead>
                    <TableHead className="text-center">Năm học</TableHead>
                    <TableHead className="text-center">Học kỳ</TableHead>
                    <TableHead className="text-center">Sĩ số</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrationsData.items.map((registration) => (
                    <TableRow key={registration.creditClassId}>
                      <TableCell className="font-medium">
                        {registration.courseCode}
                      </TableCell>
                      <TableCell className="text-center">
                        {registration.groupNumber}
                      </TableCell>
                      <TableCell className="text-center">
                        {registration.academicYear}
                      </TableCell>
                      <TableCell className="text-center">
                        HK {registration.semester}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${registration.currentStudent >= registration.minStudent ? 'text-green-600' : 'text-orange-600'}`}>
                          {registration.currentStudent}
                        </span>
                        <span className="text-gray-500">/{registration.minStudent}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={registration.isCancelled ? "destructive" : "default"}
                          className={registration.isCancelled ? "" : "bg-green-100 text-green-800 hover:bg-green-200"}
                        >
                          {registration.isCancelled ? "Đã hủy" : "Đã đăng ký"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Chưa có đăng ký nào</p>
                <p className="text-sm">Sinh viên này chưa đăng ký môn học tín chỉ nào.</p>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
} 