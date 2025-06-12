export enum UserRole {
  PGV = "PGV", // Phòng Giáo Vụ
  KHOA = "KHOA", // Khoa
  GV = "GV", // Giảng Viên
  SV = "SV", // Sinh Viên
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  faculty_code?: string; // Mã khoa nếu người dùng thuộc một khoa cụ thể (e.g., KHOA, GV)
  faculty_name?: string; // Tên khoa, có thể join từ faculty_code
}

// You might also have a type for the AuthContext state if you're using one
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  selectedFacultyForPgv?: string | null; // e.g., faculty_code or a special value like "ALL_FACULTIES"
} 