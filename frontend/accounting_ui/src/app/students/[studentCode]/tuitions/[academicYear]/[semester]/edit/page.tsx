'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StudentBasicInfo, TuitionResponse, RequiredTuitionStudentRequest } from '@/types'; // Giả sử các type này đã được định nghĩa
import AppBreadcrumb, { type BreadcrumbItem } from '@/components/layout/AppBreadcrumb';
import { formatCurrency } from '@/utils/formatters';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getStudent, getStudentDetail, getStudentTuition, updateStudentTuition } from '@/services/accountingApi';

// Mock function to get student details - (Có thể copy từ student detail page hoặc dùng chung)
async function getMockStudentDetails(studentCode: string): Promise<StudentBasicInfo | null> {
  console.warn("getMockStudentDetails (edit page) is using MOCK DATA.");
  await new Promise(resolve => setTimeout(resolve, 200));
  if (studentCode === "SV001") return { studentCode: "SV001", firstName: "Văn An", lastName: "Nguyễn", classCode: "CNTT01K15", facultyCode: "CNTT" };
  if (studentCode === "SV002") return { studentCode: "SV002", firstName: "Thị Bình", lastName: "Trần", classCode: "VT01K15", facultyCode: "VT" };
  return null;
}

// Mock function to get a single tuition detail
async function getMockSingleTuitionDetail(studentCode: string, academicYear: string, semester: string): Promise<TuitionResponse | null> {
  console.warn(`getMockSingleTuitionDetail is using MOCK DATA for ${studentCode} ${academicYear} ${semester}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  // Giả sử SV001 có học phí này
  if (studentCode === "SV001" && academicYear === "2023-2024" && semester === "2") {
    return {
      academicYear: "2023-2024",
      semester: "2",
      tuitionAmount: 7800000,
      tuitionPaid: 5000000, // Giữ lại thông tin đã đóng nếu có
    };
  }
   if (studentCode === "SV001" && academicYear === "2023-2024" && semester === "1") {
    return {
      academicYear: "2023-2024",
      semester: "1",
      tuitionAmount: 7500000,
      tuitionPaid: 7500000,
    };
  }
  return null; // Trả về null nếu không tìm thấy
}

// Mock function to update tuition
async function updateMockTuition(
  studentCode: string, 
  academicYear: string, 
  semester: string, 
  newTuitionFee: number
): Promise<TuitionResponse | null> {
  console.warn(`updateMockTuition is using MOCK DATA for ${studentCode} ${academicYear} ${semester}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  // Giả lập cập nhật thành công và trả về dữ liệu mới
  // Trong thực tế, bạn sẽ gọi API và API sẽ xử lý việc này
  // Kiểm tra xem tuition có tồn tại không trước khi cập nhật (logic này nên ở backend)
  const existingTuition = await getMockSingleTuitionDetail(studentCode, academicYear, semester);
  if (existingTuition) {
    return {
      ...existingTuition,
      tuitionAmount: newTuitionFee,
      // tuitionPaid không thay đổi khi chỉ sửa học phí phải đóng
    };
  }
  return null; 
}


// Zod schema for editing tuition (chỉ cho phép sửa tuitionFee)
const editTuitionFormSchema = z.object({
  tuitionFee: z.number({
      required_error: "Số tiền học phí không được để trống.",
      invalid_type_error: "Số tiền học phí phải là một số.",
    })
    .min(1001, { message: "Số tiền học phí phải lớn hơn 1000 VNĐ." }),
  // academicYear và semester không cho sửa ở đây vì chúng là key
});

type EditTuitionPageProps = {
  params: Promise<{ studentCode: string; academicYear: string; semester: string }>;
};

export default function EditTuitionPage({ params: paramsPromise }: EditTuitionPageProps) {
  const params = use(paramsPromise);
  const { studentCode, academicYear, semester } = params;
  const router = useRouter();

  const [studentInfo, setStudentInfo] = useState<StudentBasicInfo | null>(null);
  const [originalTuition, setOriginalTuition] = useState<TuitionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // React Hook Form for edit tuition form  
  const tuitionEditForm = useForm<{ tuitionFee: number }>({
    resolver: zodResolver(editTuitionFormSchema),
    defaultValues: {
      tuitionFee: 0,
    },
  });

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setPageError(null);
      try {
        // Use single API call to get both student info and tuitions
        const studentDetail = await getStudentDetail(studentCode);
        
        // Set student info
        setStudentInfo({
          studentCode: studentDetail.studentCode,
          firstName: studentDetail.firstName,
          lastName: studentDetail.lastName,
          classCode: studentDetail.classCode,
          facultyCode: studentDetail.facultyCode,
        });

        // Find the specific tuition
        const tuition = studentDetail.tuitions.find(
          t => t.academicYear === academicYear && t.semester === semester
        );

        if (!tuition) {
          throw new Error(`Không tìm thấy học phí cho niên khóa ${academicYear} - Học kỳ ${semester}`);
        }

        setOriginalTuition(tuition);
        tuitionEditForm.reset({
          tuitionFee: tuition.tuitionAmount,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Lỗi tải dữ liệu trang sửa học phí.";
        setPageError(errorMsg);
        toast.error(errorMsg);
        console.error(errorMsg, err);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [studentCode, academicYear, semester, tuitionEditForm]);

  const handleSubmit = async (data: { tuitionFee: number }) => {
    if (!originalTuition) {
        toast.error("Không có thông tin học phí gốc để cập nhật.");
        return;
    }
    
    // Chỉ cho phép cập nhật nếu học phí mới khác học phí cũ
    if (data.tuitionFee === originalTuition.tuitionAmount) {
        toast.info("Không có thay đổi nào về số tiền học phí.");
        return; 
    }

    try {
      await updateStudentTuition(
        studentCode, 
        academicYear, 
        parseInt(semester), 
        data.tuitionFee
      );

      toast.success("Cập nhật học phí thành công!");
      router.push(`/students/${studentCode}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi cập nhật học phí.";
      toast.error(errorMsg);
      console.error("Update tuition error:", err);
    }
  };
  
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Trang chủ", href: "/" },
    { label: studentInfo ? `${studentInfo.lastName} ${studentInfo.firstName} (${studentCode})` : studentCode, href: studentCode ? `/students/${studentCode}` : '/' },
    { label: `Sửa Học Phí (${academicYear} - Kỳ ${semester})` }
  ];

  if (isLoading) {
    return <div className="p-4 md:p-6"><ToastContainer /><p>Đang tải dữ liệu trang sửa học phí...</p></div>;
  }

  if (pageError && !originalTuition) { // Nếu lỗi nghiêm trọng không tải được học phí
    return (
      <div className="p-4 md:p-6">
        <ToastContainer />
        <AppBreadcrumb items={breadcrumbItems.slice(0, originalTuition ? undefined : 2)} /> 
        <h1 className="text-2xl font-bold my-4 text-red-600">Lỗi</h1>
        <p className="text-red-500 bg-red-100 p-3 rounded-md">{pageError}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Quay Lại
        </button>
      </div>
    );
  }


  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <ToastContainer />
      <AppBreadcrumb items={breadcrumbItems} />
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Sửa Học Phí cho {studentInfo ? `${studentInfo.lastName} ${studentInfo.firstName}` : studentCode}
      </h1>
      {originalTuition && (
        <form onSubmit={tuitionEditForm.handleSubmit(handleSubmit)} className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niên khóa</label>
                <input 
                    type="text"
                    value={originalTuition.academicYear}
                    readOnly
                    className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Học kỳ</label>
                <input 
                    type="text"
                    value={originalTuition.semester}
                    readOnly
                    className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền đã đóng</label>
                <input 
                    type="text"
                    value={formatCurrency(originalTuition.tuitionPaid)}
                    readOnly
                    className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
            </div>
            <div>
                <label htmlFor="tuitionFee" className="block text-sm font-medium text-gray-700 mb-1">
                    Số tiền học phí phải đóng (VNĐ)
                </label>
                <input
                    id="tuitionFee"
                    type="number"
                    min="1001"
                    placeholder="Số tiền học phí (VNĐ, > 1000)"
                    {...tuitionEditForm.register('tuitionFee', { valueAsNumber: true })}
                    className={`w-full p-2.5 border rounded-md focus:ring-2 focus:border-blue-500 ${tuitionEditForm.formState.errors.tuitionFee ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                    aria-describedby="tuitionFee-error"
                />
                {tuitionEditForm.formState.errors.tuitionFee && (
                    <p id="tuitionFee-error" className="text-xs text-red-600 mt-1">{tuitionEditForm.formState.errors.tuitionFee.message}</p>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => router.push(`/students/${studentCode}`)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                    disabled={tuitionEditForm.formState.isSubmitting}
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={tuitionEditForm.formState.isSubmitting || isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
                >
                    {tuitionEditForm.formState.isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
            </div>
        </form>
      )}
      {pageError && originalTuition && /* Show minor page error if tuition data is still available for form */ (
         <p className="text-red-500 bg-red-100 p-3 rounded-md mt-4">{pageError}</p>
      )}
    </div>
  );
} 