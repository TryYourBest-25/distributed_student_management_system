-- Schema cho các bảng phân mảnh (Sharded Tables)
-- Chạy trên các DB vật lý của shard (vt_shard_cntt, vt_shard_vt)

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Bảng Lớp học
CREATE TABLE class (
    class_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã lớp',
    class_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên lớp',
    school_year CHAR(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Khóa học',
    -- Cột sharding key
    faculty_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã khoa (Sharding Key)',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo bản ghi',
    last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày cập nhật bản ghi cuối cùng',
    PRIMARY KEY (class_code)
    -- UNIQUE (class_name) -- Bỏ UNIQUE nếu tên lớp có thể trùng giữa các khoa
    -- FK đến faculty (unsharded) bị loại bỏ. Logic kiểm tra faculty_code tồn tại nên ở tầng ứng dụng.
) COMMENT='Bảng chứa thông tin các lớp học, sharded theo faculty_code';

-- Bảng Sinh viên
CREATE TABLE student (
    student_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sinh viên',
    last_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Họ sinh viên',
    first_name VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên sinh viên',
    class_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã lớp (FK logic)',
    -- Cột sharding key (cần đảm bảo MAKHOA của sinh viên luôn khớp với MAKHOA của lớp)
    faculty_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã khoa (Sharding Key)',
    gender BOOLEAN DEFAULT FALSE COMMENT 'Phái (false: Nam, true: Nữ)',
    birth_date DATE COMMENT 'Ngày sinh',
    address VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Địa chỉ',
    is_suspended BOOLEAN DEFAULT FALSE COMMENT 'Đã nghỉ học (true/false)',
    password VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT 'Mật khẩu (nên được hash) - Cân nhắc chuyển sang bảng user',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo bản ghi',
    last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày cập nhật bản ghi cuối cùng',
    PRIMARY KEY (student_code)
    -- FK đến class (sharded). Do cả 2 cùng shard key faculty_code, FK này có thể giữ.
    -- Tuy nhiên, để đơn giản và nhất quán, nên xử lý ở tầng ứng dụng.
    -- CONSTRAINT fk_student_class FOREIGN KEY (class_code) REFERENCES class(class_code) ON UPDATE CASCADE ON DELETE RESTRICT
) COMMENT='Bảng chứa thông tin sinh viên, sharded theo faculty_code';

-- Bảng Lớp tín chỉ
CREATE TABLE credit_class (
    credit_class_id INT AUTO_INCREMENT NOT NULL COMMENT 'Mã lớp tín chỉ (tự động tăng)',
    academic_year CHAR(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Niên khóa',
    semester INT NOT NULL COMMENT 'Học kỳ',
    course_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã môn học (FK logic - unsharded)',
    group_number INT NOT NULL COMMENT 'Nhóm',
    lecturer_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã giảng viên (FK logic - unsharded)',
    -- Cột sharding key
    faculty_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã khoa quản lý (Sharding Key)',
    min_students SMALLINT NOT NULL COMMENT 'Số sinh viên tối thiểu',
    is_cancelled BOOLEAN DEFAULT FALSE COMMENT 'Hủy lớp (true/false)',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo bản ghi',
    last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày cập nhật bản ghi cuối cùng',
    PRIMARY KEY (credit_class_id),
    UNIQUE KEY uk_credit_class (academic_year, semester, course_code, group_number) -- UNIQUE này cần đảm bảo nghiệp vụ không trùng cross-shard
    -- FK đến course (unsharded) bị loại bỏ.
    -- FK đến lecturer (unsharded) bị loại bỏ.
    -- FK đến faculty (unsharded) bị loại bỏ.
) COMMENT='Bảng chứa thông tin các lớp tín chỉ, sharded theo faculty_code';

-- Bảng Đăng ký
CREATE TABLE registration (
    credit_class_id INT NOT NULL COMMENT 'Mã lớp tín chỉ (FK logic)',
    student_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sinh viên (FK logic)',
    -- Cột sharding key (cần lấy từ sinh viên hoặc lớp tín chỉ)
    faculty_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã khoa (Sharding Key)',
    attendance_score INT COMMENT 'Điểm chuyên cần (0-10)',
    midterm_score FLOAT COMMENT 'Điểm giữa kỳ (0-10, làm tròn 0.5)',
    final_score FLOAT COMMENT 'Điểm cuối kỳ (0-10, làm tròn 0.5)',
    is_cancelled BOOLEAN DEFAULT FALSE COMMENT 'Hủy đăng ký (true/false)',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo bản ghi',
    last_modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày cập nhật bản ghi cuối cùng',
    PRIMARY KEY (credit_class_id, student_code)
    -- FK đến credit_class (sharded, cùng shard) -> Có thể giữ
    -- CONSTRAINT fk_registration_credit_class FOREIGN KEY (credit_class_id) REFERENCES credit_class(credit_class_id) ON UPDATE CASCADE ON DELETE CASCADE,
    -- FK đến student (sharded, cùng shard) -> Có thể giữ
    -- CONSTRAINT fk_registration_student FOREIGN KEY (student_code) REFERENCES student(student_code) ON UPDATE CASCADE ON DELETE CASCADE
) COMMENT='Bảng chứa thông tin đăng ký lớp tín chỉ, sharded theo faculty_code';

-- Bảng Học phí (ĐÃ DI CHUYỂN SANG UNSHARDED)
-- CREATE TABLE tuition (...)

-- Bảng Chi tiết đóng học phí (ĐÃ DI CHUYỂN SANG UNSHARDED)
-- CREATE TABLE tuition_payment (...) 