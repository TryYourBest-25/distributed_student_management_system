-- Dữ liệu tham chiếu ban đầu

SET search_path TO public;
BEGIN;
-- Thêm dữ liệu tham chiếu cho bảng faculty
INSERT INTO faculty (faculty_code, faculty_name) VALUES
('CNTT', 'Khoa Công nghệ thông tin'),
('DTVT', 'Khoa Điện tử viễn thông')
ON CONFLICT (faculty_code) DO NOTHING; -- Tránh lỗi nếu chạy lại script
COMMIT;