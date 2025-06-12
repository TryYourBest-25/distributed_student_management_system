// Dựa trên ARCHITECTURE.md và Program.cs

// Thông tin cơ bản của sinh viên
export interface StudentBasicInfo {
  studentCode: string; // MASV
  firstName: string;   // TEN
  lastName: string;    // HO
  classCode: string;   // MALOP
  facultyCode: string; // MAKHOA
}

// Thông tin chi tiết sinh viên bao gồm cả học phí (từ endpoint /students/{studentCode})
export interface StudentDetailResponse {
  studentCode: string;
  firstName: string;
  lastName: string;
  classCode: string;
  facultyCode: string;
  tuitions: TuitionResponse[];
}

// Yêu cầu tạo học phí cho sinh viên (Dựa trên RequiredTuitionStudentRequest)
export interface RequiredTuitionStudentRequest {
  studentCode: string;
  academicYear: string; // NIENKHOA
  semester: number;     // HOCKY
  tuitionFee: number;   // HOCPHI
}

// Thông tin học phí (Dựa trên TuitionResponse từ Program.cs)
export interface TuitionResponse {
  academicYear: string;
  semester: string; // Trong Program.cs là string, có thể cần chuyển đổi nếu backend trả về số
  tuitionAmount: number; // HOCPHI
  tuitionPaid: number;   // Tổng SOTIENDONG từ CT_DongHocPhi
}

// Chi tiết một lần đóng học phí (Dựa trên CT_DongHocPhi và các tham số của endpoint)
export interface TuitionPayment {
  studentCode: string;
  academicYear: string;
  semester: number;
  paymentDate: string; // NGAYDONG (DateOnly ở backend, string ở frontend dạng YYYY-MM-DD)
  amountPaid: number;  // SOTIENDONG
}

// Yêu cầu xóa học phí của sinh viên (Dựa trên DeleteStudentTuitionRequest)
export interface DeleteStudentTuitionRequest {
  academicYear: string;
  semester: number;
}

// Yêu cầu xóa chi tiết đóng học phí (Dựa trên DeleteTuitionPaymentRequest)
export interface DeleteTuitionPaymentRequest {
  academicYear: string;
  semester: number;
  paymentDate: string; // DateTime ở backend
}

// Dùng cho bảng Tanstack Table, kết hợp StudentBasicInfo và có thể là thông tin học phí cơ bản
export interface StudentRow extends StudentBasicInfo {
  // Có thể thêm các trường tính toán hoặc tổng hợp khác ở đây nếu cần cho hiển thị bảng
  totalDebt?: number; 
}

// Phản hồi từ API khi lấy danh sách - phù hợp với PagedList<T> từ .NET
export interface PagedResult<T> {
  pageIndex: number; // Index của trang (0-based hoặc 1-based tùy theo IndexFrom)
  pageSize: number; // Kích thước trang
  totalCount: number; // Tổng số bản ghi
  totalPages: number; // Tổng số trang
  indexFrom: number; // Index bắt đầu (thường là 0 hoặc 1)
  items: T[]; // Danh sách items trong trang hiện tại
  hasPreviousPage: boolean; // Có trang trước không
  hasNextPage: boolean; // Có trang sau không
}

// Legacy interface for backward compatibility
export interface LegacyPagedResult<T> {
  data: T[];
  count: number;
}

// Thông tin niên khóa và học kỳ để lựa chọn
export interface AcademicTerm {
  academicYear: string;
  semester: number;
}

// Phản hồi chi tiết các lần thanh toán cho một mục học phí
export interface PaymentResponse {
  paymentDate: string; // "YYYY-MM-DD"
  amountPaid: number;
}

// Request body để tạo hoặc cập nhật payment - phù hợp với CreateOrUpdatePaymentRequest ở backend
export interface CreateOrUpdatePaymentRequest {
  paymentDate: string; // DateTime format: ISO string
  money: number;
} 