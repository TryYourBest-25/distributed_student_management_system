-- =========================================================================================
-- Bảng Tham Chiếu (Reference Tables)
-- =========================================================================================

SET search_path TO public;

-- Bảng Khoa (faculty)
CREATE TABLE faculty (
    faculty_code VARCHAR(10) NOT NULL,
    faculty_name VARCHAR(50) NOT NULL
);
COMMENT ON TABLE faculty IS 'Bảng chứa thông tin các khoa';
COMMENT ON COLUMN faculty.faculty_code IS 'Mã khoa';
COMMENT ON COLUMN faculty.faculty_name IS 'Tên khoa';

-- Bảng Môn học (course)
CREATE TABLE course (
    course_code VARCHAR(10) NOT NULL,
    course_name VARCHAR(50) NOT NULL,
    lecture_credit INTEGER NOT NULL,
    lab_credit INTEGER NOT NULL
);
COMMENT ON TABLE course IS 'Bảng chứa thông tin các môn học';
COMMENT ON COLUMN course.course_code IS 'Mã môn học';
COMMENT ON COLUMN course.course_name IS 'Tên môn học';
COMMENT ON COLUMN course.lecture_credit IS 'Số tín chỉ lý thuyết';
COMMENT ON COLUMN course.lab_credit IS 'Số tín chỉ thực hành';

-- Bảng Giảng viên (lecturer)
CREATE TABLE lecturer (
    lecturer_code VARCHAR(10) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(10) NOT NULL,
    degree VARCHAR(20),
    academic_rank VARCHAR(20),
    specialization VARCHAR(50),
    faculty_code VARCHAR(10) NOT NULL
);
COMMENT ON TABLE lecturer IS 'Bảng chứa thông tin giảng viên';
COMMENT ON COLUMN lecturer.lecturer_code IS 'Mã giảng viên';
COMMENT ON COLUMN lecturer.last_name IS 'Họ giảng viên';
COMMENT ON COLUMN lecturer.first_name IS 'Tên giảng viên';
COMMENT ON COLUMN lecturer.degree IS 'Học vị';
COMMENT ON COLUMN lecturer.academic_rank IS 'Học hàm';
COMMENT ON COLUMN lecturer.specialization IS 'Chuyên môn';
COMMENT ON COLUMN lecturer.faculty_code IS 'Mã khoa (FK)';

-- Bảng Người dùng (Tài khoản đăng nhập) (user_account)
CREATE TABLE user_account (
    user_id VARCHAR(20) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    role_id INTEGER NOT NULL
);
COMMENT ON TABLE user_account IS 'Bảng chứa thông tin tài khoản người dùng';
COMMENT ON COLUMN user_account.user_id IS 'ID người dùng';
COMMENT ON COLUMN user_account.username IS 'Tên đăng nhập';
COMMENT ON COLUMN user_account.password_hash IS 'Mật khẩu đã được hash';
COMMENT ON COLUMN user_account.full_name IS 'Họ tên đầy đủ';
COMMENT ON COLUMN user_account.email IS 'Địa chỉ email';
COMMENT ON COLUMN user_account.is_active IS 'Tài khoản có đang hoạt động không?';
COMMENT ON COLUMN user_account.role_id IS 'ID vai trò (FK)';

-- Bảng Vai trò (role)
CREATE TABLE role (
    role_id SERIAL NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    description TEXT
);
COMMENT ON TABLE role IS 'Bảng định nghĩa các vai trò trong hệ thống';
COMMENT ON COLUMN role.role_id IS 'ID vai trò (tự động tăng)';
COMMENT ON COLUMN role.role_name IS 'Tên vai trò (ví dụ: PGV, KHOA, SV, PKT)';
COMMENT ON COLUMN role.description IS 'Mô tả vai trò';

-- Bảng Mã Lớp Toàn Cục (global_class_code)
CREATE TABLE global_class_code (
    class_code VARCHAR(10) NOT NULL,
    class_name VARCHAR(50) NOT NULL
);
COMMENT ON TABLE global_class_code IS 'Bảng lưu trữ các mã lớp đã sử dụng để đảm bảo tính duy nhất toàn cục';
COMMENT ON COLUMN global_class_code.class_code IS 'Mã lớp (PK)';
COMMENT ON COLUMN global_class_code.class_name IS 'Tên lớp (PK)';

-- Bảng Mã Sinh Viên Toàn Cục (global_student_code)
CREATE TABLE global_student_code (
    student_code VARCHAR(10) NOT NULL
);
COMMENT ON TABLE global_student_code IS 'Bảng lưu trữ các mã sinh viên đã sử dụng để đảm bảo tính duy nhất toàn cục';
COMMENT ON COLUMN global_student_code.student_code IS 'Mã sinh viên (PK)';

-- =========================================================================================
-- Định nghĩa các ràng buộc (Constraints)
-- =========================================================================================

-- Ràng buộc cho bảng faculty
ALTER TABLE faculty 
    ADD CONSTRAINT pk_faculty PRIMARY KEY (faculty_code);
ALTER TABLE faculty 
    ADD CONSTRAINT uq_faculty_name UNIQUE (faculty_name);

-- Ràng buộc cho bảng course
ALTER TABLE course 
    ADD CONSTRAINT pk_course PRIMARY KEY (course_code);
ALTER TABLE course 
    ADD CONSTRAINT uq_course_name UNIQUE (course_name);

-- Ràng buộc cho bảng lecturer
ALTER TABLE lecturer 
    ADD CONSTRAINT pk_lecturer PRIMARY KEY (lecturer_code);
ALTER TABLE lecturer 
    ADD CONSTRAINT fk_lecturer_faculty FOREIGN KEY (faculty_code) REFERENCES faculty(faculty_code);

-- Ràng buộc cho bảng role
ALTER TABLE role 
    ADD CONSTRAINT pk_role PRIMARY KEY (role_id);
ALTER TABLE role 
    ADD CONSTRAINT uq_role_name UNIQUE (role_name);

-- Ràng buộc cho bảng user_account
ALTER TABLE user_account 
    ADD CONSTRAINT pk_user_account PRIMARY KEY (user_id);
ALTER TABLE user_account 
    ADD CONSTRAINT uq_user_account_username UNIQUE (username);
ALTER TABLE user_account 
    ADD CONSTRAINT uq_user_account_email UNIQUE (email);
ALTER TABLE user_account 
    ADD CONSTRAINT fk_user_account_role FOREIGN KEY (role_id) REFERENCES role(role_id);

-- Ràng buộc cho bảng global_class_code
ALTER TABLE global_class_code
    ADD CONSTRAINT uq_global_class_name UNIQUE (class_name);
ALTER TABLE global_class_code 
    ADD CONSTRAINT pk_global_class_codes PRIMARY KEY (class_code, class_name);

-- Ràng buộc cho bảng global_student_code
ALTER TABLE global_student_code 
    ADD CONSTRAINT pk_global_student_codes PRIMARY KEY (student_code);

-- =========================================================================================
-- Tạo các bảng tham chiếu (Reference Tables)
-- =========================================================================================

SELECT create_reference_table('faculty');
SELECT create_reference_table('course');
SELECT create_reference_table('lecturer');
SELECT create_reference_table('role');
SELECT create_reference_table('user_account');
SELECT create_reference_table('global_class_code');
SELECT create_reference_table('global_student_code');