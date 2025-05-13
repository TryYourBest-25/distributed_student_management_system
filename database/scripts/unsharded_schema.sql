-- Schema cho các bảng không phân mảnh (Unsharded Tables)
-- Chạy trên DB vật lý vt_unsharded

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

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
    PRIMARY KEY (lecturer_code)
    -- FK này trỏ đến bảng faculty (cũng unsharded).
    -- Có thể giữ lại, nhưng để nhất quán, nên xử lý ở tầng ứng dụng.
    -- CONSTRAINT fk_lecturer_faculty FOREIGN KEY (faculty_code) REFERENCES faculty(faculty_code) ON UPDATE CASCADE ON DELETE RESTRICT
) COMMENT='Bảng chứa thông tin giảng viên';

-- Bảng Người dùng (Tài khoản đăng nhập)
CREATE TABLE user (
    user_id INT AUTO_INCREMENT NOT NULL COMMENT 'ID người dùng (tự động tăng)',
    username VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên đăng nhập (ví dụ: mã GV, mã SV, mã nhân viên)',
    password_hash VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mật khẩu đã được hash',
    full_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Họ tên đầy đủ',
    email VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci UNIQUE COMMENT 'Địa chỉ email (tùy chọn)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Tài khoản có đang hoạt động không?',
    PRIMARY KEY (user_id),
    UNIQUE (username)
) COMMENT='Bảng chứa thông tin tài khoản người dùng';

-- Bảng Vai trò (Roles)
CREATE TABLE role (
    role_id INT AUTO_INCREMENT NOT NULL COMMENT 'ID vai trò (tự động tăng)',
    role_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên vai trò (ví dụ: PGV, KHOA, SV, PKT)',
    description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả vai trò',
    PRIMARY KEY (role_id),
    UNIQUE (role_name)
) COMMENT='Bảng định nghĩa các vai trò trong hệ thống';

-- Bảng Phân quyền Người dùng - Vai trò (Many-to-Many)
CREATE TABLE user_role (
    user_id INT NOT NULL COMMENT 'ID người dùng (FK)',
    role_id INT NOT NULL COMMENT 'ID vai trò (FK)',
    PRIMARY KEY (user_id, role_id),
    -- Các FK này đều trỏ đến bảng unsharded khác.
    -- Có thể giữ lại, nhưng nên xử lý ở tầng ứng dụng.
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(role_id) ON UPDATE CASCADE ON DELETE CASCADE
) COMMENT='Bảng liên kết người dùng với vai trò của họ';

-- Thêm các vai trò mặc định
INSERT INTO role (role_name, description) VALUES
('PGV', 'Phòng giáo vụ - Quản lý chung'),
('KHOA', 'Giảng viên/Nhân viên khoa - Quản lý phạm vi khoa'),
('SV', 'Sinh viên - Đăng ký tín chỉ, xem điểm'),
('PKT', 'Phòng kế toán - Quản lý học phí');

-- Bảng Lookup cho Vindex makhoa_lookup_vdx
CREATE TABLE makhoa_keyspace_id_map (
    faculty_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Giá trị sharding key (từ bảng faculty)',
    keyspace_id VARBINARY(10) NOT NULL COMMENT 'Keyspace ID tương ứng do Vitess quản lý',
    PRIMARY KEY (faculty_code)
) COMMENT='Bảng ánh xạ MAKHOA sang Keyspace ID cho Vitess Vindex';

-- Bảng Học phí (Unsharded)
CREATE TABLE tuition (
    student_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sinh viên (FK logic - sharded)',
    academic_year CHAR(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Niên khóa',
    semester INT NOT NULL COMMENT 'Học kỳ',
    tuition_fee INT NOT NULL COMMENT 'Học phí phải đóng',
    PRIMARY KEY (student_code, academic_year, semester),
    CONSTRAINT chk_tuition_semester CHECK (semester >= 1 AND semester <= 4),
    CONSTRAINT chk_tuition_fee CHECK (tuition_fee > 0)
    -- FK đến student (sharded) bị loại bỏ. Xử lý ở tầng ứng dụng.
) COMMENT='Bảng chứa thông tin học phí phải đóng của sinh viên (Unsharded)';

-- Bảng Chi tiết đóng học phí (Unsharded)
CREATE TABLE tuition_payment (
    student_code CHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sinh viên (FK logic - sharded)',
    academic_year CHAR(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Niên khóa',
    semester INT NOT NULL COMMENT 'Học kỳ',
    payment_date DATE DEFAULT (CURRENT_DATE) NOT NULL COMMENT 'Ngày đóng tiền',
    amount_paid INT NOT NULL COMMENT 'Số tiền đã đóng',
    PRIMARY KEY (student_code, academic_year, semester, payment_date),
    CONSTRAINT chk_tuition_payment_amount_paid CHECK (amount_paid > 0)
    -- FK đến student (sharded) bị loại bỏ.
    -- FK đến tuition (unsharded) có thể giữ nếu muốn, nhưng để nhất quán -> bỏ.
    -- CONSTRAINT fk_payment_tuition FOREIGN KEY (student_code, academic_year, semester) REFERENCES tuition(student_code, academic_year, semester)
) COMMENT='Bảng chi tiết các lần đóng học phí của sinh viên (Unsharded)'; 