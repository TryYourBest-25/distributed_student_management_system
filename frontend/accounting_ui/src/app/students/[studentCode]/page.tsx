'use client';

import React, { useEffect, useState, useMemo, useCallback, use } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import {
  getStudent,
  getStudentDetail,
  getStudentTuitions,
  getTuitionPayments,
  createStudentTuition,
  upsertTuitionPayment,
  deleteStudentTuitions,
  deleteTuitionPayments,
} from '@/services/accountingApi';
import {
  StudentBasicInfo,
  TuitionResponse,
  RequiredTuitionStudentRequest,
  DeleteStudentTuitionRequest,
  PaymentResponse, // Thêm PaymentResponse
  // AcademicTerm, // Not directly used for mock, derived from tuitions
} from '@/types';
import AppBreadcrumb, { type BreadcrumbItem } from '@/components/layout/AppBreadcrumb';
import { formatCurrency, formatDate, createLocalDate, formatDateToISO } from '@/utils/formatters';

// Mock function to get student details - replace with actual API call
async function getMockStudentDetails(studentCode: string): Promise<StudentBasicInfo> {
  console.warn("getMockStudentDetails is using MOCK DATA.");
  await new Promise(resolve => setTimeout(resolve, 300)); // Shorter delay for mock
  if (studentCode === "SV001") {
    return {
      studentCode: "SV001",
      firstName: "Văn An",
      lastName: "Nguyễn",
      classCode: "CNTT01K15",
      facultyCode: "CNTT",
    };
  }
  if (studentCode === "SV002") {
    return {
      studentCode: "SV002",
      firstName: "Thị Bình",
      lastName: "Trần",
      classCode: "VT01K15",
      facultyCode: "VT",
    };
  }
  if (studentCode === "SV003") {
    return {
      studentCode: "SV003",
      firstName: "Hữu Cường",
      lastName: "Lê",
      classCode: "CNTT02K15",
      facultyCode: "CNTT",
    };
  }
  return {
    studentCode: studentCode,
    firstName: "Không tìm thấy",
    lastName: "Sinh viên",
    classCode: "N/A",
    facultyCode: "N/A",
  };
}

// Mock function to get student tuitions - replace with actual API call
async function getMockStudentTuitions(studentCode: string): Promise<TuitionResponse[]> {
  console.warn("getMockStudentTuitions is using MOCK DATA.");
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

  if (studentCode === "SV001") {
    return [
      {
        academicYear: "2023-2024",
        semester: "1",
        tuitionAmount: 7500000,
        tuitionPaid: 7500000,
      },
      {
        academicYear: "2023-2024",
        semester: "2",
        tuitionAmount: 7800000,
        tuitionPaid: 5000000,
      },
      {
        academicYear: "2022-2023",
        semester: "1",
        tuitionAmount: 7000000,
        tuitionPaid: 7000000,
      },
    ];
  }
  if (studentCode === "SV002") {
    return [
      {
        academicYear: "2023-2024",
        semester: "1",
        tuitionAmount: 8000000,
        tuitionPaid: 3000000,
      },
    ];
  }
  // SV003 has no tuition records yet
  return []; 
}

// Mock function to get tuition payments - replace with actual API call
async function getMockTuitionPayments(studentCode: string, academicYear: string, semester: string): Promise<PaymentResponse[]> {
  console.warn(`getMockTuitionPayments is using MOCK DATA for ${studentCode}, ${academicYear}, ${semester}.`);
  await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay

  if (studentCode === "SV001" && academicYear === "2023-2024" && semester === "2") {
    return [
      { paymentDate: "2023-10-15", amountPaid: 3000000 },
      { paymentDate: "2023-11-20", amountPaid: 2000000 },
    ];
  }
  if (studentCode === "SV001" && academicYear === "2023-2024" && semester === "1") {
    return [
      { paymentDate: "2023-08-10", amountPaid: 7500000 },
    ];
  }
  if (studentCode === "SV002" && academicYear === "2023-2024" && semester === "1") {
    return [
      { paymentDate: "2023-09-05", amountPaid: 1000000 },
      { paymentDate: "2023-10-05", amountPaid: 1000000 },
      { paymentDate: "2023-11-05", amountPaid: 1000000 },
    ];
  }
  return []; // Default to no payments for other cases
}

// Mock function to update a specific tuition payment
async function updateMockTuitionPayment(
  studentCode: string, // Needed for context, though mock might not use it directly for update
  tuitionKey: string, // academicYear-semester
  paymentIndex: number, // Index of the payment in its original list
  updatedPaymentData: { paymentDate: string; amountPaid: number }
): Promise<boolean> {
  console.warn(
    `updateMockTuitionPayment is using MOCK DATA for ${studentCode}, tuition ${tuitionKey}, payment index ${paymentIndex}`,
    updatedPaymentData
  );
  await new Promise(resolve => setTimeout(resolve, 400));
  // In a real scenario, you'd find the specific payment and update it.
  // For this mock, we assume success if the data looks reasonable.
  // This function would typically interact with an API endpoint.
  return updatedPaymentData.amountPaid > 0 && updatedPaymentData.paymentDate !== '';
}

// Mock function to delete a specific tuition payment
async function deleteMockTuitionPayment(
  studentCode: string, // For context
  tuitionKey: string, // academicYear-semester
  paymentIndex: number // Index of the payment to delete
): Promise<boolean> {
  console.warn(
    `deleteMockTuitionPayment is using MOCK DATA for ${studentCode}, tuition ${tuitionKey}, payment index ${paymentIndex}`
  );
  await new Promise(resolve => setTimeout(resolve, 300));
  // For this mock, we just assume success.
  // In a real API, this would return true if the payment was found and deleted.
  return true;
}

type StudentDetailPageProps = {
  // params is a Promise as per Next.js warning in App Router client components
  params: Promise<{ studentCode: string }>;
};

// Define Zod schema for tuition form
const tuitionFormSchema = z.object({
  academicYear: z.string()
    .min(1, { message: "Niên khóa không được để trống." })
    .regex(/^\d{4}-\d{4}$/, { message: "Niên khóa phải có định dạng YYYY-YYYY (VD: 2022-2023)." })
    .refine(val => {
      const parts = val.split('-');
      if (parts.length !== 2) return false; 
      const year1 = parseInt(parts[0]);
      const year2 = parseInt(parts[1]);
      return !isNaN(year1) && !isNaN(year2) && year2 === year1 + 1;
    }, { message: "Năm học không hợp lệ. Năm thứ hai phải lớn hơn năm thứ nhất đúng 1 năm (VD: 2022-2023)." })
    .refine(val => {
      const currentYear = new Date().getFullYear();
      const startYear = parseInt(val.split('-')[0]);
      return startYear >= currentYear - 10 && startYear <= currentYear + 5;
    }, { message: "Niên khóa phải trong khoảng 10 năm trước đến 5 năm sau hiện tại." }),
  semester: z.number({
      required_error: "Học kỳ không được để trống.",
      invalid_type_error: "Học kỳ phải là một số.",
    })
    .int({ message: "Học kỳ phải là số nguyên." })
    .min(1, { message: "Học kỳ phải từ 1 đến 4." })
    .max(4, { message: "Học kỳ phải từ 1 đến 4." }),
  tuitionFee: z.number({
      required_error: "Số tiền học phí không được để trống.",
      invalid_type_error: "Số tiền học phí phải là một số.",
    })
    .min(1001, { message: "Số tiền học phí phải lớn hơn 1000 VNĐ." })
    .max(100000000, { message: "Số tiền học phí không được vượt quá 100 triệu VNĐ." }),
});

// Schema for payment form
const paymentFormSchema = z.object({
  paymentDate: z.string()
    .min(1, { message: "Ngày đóng không được để trống." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Định dạng ngày phải là YYYY-MM-DD."}),
  amountPaid: z.number({
      required_error: "Số tiền đóng không được để trống.",
      invalid_type_error: "Số tiền đóng phải là một số.",
    })
    .positive({ message: "Số tiền đóng phải lớn hơn 0." })
    .max(100000000, { message: "Số tiền không được vượt quá 100 triệu VNĐ." }),
});

// Schema for editing payment form
const editPaymentFormSchema = z.object({
  paymentDate: z.string().min(1, { message: "Ngày đóng không được để trống." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Định dạng ngày phải là YYYY-MM-DD."}),
  amountPaid: z.number({
      required_error: "Số tiền đóng không được để trống.",
      invalid_type_error: "Số tiền đóng phải là một số.",
    })
    .positive({ message: "Số tiền đóng phải lớn hơn 0." }),
});

type TuitionFormData = z.infer<typeof tuitionFormSchema>;
type PaymentFormData = z.infer<typeof paymentFormSchema>;
type EditPaymentFormData = z.infer<typeof editPaymentFormSchema>;

// Helper functions for UX improvements
const getCurrentAcademicYear = (): string => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
  
  // Academic year typically starts in September (month 9)
  if (currentMonth >= 9) {
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
};

const getCurrentSemester = (): number => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Estimate semester based on month
  if (currentMonth >= 9 || currentMonth <= 1) {
    return 1; // Fall semester
  } else if (currentMonth >= 2 && currentMonth <= 6) {
    return 2; // Spring semester
  } else {
    return 3; // Summer semester
  }
};

const getSuggestedTuitionFee = (academicYear: string): number => {
  const year = parseInt(academicYear.split('-')[0]);
  const currentYear = new Date().getFullYear();
  
  // Base tuition fee with yearly increase
  const baseFee = 7000000; // 7 million VND
  const yearlyIncrease = 0.05; // 5% per year
  const yearsFromBase = Math.max(0, year - 2020);
  
  return Math.round(baseFee * Math.pow(1 + yearlyIncrease, yearsFromBase));
};

export default function StudentDetailPage({ params: paramsPromise }: StudentDetailPageProps) {
  // Unwrap the params promise using React.use()
  const params = use(paramsPromise);
  const { studentCode } = params; // Now this is safe
  const [studentInfo, setStudentInfo] = useState<StudentBasicInfo | null>(null);
  const [tuitions, setTuitions] = useState<TuitionResponse[]>([]);
  const [isLoadingStudent, setIsLoadingStudent] = useState(true);
  const [isLoadingTuitions, setIsLoadingTuitions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  // State for expanding tuition details
  const [expandedTuitionKey, setExpandedTuitionKey] = useState<string | null>(null);
  const [currentPayments, setCurrentPayments] = useState<PaymentResponse[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [showAddTuitionModal, setShowAddTuitionModal] = useState(false);

  // State for batch deleting tuitions
  const [selectedTuitionKeys, setSelectedTuitionKeys] = useState<string[]>([]);

  // State for batch deleting payments within a tuition
  const [selectedPaymentKeys, setSelectedPaymentKeys] = useState<string[]>([]); // Format: "tuitionKey-paymentDate"

  // State for editing a specific payment
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [editingPaymentDetails, setEditingPaymentDetails] = useState<{
    tuitionKey: string; // academicYear-semester
    payment: PaymentResponse; // Original payment data
    paymentIndex: number; // Index in the original currentPayments array or derived list
  } | null>(null);

  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [currentTuitionForPayment, setCurrentTuitionForPayment] = useState<TuitionResponse | null>(null);

  // React Hook Form for tuition form
  const tuitionForm = useForm<TuitionFormData>({
    resolver: zodResolver(tuitionFormSchema),
    defaultValues: {
      academicYear: '',
      semester: 1,
      tuitionFee: 0,
    },
  });

  // React Hook Form for payment form
  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentDate: '',
      amountPaid: 0,
    },
  });

  // React Hook Form for edit payment form
  const editPaymentForm = useForm<EditPaymentFormData>({
    resolver: zodResolver(editPaymentFormSchema),
    defaultValues: {
      paymentDate: '',
      amountPaid: 0,
    },
  });

  const fetchTuitionsData = useCallback(async () => {
    setIsLoadingTuitions(true);
    try {
      // USE REAL API - Get tuitions only
      const tuitionData = await getStudentTuitions(studentCode);
      setTuitions(tuitionData);
    } catch (err) {
      console.error('Failed to fetch tuitions:', err);
      setError(prevError => prevError || (err instanceof Error ? err.message : 'Lỗi tải danh sách học phí'));
    }
    setIsLoadingTuitions(false);
  }, [studentCode]);

  const fetchStudentAndTuitionsData = useCallback(async () => {
    setIsLoadingStudent(true);
    setIsLoadingTuitions(true);
    setError(null);
    try {
      // USE REAL API - Get both student info and tuitions in one call
      const studentDetail = await getStudentDetail(studentCode);
      setStudentInfo({
        studentCode: studentDetail.studentCode,
        firstName: studentDetail.firstName,
        lastName: studentDetail.lastName,
        classCode: studentDetail.classCode,
        facultyCode: studentDetail.facultyCode,
      });
      setTuitions(studentDetail.tuitions);
    } catch (err) {
      console.error('Failed to fetch student details:', err);
      setError(err instanceof Error ? err.message : 'Lỗi tải thông tin sinh viên');
    }
    setIsLoadingStudent(false);
    setIsLoadingTuitions(false);
  }, [studentCode]);

  useEffect(() => {
    if (studentCode) {
      fetchStudentAndTuitionsData();
    }
  }, [studentCode, fetchStudentAndTuitionsData]);

  const handleDeletePayment = async (tuitionKey: string, paymentToDelete: PaymentResponse, paymentIndex: number) => {
    if (!studentInfo?.studentCode) {
      toast.error("Không tìm thấy thông tin sinh viên.");
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa thanh toán ngày ${formatDate(paymentToDelete.paymentDate)} với số tiền ${formatCurrency(paymentToDelete.amountPaid)} không?`)) {
      try {
        // tuitionKey format: "2024-2025-1" -> ["2024", "2025", "1"] 
        const parts = tuitionKey.split('-');
        const academicYear = `${parts[0]}-${parts[1]}`; // "2024-2025"
        const semester = parseInt(parts[2]); // 1
        
        await deleteTuitionPayments(
          studentInfo.studentCode,
          academicYear,
          semester,
          [{ paymentDate: paymentToDelete.paymentDate }]
        );

        // Reload tuitions after successful deletion
        await fetchTuitionsData();
          
        // Reload payments for the expanded tuition
        if (expandedTuitionKey === tuitionKey) {
          const payments = await getTuitionPayments(
            studentInfo.studentCode, 
            academicYear, 
            semester
          );
          setCurrentPayments(payments);
        }
        
        // Clear payment selection if deleted payment was selected
        const paymentKey = `${tuitionKey}-${paymentToDelete.paymentDate}`;
        setSelectedPaymentKeys(prev => prev.filter(key => key !== paymentKey));
        
        toast.success("Xóa thanh toán thành công!");
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast.error(`Lỗi khi xóa thanh toán: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      }
    }
  };

  const handleTogglePaymentSelection = (tuitionKey: string, paymentDate: string) => {
    // Normalize paymentDate to YYYY-MM-DD format for consistent paymentKey
    // Avoid timezone shift by directly using the paymentDate if it's already in YYYY-MM-DD format
    let normalizedDate = paymentDate;
    if (paymentDate.includes('/')) {
      // If date is in DD/MM/YYYY format, convert to YYYY-MM-DD without timezone conversion
      const dateParts = paymentDate.split('/');
      if (dateParts.length === 3) {
        normalizedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
      }
    }
    const paymentKey = `${tuitionKey}-${normalizedDate}`;
  
    setSelectedPaymentKeys(prevSelected => {
      const newSelected = prevSelected.includes(paymentKey)
        ? prevSelected.filter(key => key !== paymentKey)
        : [...prevSelected, paymentKey];
      return newSelected;
    });
  };

  const handleDeleteSelectedPayments = async () => {
    console.log('=== handleDeleteSelectedPayments called ===');
    console.log('selectedPaymentKeys:', selectedPaymentKeys);
    console.log('studentInfo:', studentInfo);
    
    if (selectedPaymentKeys.length === 0) {
      console.log('No payments selected, showing warning');
      toast.warn("Vui lòng chọn ít nhất một thanh toán để xóa.");
      return;
    }

    if (!studentInfo) {
      console.log('No student info, showing error');
      toast.error("Không tìm thấy thông tin sinh viên.");
      return;
    }

    // Group selected payments by tuition
    const paymentsByTuition: Record<string, Array<{ paymentDate: string }>> = {};
    const paymentDetails: Array<{ tuitionKey: string; paymentDate: string; amount: number }> = [];

        selectedPaymentKeys.forEach(paymentKey => {
      // paymentKey format: "tuitionKey-paymentDate"
      // We need to be more careful about parsing since both parts can contain dashes
      
      // Find the last occurrence of a date-like pattern (YYYY-MM-DD) - all dates should be normalized now
      const datePattern = /(\d{4}-\d{1,2}-\d{1,2})$/;
      const dateMatch = paymentKey.match(datePattern);
      
      if (dateMatch) {
        const paymentDate = dateMatch[1];
        const tuitionKey = paymentKey.slice(0, paymentKey.lastIndexOf(paymentDate) - 1); // Remove the trailing dash
        
        if (!paymentsByTuition[tuitionKey]) {
          paymentsByTuition[tuitionKey] = [];
        }
        
        paymentsByTuition[tuitionKey].push({ paymentDate });
        
        // Find payment amount for confirmation message
        const payment = currentPayments.find(p => p.paymentDate === paymentDate);
        paymentDetails.push({
          tuitionKey,
          paymentDate,
          amount: payment?.amountPaid || 0
        });
      } else {
        console.error('Invalid paymentKey format - no valid date found:', paymentKey);
      }
    });

    // Create confirmation message
    const confirmationMessage = `Bạn có chắc chắn muốn xóa ${selectedPaymentKeys.length} thanh toán đã chọn?\n\n` +
      paymentDetails.map(p => {
        const parts = p.tuitionKey.split('-');
        const academicYear = `${parts[0]}-${parts[1]}`;
        const semester = parts[2];
        return `• ${academicYear} - Kỳ ${semester}: ${formatDate(p.paymentDate)} - ${formatCurrency(p.amount)}`;
      }).join('\n') +
      '\n\n⚠️ Hành động này không thể hoàn tác!';

    console.log('Showing confirmation dialog with message:', confirmationMessage);
    if (window.confirm(confirmationMessage)) {
      console.log('User confirmed deletion, proceeding...');
      try {
        setIsLoadingPayments(true);

        // Delete payments for each tuition
        console.log('paymentsByTuition:', paymentsByTuition);
        for (const [tuitionKey, paymentsToDelete] of Object.entries(paymentsByTuition)) {
          const parts = tuitionKey.split('-');
          
          // Ensure we have at least 3 parts for academicYear-semester format
          if (parts.length >= 3) {
            const academicYear = `${parts[0]}-${parts[1]}`;
            const semester = parseInt(parts[2]);
            
            // Validate that semester is a valid number
            if (!isNaN(semester)) {
              console.log('Calling deleteTuitionPayments with:', {
                studentCode: studentInfo.studentCode,
                academicYear,
                semester,
                paymentsToDelete
              });
              await deleteTuitionPayments(
                studentInfo.studentCode,
                academicYear,
                semester,
                paymentsToDelete
              );
              console.log('deleteTuitionPayments completed for tuitionKey:', tuitionKey);
            } else {
              console.error('Invalid semester in tuitionKey:', tuitionKey);
              toast.error(`Lỗi: Học kỳ không hợp lệ trong key "${tuitionKey}"`);
            }
          } else {
            console.error('Invalid tuitionKey format:', tuitionKey, 'parts:', parts);
            toast.error(`Lỗi: Format tuitionKey không hợp lệ "${tuitionKey}"`);
          }
        }

        // Clear selection
        setSelectedPaymentKeys([]);

        // Reload tuitions after successful deletion
        await fetchTuitionsData();
          
        // Reload payments for the expanded tuition if it exists
        if (expandedTuitionKey) {
          const parts = expandedTuitionKey.split('-');
          const academicYear = `${parts[0]}-${parts[1]}`;
          const semester = parseInt(parts[2]);
          
          const payments = await getTuitionPayments(
            studentInfo.studentCode, 
            academicYear, 
            semester
          );
          setCurrentPayments(payments);
        }

        toast.success(`✅ Đã xóa thành công ${paymentDetails.length} thanh toán!`, { autoClose: 5000 });
      } catch (error) {
        console.error("Error deleting selected payments:", error);
        toast.error(`❌ Lỗi khi xóa thanh toán: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`, { autoClose: 10000 });
      } finally {
        setIsLoadingPayments(false);
      }
    }
  };

  const handleOpenEditPaymentModal = (tuitionKey: string, payment: PaymentResponse, paymentIndex: number) => {
    setEditingPaymentDetails({ tuitionKey, payment, paymentIndex });
    editPaymentForm.reset({
      paymentDate: payment.paymentDate,
      amountPaid: payment.amountPaid,
    });
    setShowEditPaymentModal(true);
  };

  const handleCloseEditPaymentModal = () => {
    setShowEditPaymentModal(false);
    setEditingPaymentDetails(null);
    editPaymentForm.reset();
  };

  const handleSaveChangesToPayment = async (data: EditPaymentFormData) => {
    if (!editingPaymentDetails || !studentInfo) return;

    const { tuitionKey, payment: originalPayment } = editingPaymentDetails;

    try {
      // tuitionKey format: "2024-2025-1" -> ["2024", "2025", "1"]
      const parts = tuitionKey.split('-');
      const academicYear = `${parts[0]}-${parts[1]}`; // "2024-2025"
      const semester = parseInt(parts[2]); // 1
      
      // Delete the old payment first
      await deleteTuitionPayments(
        studentInfo.studentCode,
        academicYear,
        semester,
        [{ paymentDate: originalPayment.paymentDate }]
      );

      // Add the updated payment
      await upsertTuitionPayment(
        studentInfo.studentCode,
        academicYear,
        semester,
        data.paymentDate,
        data.amountPaid
      );

      // Reload tuitions after successful update
      await fetchTuitionsData();
        
      // Reload payments for the expanded tuition
      if (expandedTuitionKey === tuitionKey) {
        const payments = await getTuitionPayments(
          studentInfo.studentCode, 
          academicYear, 
          semester
        );
        setCurrentPayments(payments);
      }

      toast.success("Cập nhật thanh toán thành công!");
      handleCloseEditPaymentModal();
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error(`Lỗi khi cập nhật thanh toán: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  };

  const handleDeleteSelectedTuitions = async () => {
    if (selectedTuitionKeys.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một mục học phí để xóa.");
      return;
    }

    if (!studentInfo) {
      toast.error("Không tìm thấy thông tin sinh viên.");
      return;
    }

    // Create detailed confirmation message
    const selectedTuitions = selectedTuitionKeys.map(key => {
      // tuitionKey format: "2024-2025-1" -> ["2024", "2025", "1"]
      const parts = key.split('-');
      const academicYear = `${parts[0]}-${parts[1]}`; // "2024-2025"
      const semester = parts[2]; // "1"
      const tuition = tuitions.find(t => t.academicYear === academicYear && t.semester === semester);
      return {
        academicYear,
        semester,
        amount: tuition?.tuitionAmount || 0,
        paid: tuition?.tuitionPaid || 0,
      };
    });

    const confirmationMessage = `Bạn có chắc chắn muốn xóa ${selectedTuitionKeys.length} mục học phí đã chọn?\n\n` +
      selectedTuitions.map(t => 
        `• ${t.academicYear} - Kỳ ${t.semester}: ${formatCurrency(t.amount)} (đã đóng: ${formatCurrency(t.paid)})`
      ).join('\n') +
      '\n\n⚠️ Hành động này sẽ xóa hoàn toàn học phí và tất cả lịch sử thanh toán. Không thể hoàn tác!';

    if (window.confirm(confirmationMessage)) {
      try {
        setIsLoadingTuitions(true);
        
        // Convert selected keys to deletion requests (follow backend format)
        const tuitionsToDelete: DeleteStudentTuitionRequest[] = selectedTuitionKeys.map(key => {
          // tuitionKey format: "2024-2025-1" -> ["2024", "2025", "1"]
          const parts = key.split('-');
          const academicYear = `${parts[0]}-${parts[1]}`; // "2024-2025"
          const semester = parseInt(parts[2]); // 1
          return {
            academicYear,
            semester,
          };
        });

        console.log('Deleting tuitions:', tuitionsToDelete);
        
        await deleteStudentTuitions(studentInfo.studentCode, tuitionsToDelete);
        
        // Close expanded tuition if it was deleted
        if (expandedTuitionKey && selectedTuitionKeys.includes(expandedTuitionKey)) {
          setExpandedTuitionKey(null);
          setCurrentPayments([]);
        }
        
        // Clear selection first
        setSelectedTuitionKeys([]);
        
        // Reload tuitions after successful deletion
        await fetchTuitionsData();

        toast.success(
          `✅ Đã xóa thành công ${selectedTuitions.length} mục học phí:\n` +
          selectedTuitions.map(t => `• ${t.academicYear} - Kỳ ${t.semester}`).join('\n'),
          { autoClose: 7000 }
        );
      } catch (error) {
        console.error("Error deleting tuitions:", error);
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        toast.error(
          `❌ Lỗi khi xóa học phí: ${errorMessage}\n\n` +
          `Các mục đã chọn: ${selectedTuitions.map(t => `${t.academicYear}-Kỳ${t.semester}`).join(', ')}`,
          { autoClose: 10000 }
        );
      } finally {
        setIsLoadingTuitions(false);
      }
    }
  };

  const handleToggleTuitionSelection = (tuitionKey: string) => {
    setSelectedTuitionKeys(prevSelected =>
      prevSelected.includes(tuitionKey)
        ? prevSelected.filter(key => key !== tuitionKey)
        : [...prevSelected, tuitionKey]
    );
  };

  const handleTuitionClick = async (academicYear: string, semester: string) => {
    const currentKey = `${academicYear}-${semester}`;
    if (expandedTuitionKey === currentKey) {
      setExpandedTuitionKey(null);
      setCurrentPayments([]);
      // Clear payment selections for this tuition
      setSelectedPaymentKeys(prev => prev.filter(key => !key.startsWith(currentKey)));
    } else {
      // Clear payment selections for previous tuition
      if (expandedTuitionKey) {
        setSelectedPaymentKeys(prev => prev.filter(key => !key.startsWith(expandedTuitionKey)));
      }
      
      setIsLoadingPayments(true);
      setPaymentError(null);
      setCurrentPayments([]);
      try {
        if (!studentInfo?.studentCode) {
            toast.error("Không tìm thấy mã sinh viên để tải chi tiết thanh toán.");
            setIsLoadingPayments(false);
            return;
        }
        const payments = await getTuitionPayments(studentInfo.studentCode, academicYear, parseInt(semester));
        setCurrentPayments(payments);
        setExpandedTuitionKey(currentKey);
      } catch (err) {
        console.error('Failed to fetch tuition payments (mock):', err);
        const errorMessage = err instanceof Error ? err.message : 'Lỗi tải chi tiết thanh toán (mock)';
        setPaymentError(errorMessage);
        toast.error(errorMessage);
      }
      setIsLoadingPayments(false);
    }
  };

  const handleAddTuition = async (data: TuitionFormData) => {
    if (!studentInfo) {
      toast.error("Không tìm thấy thông tin sinh viên để ghi học phí.");
      return;
    }

    // Check for duplicate tuition
    const existingTuition = tuitions.find(
      t => t.academicYear === data.academicYear && t.semester === data.semester.toString()
    );
    
    if (existingTuition) {
      toast.error(`Học phí cho niên khóa ${data.academicYear} - Học kỳ ${data.semester} đã tồn tại.`);
      return;
    }

    try {
      setIsLoadingTuitions(true);
      
      const request: RequiredTuitionStudentRequest = {
        studentCode: studentInfo.studentCode,
        academicYear: data.academicYear,
        semester: data.semester,
        tuitionFee: data.tuitionFee,
      };

      await createStudentTuition(studentInfo.studentCode, request);
      
      // Reload tuitions after successful creation
      await fetchTuitionsData();
      
      setShowAddTuitionModal(false);
      tuitionForm.reset();
      toast.success("Thêm học phí thành công!");
    } catch (error) {
      console.error("Error creating tuition:", error);
      toast.error(`Lỗi khi tạo học phí: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsLoadingTuitions(false);
    }
  };
  
  const handleAddPayment = async (data: PaymentFormData) => {
    if (!currentTuitionForPayment) {
      toast.warn("Không có thông tin học phí để thêm thanh toán.");
      return;
    }

    if (!studentInfo) {
      toast.error("Không tìm thấy thông tin sinh viên.");
      return;
    }

    // Validation: Check if payment date is not in the future
    const paymentDate = createLocalDate(data.paymentDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today

    if (paymentDate > today) {
      toast.error("Ngày thanh toán không được là ngày tương lai.");
      return;
    }

    // Validation: Check if payment amount exceeds remaining tuition
    const remainingAmount = currentTuitionForPayment.tuitionAmount - currentTuitionForPayment.tuitionPaid;
    if (data.amountPaid > remainingAmount) {
      const confirmExceed = window.confirm(
        `Số tiền thanh toán (${formatCurrency(data.amountPaid)}) lớn hơn số tiền còn lại (${formatCurrency(remainingAmount)}).\n\n` +
        `Có thể sinh viên đã thanh toán dư. Bạn có muốn tiếp tục không?`
      );
      if (!confirmExceed) {
        return;
      }
    }

    try {
      setIsLoadingTuitions(true);
      
      await upsertTuitionPayment(
        studentInfo.studentCode,
        currentTuitionForPayment.academicYear,
        parseInt(currentTuitionForPayment.semester),
        data.paymentDate,
        data.amountPaid
      );

      // Reload tuitions after successful payment
      await fetchTuitionsData();
      
      // If expanded tuition is the same as payment tuition, reload payments
      const currentKey = `${currentTuitionForPayment.academicYear}-${currentTuitionForPayment.semester}`;
      if (expandedTuitionKey === currentKey) {
        const payments = await getTuitionPayments(
          studentInfo.studentCode, 
          currentTuitionForPayment.academicYear, 
          parseInt(currentTuitionForPayment.semester)
        );
        setCurrentPayments(payments);
      }

      setShowAddPaymentModal(false);
      paymentForm.reset();
      setCurrentTuitionForPayment(null);
      toast.success(
        `✅ Thêm thanh toán thành công!\n` +
        `Ngày: ${formatDate(data.paymentDate)} - Số tiền: ${formatCurrency(data.amountPaid)}`,
        { autoClose: 6000 }
      );
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error(`❌ Lỗi khi thêm thanh toán: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsLoadingTuitions(false);
    }
  };

  const filteredTuitions = useMemo(() => {
    if (!selectedAcademicYear && !selectedSemester) return tuitions;
    return tuitions.filter(t => 
        (!selectedAcademicYear || t.academicYear === selectedAcademicYear) &&
        (!selectedSemester || t.semester.toString() === selectedSemester)
    );
  }, [tuitions, selectedAcademicYear, selectedSemester]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Trang chủ", href: "/" },
    { label: studentInfo ? `${studentInfo.lastName} ${studentInfo.firstName}` : studentCode },
  ];

  // Keyboard shortcuts for modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC key to close modal
      if (event.key === 'Escape') {
        if (showAddTuitionModal) {
          setShowAddTuitionModal(false);
          tuitionForm.reset();
        }
        if (showAddPaymentModal) {
          setShowAddPaymentModal(false);
          setCurrentTuitionForPayment(null);
          paymentForm.reset();
        }
        if (showEditPaymentModal) {
          handleCloseEditPaymentModal();
        }
      }
      
      // Ctrl+Enter to submit form
      if (event.ctrlKey && event.key === 'Enter') {
        if (showAddTuitionModal && !tuitionForm.formState.isSubmitting) {
          tuitionForm.handleSubmit(handleAddTuition)();
        }
        if (showAddPaymentModal && !paymentForm.formState.isSubmitting) {
          paymentForm.handleSubmit(handleAddPayment)();
        }
        if (showEditPaymentModal && !editPaymentForm.formState.isSubmitting) {
          editPaymentForm.handleSubmit(handleSaveChangesToPayment)();
        }
      }

      // Delete key to trigger bulk delete
      if (event.key === 'Delete' && !showAddTuitionModal && !showAddPaymentModal && !showEditPaymentModal) {
        if (selectedTuitionKeys.length > 0 && !isLoadingTuitions) {
          event.preventDefault();
          handleDeleteSelectedTuitions();
        } else if (selectedPaymentKeys.length > 0 && !isLoadingPayments) {
          event.preventDefault();
          handleDeleteSelectedPayments();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAddTuitionModal, showAddPaymentModal, showEditPaymentModal, tuitionForm, paymentForm, editPaymentForm, handleAddTuition, handleAddPayment, handleSaveChangesToPayment, handleCloseEditPaymentModal, selectedTuitionKeys, selectedPaymentKeys, isLoadingTuitions, isLoadingPayments, handleDeleteSelectedTuitions, handleDeleteSelectedPayments]);

  if (isLoadingStudent) return <div className="p-4"><p>Đang tải thông tin sinh viên...</p></div>;
  
  return (
    <div className="p-4 md:p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <AppBreadcrumb items={breadcrumbItems} />

      {error && !isLoadingTuitions && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">Lỗi: {error}</p>}

      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Chi tiết Sinh viên: {studentInfo ? `${studentInfo.lastName} ${studentInfo.firstName} (${studentInfo.studentCode})` : studentCode}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <section className="lg:col-span-1 bg-white p-5 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Thông tin Cá nhân</h2>
          {studentInfo ? (
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Mã SV:</strong> {studentInfo.studentCode}</p>
              <p><strong>Họ:</strong> {studentInfo.lastName}</p>
              <p><strong>Tên:</strong> {studentInfo.firstName}</p>
              <p><strong>Lớp:</strong> {studentInfo.classCode}</p>
              <p><strong>Khoa:</strong> {studentInfo.facultyCode}</p>
            </div>
          ) : (
            <p className="text-gray-500">Không có thông tin sinh viên để hiển thị.</p>
          )}
        </section>

        <section className="lg:col-span-2 bg-white p-5 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
            <h2 className="text-xl font-semibold text-gray-700">Lịch sử Học phí</h2>
            <button 
              onClick={() => {
                setShowAddTuitionModal(true);
                // Auto-fill with suggestions
                const currentYear = getCurrentAcademicYear();
                const currentSem = getCurrentSemester();
                const suggestedFee = getSuggestedTuitionFee(currentYear);
                
                tuitionForm.reset({
                  academicYear: currentYear,
                  semester: currentSem,
                  tuitionFee: suggestedFee,
                });
              }}
              disabled={!studentInfo || isLoadingTuitions} 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 text-sm disabled:bg-gray-300"
            >
              Ghi Học Phí Mới
            </button>
          </div>
          {tuitions.length > 0 && (
            <div className="mb-4 flex items-center gap-3">
              <button
                  onClick={handleDeleteSelectedTuitions}
                  disabled={selectedTuitionKeys.length === 0 || isLoadingTuitions}
                  className={`px-4 py-2 rounded-md transition duration-150 text-sm font-medium ${
                    selectedTuitionKeys.length > 0 && !isLoadingTuitions
                      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={selectedTuitionKeys.length === 0 ? 'Vui lòng chọn ít nhất một mục để xóa' : `Xóa ${selectedTuitionKeys.length} mục đã chọn (hoặc nhấn Delete)`}
              >
                  {isLoadingTuitions ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      🗑️ Xóa {selectedTuitionKeys.length > 0 ? `${selectedTuitionKeys.length} mục đã chọn` : 'Học Phí Đã Chọn'}
                    </>
                  )}
              </button>
              {selectedTuitionKeys.length > 0 && (
                <span className="text-sm text-gray-600">
                  Đã chọn: {selectedTuitionKeys.map(key => key.replace('-', ' Kỳ ')).join(', ')}
                </span>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <select 
                value={selectedAcademicYear} 
                onChange={e => setSelectedAcademicYear(e.target.value)}
                className="p-2 border border-gray-300 rounded-md w-full sm:w-1/2 text-sm"
                disabled={isLoadingTuitions || tuitions.length === 0}
            >
                <option value="">Tất cả Niên khóa</option>
                {[...new Set(tuitions.map(t => t.academicYear))].sort((a,b) => b.localeCompare(a)).map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
            <select 
                value={selectedSemester} 
                onChange={e => setSelectedSemester(e.target.value)}
                className="p-2 border border-gray-300 rounded-md w-full sm:w-1/2 text-sm"
                disabled={isLoadingTuitions || tuitions.length === 0}
            >
                <option value="">Tất cả Học kỳ</option>
                {[...new Set(tuitions.map(t => t.semester))].sort((a,b) => parseInt(a) - parseInt(b)).map(sem => (
                    <option key={sem} value={sem}>Kỳ {sem}</option>
                ))}
            </select>
          </div>

          {isLoadingTuitions && !studentInfo ? (
            <p className="text-gray-600">Đang tải học phí...</p> 
          ) : !isLoadingTuitions && studentInfo && filteredTuitions.length > 0 ? (
            <div className="space-y-4">
              {filteredTuitions.map((tuition) => {
                const tuitionKey = `${tuition.academicYear}-${tuition.semester}`;
                const isExpanded = expandedTuitionKey === tuitionKey;
                const isSelected = selectedTuitionKeys.includes(tuitionKey);

                return (
                  <div key={tuitionKey} className={`p-4 border rounded-md transition-shadow ${isSelected ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:shadow-sm'}`}>
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        className="mr-3 mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        checked={isSelected}
                        onChange={() => handleToggleTuitionSelection(tuitionKey)}
                        aria-label={`Chọn học phí ${tuition.academicYear} - ${tuition.semester}`}
                      />
                      <div className="flex-grow">
                        <div className="cursor-pointer" onClick={() => handleTuitionClick(tuition.academicYear, tuition.semester)}>
                          <h3 className="font-semibold text-md text-blue-700 mb-2 flex justify-between items-center">
                            <span>Niên khóa: {tuition.academicYear} - Học kỳ: {tuition.semester}</span>
                            <span>{isExpanded ? '▲' : '▼'}</span>
                          </h3>
                          <div className="text-sm space-y-1">
                            <p>Phải đóng: <strong className="text-gray-800">{formatCurrency(tuition.tuitionAmount)}</strong></p>
                            <p>Đã đóng: <strong className="text-green-600">{formatCurrency(tuition.tuitionPaid)}</strong></p>
                            <p>Còn lại: <strong className={tuition.tuitionAmount - tuition.tuitionPaid > 0 ? "text-red-600" : "text-gray-700"}>{formatCurrency(tuition.tuitionAmount - tuition.tuitionPaid)}</strong></p>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            {isLoadingPayments && <p className="text-sm text-gray-500">Đang tải chi tiết thanh toán...</p>}
                            {paymentError && <p className="text-sm text-red-500">Lỗi: {paymentError}</p>}
                            {!isLoadingPayments && !paymentError && currentPayments.length > 0 && (
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-sm font-semibold text-gray-600">Chi tiết thanh toán:</h4>
                                  {selectedPaymentKeys.filter(key => key.startsWith(tuitionKey)).length > 0 && (
                                    <button
                                      onClick={handleDeleteSelectedPayments}
                                      disabled={isLoadingPayments}
                                      className={`px-2 py-1 rounded text-2xs font-medium transition duration-150 ${
                                        isLoadingPayments
                                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                          : 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                                      }`}
                                      title={`Xóa ${selectedPaymentKeys.filter(key => key.startsWith(tuitionKey)).length} thanh toán đã chọn`}
                                    >
                                      {isLoadingPayments ? (
                                        <>
                                          <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></span>
                                          Đang xóa...
                                        </>
                                      ) : (
                                        <>🗑️ Xóa đã chọn ({selectedPaymentKeys.filter(key => key.startsWith(tuitionKey)).length})</>
                                      )}
                                    </button>
                                  )}
                                </div>
                                <ul className="space-y-1 text-xs text-gray-600">
                                  {currentPayments.map((payment, index) => {
                                    // Normalize paymentDate to YYYY-MM-DD format for consistent paymentKey
                                    // Avoid timezone shift by directly using the paymentDate if it's already in YYYY-MM-DD format
                                    let normalizedDate = payment.paymentDate;
                                    if (payment.paymentDate.includes('/')) {
                                      // If date is in DD/MM/YYYY format, convert to YYYY-MM-DD without timezone conversion
                                      const dateParts = payment.paymentDate.split('/');
                                      if (dateParts.length === 3) {
                                        normalizedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
                                      }
                                    }
                                    const paymentKey = `${tuitionKey}-${normalizedDate}`;
                                    const isPaymentSelected = selectedPaymentKeys.includes(paymentKey);
                                    
                                    return (
                                      <li key={index} className={`flex items-center py-1 px-2 rounded transition-colors ${
                                        isPaymentSelected ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
                                      }`}>
                                        <input
                                          type="checkbox"
                                          className="mr-2 h-3 w-3 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                                          checked={isPaymentSelected}
                                          onChange={() => handleTogglePaymentSelection(tuitionKey, payment.paymentDate)}
                                          aria-label={`Chọn thanh toán ngày ${formatDate(payment.paymentDate)}`}
                                        />
                                        <span className="flex-grow">
                                          Ngày {formatDate(payment.paymentDate)}: {formatCurrency(payment.amountPaid)}
                                        </span>
                                        <div className="flex items-center gap-1 ml-2">
                                          <button 
                                            onClick={() => handleOpenEditPaymentModal(tuitionKey, payment, index)}
                                            className="px-2 py-0.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-2xs transition duration-150"
                                            aria-label={`Sửa thanh toán ngày ${formatDate(payment.paymentDate)}`}
                                          >
                                            Sửa
                                          </button>
                                          <button 
                                            onClick={() => handleDeletePayment(tuitionKey, payment, index)}
                                            className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 text-2xs transition duration-150"
                                            aria-label={`Xóa thanh toán ngày ${formatDate(payment.paymentDate)}`}
                                          >
                                            Xóa
                                          </button>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}
                            {!isLoadingPayments && !paymentError && currentPayments.length === 0 && (
                              <p className="text-xs text-gray-500 italic">Chưa có thanh toán nào cho kỳ này.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <button 
                            onClick={() => {
                                setCurrentTuitionForPayment(tuition);
                                
                                // Auto-fill payment form with suggested values
                                const remainingAmount = tuition.tuitionAmount - tuition.tuitionPaid;
                                const today = formatDateToISO(new Date());
                                
                                paymentForm.reset({
                                  paymentDate: today,
                                  amountPaid: remainingAmount > 0 ? remainingAmount : 1000000, // Default 1M if paid in full
                                });
                                
                                setShowAddPaymentModal(true);
                            }}
                            disabled={isLoadingTuitions} 
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs transition duration-150 disabled:bg-gray-300"
                        >
                            Thêm Thanh Toán
                        </button>
                        <Link
                          href={`/students/${studentCode}/tuitions/${tuition.academicYear}/${tuition.semester}/edit`}
                          className="px-3 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-xs transition duration-150 disabled:bg-gray-300 inline-block text-center"
                        >
                          Sửa Học Phí
                        </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Không có dữ liệu học phí cho lựa chọn này, hoặc sinh viên chưa có học phí được ghi nhận.</p>
          )}
        </section>
      </div>

      {/* Modal for Adding New Tuition */}
      {showAddTuitionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Ghi Học Phí Mới</h3>
            <p className="text-sm text-gray-600 mb-5">
              Form đã được điền sẵn với các giá trị đề xuất dựa trên thời gian hiện tại.
            </p>
            <form onSubmit={tuitionForm.handleSubmit(handleAddTuition)} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niên khóa</label>
                <input 
                  type="text" 
                  placeholder="Niên khóa (VD: 2022-2023)"
                  title="Nhập theo định dạng YYYY-YYYY, ví dụ 2022-2023"
                  autoFocus
                  disabled={tuitionForm.formState.isSubmitting}
                  {...tuitionForm.register('academicYear')}
                  className={`w-full p-2.5 border rounded-md focus:ring-2 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${tuitionForm.formState.errors.academicYear ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                />
                <p className="text-xs text-gray-500 mt-1">Định dạng: YYYY-YYYY (VD: {getCurrentAcademicYear()})</p>
                {tuitionForm.formState.errors.academicYear && (
                  <p className="text-xs text-red-600 mt-1">{tuitionForm.formState.errors.academicYear.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Học kỳ</label>
                <select 
                  disabled={tuitionForm.formState.isSubmitting}
                  {...tuitionForm.register('semester', { valueAsNumber: true })}
                  className={`w-full p-2.5 border rounded-md focus:ring-2 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${tuitionForm.formState.errors.semester ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                >
                  <option value={1}>Học kỳ 1 (Thu)</option>
                  <option value={2}>Học kỳ 2 (Xuân)</option>
                  <option value={3}>Học kỳ 3 (Hè)</option>
                  <option value={4}>Học kỳ 4 (Phụ)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Hiện tại đang là học kỳ {getCurrentSemester()}</p>
                {tuitionForm.formState.errors.semester && (
                  <p className="text-xs text-red-600 mt-1">{tuitionForm.formState.errors.semester.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền học phí (VNĐ)</label>
                <input 
                  type="number" 
                  step="any"
                  placeholder="Số tiền học phí" 
                  disabled={tuitionForm.formState.isSubmitting}
                  {...tuitionForm.register('tuitionFee', { valueAsNumber: true })}
                  className={`w-full p-2.5 border rounded-md focus:ring-2 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${tuitionForm.formState.errors.tuitionFee ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Từ 1,001 VNĐ đến 100,000,000 VNĐ. 
                  {tuitionForm.watch('academicYear') && (
                    <>Đề xuất: {formatCurrency(getSuggestedTuitionFee(tuitionForm.watch('academicYear')))}</>
                  )}
                </p>
                {tuitionForm.formState.errors.tuitionFee && (
                  <p className="text-xs text-red-600 mt-1">{tuitionForm.formState.errors.tuitionFee.message}</p>
                )}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <kbd className="px-2 py-1 bg-gray-100 border rounded text-xs">Esc</kbd> để hủy, 
                  <kbd className="px-2 py-1 bg-gray-100 border rounded text-xs mx-1">Ctrl+Enter</kbd> để ghi
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    disabled={tuitionForm.formState.isSubmitting}
                    onClick={() => {
                      setShowAddTuitionModal(false);
                      tuitionForm.reset();
                    }} 
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Hủy (Esc)
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoadingTuitions || tuitionForm.formState.isSubmitting} 
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 disabled:bg-gray-400"
                  >
                    {tuitionForm.formState.isSubmitting ? 'Đang ghi...' : 'Ghi Học Phí (Ctrl+Enter)'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Adding Payment */}
      {showAddPaymentModal && currentTuitionForPayment && (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">
                Thêm Thanh Toán
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Cho niên khóa <strong>{currentTuitionForPayment.academicYear}</strong> - Kỳ <strong>{currentTuitionForPayment.semester}</strong>
            </p>
            <p className="text-xs text-blue-600 mb-2">
              📝 Form đã được điền sẵn với ngày hôm nay và số tiền còn lại cần thanh toán.
            </p>
            <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng học phí:</span>
                <span className="font-medium">{formatCurrency(currentTuitionForPayment.tuitionAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã đóng:</span>
                <span className="font-medium text-green-600">{formatCurrency(currentTuitionForPayment.tuitionPaid)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span className="text-gray-600">Còn lại:</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(currentTuitionForPayment.tuitionAmount - currentTuitionForPayment.tuitionPaid)}
                </span>
              </div>
            </div>
            
            <form onSubmit={paymentForm.handleSubmit(handleAddPayment)} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thanh toán</label>
                <input 
                  type="date" 
                  disabled={paymentForm.formState.isSubmitting}
                  {...paymentForm.register('paymentDate')}
                  className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${paymentForm.formState.errors.paymentDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                <p className="text-xs text-gray-500 mt-1">Ngày thanh toán không được là ngày tương lai</p>
                {paymentForm.formState.errors.paymentDate && (
                  <p className="text-xs text-red-600 mt-1">{paymentForm.formState.errors.paymentDate.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền thanh toán (VNĐ)</label>
                <input 
                  type="number" 
                  step="any"
                  placeholder="Nhập số tiền thanh toán"
                  disabled={paymentForm.formState.isSubmitting}
                  {...paymentForm.register('amountPaid', { valueAsNumber: true })}
                  className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${paymentForm.formState.errors.amountPaid ? 'border-red-500' : 'border-gray-300'}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Từ 1 VNĐ đến 100,000,000 VNĐ. 
                  Số tiền đề xuất: {formatCurrency(currentTuitionForPayment.tuitionAmount - currentTuitionForPayment.tuitionPaid)}
                </p>
                {paymentForm.formState.errors.amountPaid && (
                  <p className="text-xs text-red-600 mt-1">{paymentForm.formState.errors.amountPaid.message}</p>
                )}
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <kbd className="px-2 py-1 bg-gray-100 border rounded text-xs">Esc</kbd> để hủy, 
                  <kbd className="px-2 py-1 bg-gray-100 border rounded text-xs mx-1">Ctrl+Enter</kbd> để xác nhận
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    disabled={paymentForm.formState.isSubmitting}
                    onClick={() => { 
                      setShowAddPaymentModal(false); 
                      setCurrentTuitionForPayment(null); 
                      paymentForm.reset();
                    }} 
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Hủy (Esc)
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoadingTuitions || paymentForm.formState.isSubmitting} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 disabled:bg-gray-400"
                  >
                    {paymentForm.formState.isSubmitting ? 'Đang xác nhận...' : 'Xác Nhận (Ctrl+Enter)'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Payment */}
      {showEditPaymentModal && editingPaymentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60] transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
            <h3 className="text-lg font-semibold mb-5 text-gray-700">
              Sửa Thông Tin Thanh Toán
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              Học phí: {editingPaymentDetails.tuitionKey.replace('-', ' - Kỳ ')}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Thanh toán gốc: {formatDate(editingPaymentDetails.payment.paymentDate)} - {formatCurrency(editingPaymentDetails.payment.amountPaid)}
            </p>
            
            <form onSubmit={editPaymentForm.handleSubmit(handleSaveChangesToPayment)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="editPaymentDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày đóng mới</label>
                <input 
                  type="date" 
                  id="editPaymentDate"
                  disabled={editPaymentForm.formState.isSubmitting}
                  {...editPaymentForm.register('paymentDate')}
                  className={`w-full p-2.5 border rounded-md focus:ring-2 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${editPaymentForm.formState.errors.paymentDate ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                />
                {editPaymentForm.formState.errors.paymentDate && (
                  <p className="text-xs text-red-600 mt-1">{editPaymentForm.formState.errors.paymentDate.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="editAmountPaid" className="block text-sm font-medium text-gray-700 mb-1">Số tiền đóng mới (VNĐ)</label>
                <input 
                  type="number" 
                  id="editAmountPaid"
                  step="any"
                  placeholder="Số tiền đóng"
                  disabled={editPaymentForm.formState.isSubmitting}
                  {...editPaymentForm.register('amountPaid', { valueAsNumber: true })}
                  className={`w-full p-2.5 border rounded-md focus:ring-2 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${editPaymentForm.formState.errors.amountPaid ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                />
                {editPaymentForm.formState.errors.amountPaid && (
                  <p className="text-xs text-red-600 mt-1">{editPaymentForm.formState.errors.amountPaid.message}</p>
                )}
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={handleCloseEditPaymentModal} 
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-150"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={editPaymentForm.formState.isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 disabled:bg-gray-400"
                >
                  {editPaymentForm.formState.isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 