-- Dùng UTF-8 để hỗ trợ tiếng Việt
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auth_db;

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
    PRIMARY KEY (user_id, role_id), -- Một người dùng có thể có nhiều vai trò
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE, -- Nếu user bị xóa, bản ghi phân quyền cũng xóa
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(role_id)
        ON UPDATE CASCADE ON DELETE CASCADE -- Nếu role bị xóa, bản ghi phân quyền cũng xóa
) COMMENT='Bảng liên kết người dùng với vai trò của họ';

-- -- (Tùy chọn) Bảng Quyền hạn (Permissions) - nếu cần phân quyền chi tiết hơn vai trò
-- CREATE TABLE permission (
--     permission_id INT AUTO_INCREMENT NOT NULL COMMENT 'ID quyền hạn',
--     permission_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên quyền hạn (ví dụ: view_grades, edit_tuition)',
--     description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả quyền hạn',
--     PRIMARY KEY (permission_id),
--     UNIQUE KEY uk_permission_name (permission_name)
-- ) COMMENT='Bảng định nghĩa các quyền hạn chi tiết (tùy chọn)';

-- -- Bảng nối Vai trò - Quyền hạn (Quan hệ nhiều-nhiều, tùy chọn)
-- CREATE TABLE role_permission (
--     role_id INT NOT NULL COMMENT 'FK đến roles',
--     permission_id INT NOT NULL COMMENT 'FK đến permissions',
--     PRIMARY KEY (role_id, permission_id),
--     CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE,
--     CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES permission(permission_id) ON DELETE CASCADE
-- ) COMMENT='Bảng liên kết vai trò và quyền hạn (tùy chọn)';

-- Thêm các vai trò mặc định
INSERT INTO role (role_name, description) VALUES
('PGV', 'Phòng giáo vụ - Quản lý chung'),
('KHOA', 'Giảng viên/Nhân viên khoa - Quản lý phạm vi khoa'),
('SV', 'Sinh viên - Đăng ký tín chỉ, xem điểm'),
('PKT', 'Phòng kế toán - Quản lý học phí'); 