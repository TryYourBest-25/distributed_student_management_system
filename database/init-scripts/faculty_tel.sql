-- Dùng UTF-8 để hỗ trợ tiếng Việt
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS faculty_tel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE faculty_tel_db;

-- Bảng Lớp học (chỉ chứa lớp của khoa VT)
CREATE TABLE class (
    class_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã lớp',
    class_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên lớp',
    school_year CHAR(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Khóa học',
    faculty_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã khoa (luôn là VT ở DB này)',
    PRIMARY KEY (class_code),
    UNIQUE (class_name),
    -- Kiểm tra định dạng mã lớp khoa VT mới dựa trên ví dụ: D<YY>CQVT<NN>. Chấp nhận d và cq.
    CONSTRAINT chk_class_code_format_tel CHECK (class_code REGEXP '^[Dd][0-9]{2}[Cc][Qq]VT[0-9]{2}$'),
    -- Kiểm tra mã khoa phải là VT
    CONSTRAINT chk_faculty_code_tel CHECK (faculty_code = 'VT')
) COMMENT='Bảng chứa thông tin các lớp thuộc khoa VT';

-- Bảng Sinh viên (chỉ chứa sinh viên khoa VT)
CREATE TABLE student (
    student_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sinh viên',
    last_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Họ sinh viên',
    first_name VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên sinh viên',
    class_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã lớp (FK)',
    gender BOOLEAN DEFAULT FALSE COMMENT 'Phái (false: Nam, true: Nữ)',
    birth_date DATE COMMENT 'Ngày sinh',
    address VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Địa chỉ',
    is_suspended BOOLEAN DEFAULT FALSE COMMENT 'Đã nghỉ học (true/false)',
    password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT 'Mật khẩu (nên được hash)',
    PRIMARY KEY (student_code),
    CONSTRAINT fk_student_class FOREIGN KEY (class_code) REFERENCES class(class_code)
        ON UPDATE CASCADE ON DELETE RESTRICT, -- Sinh viên phải thuộc về một lớp tồn tại trong khoa
    -- Kiểm tra định dạng mã sinh viên khoa VT: N<YY>DCVT<NNN>
    CONSTRAINT chk_student_code_format_tel CHECK (student_code REGEXP '^N[0-9]{2}DCVT[0-9]{3}$')
) COMMENT='Bảng chứa thông tin sinh viên khoa VT';

-- Bảng Lớp tín chỉ (chỉ chứa lớp tín chỉ do khoa VT quản lý)
CREATE TABLE credit_class (
    credit_class_id INT AUTO_INCREMENT NOT NULL COMMENT 'Mã lớp tín chỉ (tự động tăng)',
    academic_year CHAR(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Niên khóa',
    semester INT NOT NULL COMMENT 'Học kỳ',
    course_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã môn học (FK - tham chiếu bản sao)',
    group_number INT NOT NULL COMMENT 'Nhóm',
    lecturer_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã giảng viên (FK - tham chiếu bản sao)',
    faculty_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã khoa quản lý (luôn là VT ở DB này)',
    min_students SMALLINT NOT NULL COMMENT 'Số sinh viên tối thiểu',
    is_cancelled BOOLEAN DEFAULT FALSE COMMENT 'Hủy lớp (true/false)',
    PRIMARY KEY (credit_class_id),
    UNIQUE KEY uk_credit_class (academic_year, semester, course_code, group_number),
    -- CONSTRAINT fk_credit_class_course FOREIGN KEY (course_code) REFERENCES course_replica(course_code), -- Sẽ dùng bản sao
    -- CONSTRAINT fk_credit_class_lecturer FOREIGN KEY (lecturer_code) REFERENCES lecturer_replica(lecturer_code), -- Sẽ dùng bản sao
    CONSTRAINT chk_credit_class_faculty_tel CHECK (faculty_code = 'VT'),
    CONSTRAINT chk_credit_class_semester CHECK (semester >= 1 AND semester <= 4),
    CONSTRAINT chk_credit_class_group_number CHECK (group_number >= 1),
    CONSTRAINT chk_credit_class_min_students CHECK (min_students > 0)
) COMMENT='Bảng chứa thông tin các lớp tín chỉ do khoa VT quản lý';

-- Bảng Đăng ký (chỉ chứa đăng ký của sinh viên khoa VT)
CREATE TABLE registration (
    credit_class_id INT NOT NULL COMMENT 'Mã lớp tín chỉ (FK)',
    student_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sinh viên (FK)',
    attendance_score INT COMMENT 'Điểm chuyên cần (0-10)',
    midterm_score FLOAT COMMENT 'Điểm giữa kỳ (0-10, làm tròn 0.5)',
    final_score FLOAT COMMENT 'Điểm cuối kỳ (0-10, làm tròn 0.5)',
    is_cancelled BOOLEAN DEFAULT FALSE COMMENT 'Hủy đăng ký (true/false)',
    PRIMARY KEY (credit_class_id, student_code),
    CONSTRAINT fk_registration_credit_class FOREIGN KEY (credit_class_id) REFERENCES credit_class(credit_class_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_registration_student FOREIGN KEY (student_code) REFERENCES student(student_code)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_registration_attendance_score CHECK (attendance_score >= 0 AND attendance_score <= 10),
    CONSTRAINT chk_registration_midterm_score CHECK (midterm_score >= 0 AND midterm_score <= 10),
    CONSTRAINT chk_registration_final_score CHECK (final_score >= 0 AND final_score <= 10)
) COMMENT='Bảng chứa thông tin đăng ký lớp tín chỉ của sinh viên khoa VT';

-- Lưu ý: Các bảng course_replica và lecturer_replica cần được tạo và đồng bộ.
/*
CREATE TABLE course_replica (...) COMMENT='Bản sao bảng course';
CREATE TABLE lecturer_replica (...) COMMENT='Bản sao bảng lecturer';
*/

-- Lưu ý quan trọng:
-- Các bảng courses_replica và lecturers_replica cần được tạo và đồng bộ dữ liệu
-- từ academic_db. Cơ chế đồng bộ cần được triển khai riêng.
-- Tạm thời, các FK tham chiếu đến chúng đang được comment lại.
-- Xem ví dụ cách tạo bảng replica trong faculty_it.sql

-- >>> THÊM ĐỊNH NGHĨA BẢNG REPLICA
-- Bảng Khoa (Replica)
CREATE TABLE faculty (
    faculty_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã khoa',
    faculty_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên khoa',
    PRIMARY KEY (faculty_code),
    UNIQUE (faculty_name)
) COMMENT='Bảng sao thông tin các khoa';

-- Bảng Môn học (Replica)
CREATE TABLE course (
    course_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã môn học',
    course_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên môn học',
    lecture_credits INT NOT NULL COMMENT 'Số tiết lý thuyết',
    lab_credits INT NOT NULL COMMENT 'Số tiết thực hành',
    PRIMARY KEY (course_code),
    UNIQUE (course_name)
) COMMENT='Bảng sao thông tin các môn học';

-- Bảng Giảng viên (Replica)
CREATE TABLE lecturer (
    lecturer_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã giảng viên',
    last_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Họ giảng viên',
    first_name VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên giảng viên',
    degree VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Học vị',
    academic_rank VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Học hàm',
    specialization VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Chuyên môn',
    faculty_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã khoa (FK)',
    PRIMARY KEY (lecturer_code)
    -- Không cần FK ở đây vì là bản sao, hoặc có thể tham chiếu đến faculty replica
    -- CONSTRAINT fk_lecturer_replica_faculty FOREIGN KEY (faculty_code) REFERENCES faculty(faculty_code)
) COMMENT='Bảng sao thông tin giảng viên'; 