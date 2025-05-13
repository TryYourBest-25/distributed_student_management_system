-- Dùng UTF-8 để hỗ trợ tiếng Việt
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS academic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE academic_db;

-- Bảng Khoa
CREATE TABLE faculty (
    faculty_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã khoa',
    faculty_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên khoa',
    PRIMARY KEY (faculty_code),
    UNIQUE (faculty_name)
) COMMENT='Bảng chứa thông tin các khoa';

-- Bảng Môn học
CREATE TABLE course (
    course_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã môn học',
    course_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên môn học',
    lecture_credit INT NOT NULL COMMENT 'Số tiết lý thuyết',
    lab_credit INT NOT NULL COMMENT 'Số tiết thực hành',
    PRIMARY KEY (course_code),
    UNIQUE (course_name)
) COMMENT='Bảng chứa thông tin các môn học';

-- Bảng Giảng viên
CREATE TABLE lecturer (
    lecturer_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã giảng viên',
    last_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Họ giảng viên',
    first_name VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên giảng viên',
    degree VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Học vị',
    academic_rank VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Học hàm',
    specialization VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Chuyên môn',
    faculty_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã khoa (FK)',
    PRIMARY KEY (lecturer_code),
    CONSTRAINT fk_lecturer_faculty FOREIGN KEY (faculty_code) REFERENCES faculty(faculty_code)
        ON UPDATE CASCADE ON DELETE RESTRICT -- Giảng viên phải thuộc về một khoa tồn tại
) COMMENT='Bảng chứa thông tin giảng viên'; 