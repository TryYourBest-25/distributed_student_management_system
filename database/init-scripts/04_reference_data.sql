-- Dữ liệu tham chiếu ban đầu

SET search_path TO public;
BEGIN;
-- Thêm các vai trò mặc định cho bảng role
INSERT INTO role (role_name, description) VALUES
('PGV', 'Phòng giáo vụ - Quản lý chung'),
('KHOA', 'Giảng viên/Nhân viên khoa - Quản lý phạm vi khoa'),
('SV', 'Sinh viên - Đăng ký tín chỉ, xem điểm'),
('PKT', 'Phòng kế toán - Quản lý học phí')
ON CONFLICT (role_name) DO NOTHING; -- Tránh lỗi nếu chạy lại script 

-- Thêm dữ liệu tham chiếu cho bảng faculty
INSERT INTO faculty (faculty_code, faculty_name) VALUES
('CNTT', 'Khoa Công nghệ thông tin'),
('DTVT', 'Khoa Điện tử viễn thông')
ON CONFLICT (faculty_code) DO NOTHING; -- Tránh lỗi nếu chạy lại script
COMMIT;