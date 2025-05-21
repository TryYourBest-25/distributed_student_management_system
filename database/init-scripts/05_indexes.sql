-- =========================================================================================
-- Tạo chỉ mục (Indexes) cho tất cả các bảng
-- =========================================================================================

SET search_path TO public;

-- REFERENCE TABLES (Bảng tham chiếu)
-- -------------------------

-- course (Môn học)
CREATE INDEX idx_course_credits ON course(lecture_credit, lab_credit);

-- lecturer (Giảng viên)
CREATE INDEX idx_lecturer_faculty ON lecturer(faculty_code);
CREATE INDEX idx_lecturer_name ON lecturer(last_name, first_name);

-- user_account (Tài khoản người dùng)
CREATE INDEX idx_user_account_active ON user_account(is_active);
CREATE INDEX idx_user_account_role ON user_account(role_id);

-- DISTRIBUTED TABLES (Bảng phân tán)
-- -------------------------

-- class (Lớp học)
CREATE INDEX idx_class_academic_year ON class(academic_year_code);
CREATE INDEX idx_class_name ON class(class_name);

-- student (Sinh viên)
CREATE INDEX idx_student_name ON student(last_name, first_name);
CREATE INDEX idx_student_status ON student(is_suspended);

-- credit_class (Lớp tín chỉ)
CREATE INDEX idx_credit_class_academic_term ON credit_class(academic_year, semester);
CREATE INDEX idx_credit_class_course ON credit_class(course_code);
CREATE INDEX idx_credit_class_lecturer ON credit_class(lecturer_code);

-- registration (Đăng ký lớp tín chỉ)
CREATE INDEX idx_registration_student ON registration(faculty_code, student_code);

-- ACCOUNTING TABLES (Bảng kế toán)
-- -------------------------

-- student_basic_info (Thông tin cơ bản sinh viên)
CREATE INDEX idx_student_basic_info_faculty ON student_basic_info(faculty_code);
CREATE INDEX idx_student_basic_info_class ON student_basic_info(class_code);
CREATE INDEX idx_student_basic_info_name ON student_basic_info(last_name, first_name);

-- tuition (Học phí)
CREATE INDEX idx_tuition_academic_term ON tuition(academic_year, semester);

-- tuition_payment (Chi tiết đóng học phí)
CREATE INDEX idx_tuition_payment_date ON tuition_payment(payment_date);
CREATE INDEX idx_tuition_payment_student_term ON tuition_payment(student_code, academic_year, semester); 