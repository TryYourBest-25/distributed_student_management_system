-- Dùng UTF-8 để hỗ trợ tiếng Việt
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS tuition_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tuition_db;

-- Bảng Học phí (chứa học phí của tất cả sinh viên)
CREATE TABLE tuition (
    student_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sinh viên (FK - tham chiếu bản sao)',
    academic_year CHAR(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Niên khóa',
    semester INT NOT NULL COMMENT 'Học kỳ',
    tuition_fee INT NOT NULL COMMENT 'Học phí phải đóng',
    PRIMARY KEY (student_code, academic_year, semester),
    -- CONSTRAINT fk_tuition_student_info FOREIGN KEY (student_code) REFERENCES student_info(student_code), -- Tham chiếu bản sao thông tin SV
    CONSTRAINT chk_tuition_semester CHECK (semester >= 1 AND semester <= 4),
    CONSTRAINT chk_tuition_fee CHECK (tuition_fee > 0)
) COMMENT='Bảng chứa thông tin học phí phải đóng của sinh viên';

-- Bảng Chi tiết đóng học phí
CREATE TABLE tuition_payment (
    student_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sinh viên',
    academic_year CHAR(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Niên khóa',
    semester INT NOT NULL COMMENT 'Học kỳ',
    payment_date DATE DEFAULT (CURRENT_DATE) NOT NULL COMMENT 'Ngày đóng tiền',
    amount_paid INT NOT NULL COMMENT 'Số tiền đã đóng',
    PRIMARY KEY (student_code, academic_year, semester, payment_date),
    -- Không cần FK trực tiếp tới tuition vì PK đã bao gồm các cột cần thiết.
    -- Đảm bảo logic ứng dụng khi thêm payment thì phải có record tương ứng trong tuition.
    -- CONSTRAINT fk_tuition_payment_student_info FOREIGN KEY (student_code) REFERENCES student_info(student_code), -- Tham chiếu bản sao thông tin SV
    CONSTRAINT chk_tuition_payment_amount_paid CHECK (amount_paid > 0)
) COMMENT='Bảng chi tiết các lần đóng học phí của sinh viên';

-- Bảng Thông tin cơ bản Sinh viên (Bản sao/Cache)
CREATE TABLE student_info (
    student_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sinh viên',
    last_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Họ sinh viên',
    first_name VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên sinh viên',
    class_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã lớp',
    faculty_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã khoa',
    PRIMARY KEY (student_code)
) COMMENT='Bản sao thông tin cơ bản của sinh viên từ các faculty_db';

-- Lưu ý quan trọng:
-- Bảng student_info cần được đồng bộ dữ liệu từ faculty_it_db và faculty_tel_db.
-- Cơ chế đồng bộ cần được triển khai riêng.
-- Tạm thời, các FK tham chiếu đến student_info đang được comment lại.
-- Sau khi tạo bảng student_info và có cơ chế đồng bộ, bỏ comment các FK trong tuition và tuition_payment. 