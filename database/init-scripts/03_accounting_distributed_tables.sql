-- =========================================================================================
-- Bảng Kế Toán - Không phân mảnh (lưu trữ tập trung)
-- =========================================================================================

SET search_path TO public;

-- Bảng thông tin sinh viên cơ bản (student_basic_info) - bản sao cho phòng kế toán
CREATE TABLE student_basic_info (
    student_code VARCHAR(10) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(10) NOT NULL,
    class_code VARCHAR(10), -- Mã lớp gốc
    faculty_code VARCHAR(10) -- Mã khoa gốc
);
COMMENT ON TABLE student_basic_info IS 'Bảng chứa thông tin cơ bản của sinh viên cho phòng kế toán (bản sao)';
COMMENT ON COLUMN student_basic_info.student_code IS 'Mã sinh viên (PK)';
COMMENT ON COLUMN student_basic_info.last_name IS 'Họ sinh viên';
COMMENT ON COLUMN student_basic_info.first_name IS 'Tên sinh viên';
COMMENT ON COLUMN student_basic_info.class_code IS 'Mã lớp gốc của sinh viên';
COMMENT ON COLUMN student_basic_info.faculty_code IS 'Mã khoa gốc của sinh viên';

-- Bảng Học phí (tuition)
CREATE TABLE tuition (
    student_code VARCHAR(10) NOT NULL,
    academic_year VARCHAR(9) NOT NULL,
    semester INTEGER NOT NULL,
    tuition_fee INTEGER NOT NULL
);
COMMENT ON TABLE tuition IS 'Bảng chứa thông tin học phí phải đóng của sinh viên';
COMMENT ON COLUMN tuition.student_code IS 'Mã sinh viên (FK)';
COMMENT ON COLUMN tuition.academic_year IS 'Niên khóa';
COMMENT ON COLUMN tuition.semester IS 'Học kỳ';
COMMENT ON COLUMN tuition.tuition_fee IS 'Học phí phải đóng';

-- Bảng Chi tiết đóng học phí (tuition_payment)
CREATE TABLE tuition_payment (
    student_code VARCHAR(10) NOT NULL,
    academic_year VARCHAR(9) NOT NULL,
    semester INTEGER NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE NOT NULL,
    amount_paid INTEGER NOT NULL
);
COMMENT ON TABLE tuition_payment IS 'Bảng chi tiết các lần đóng học phí của sinh viên';
COMMENT ON COLUMN tuition_payment.student_code IS 'Mã sinh viên (FK)';
COMMENT ON COLUMN tuition_payment.academic_year IS 'Niên khóa (FK)';
COMMENT ON COLUMN tuition_payment.semester IS 'Học kỳ (FK)';
COMMENT ON COLUMN tuition_payment.payment_date IS 'Ngày đóng tiền';
COMMENT ON COLUMN tuition_payment.amount_paid IS 'Số tiền đã đóng';

-- =========================================================================================
-- Định nghĩa các ràng buộc (Constraints)
-- =========================================================================================

-- Ràng buộc cho bảng student_basic_info
ALTER TABLE student_basic_info
    ADD CONSTRAINT pk_student_basic_info PRIMARY KEY (student_code);

-- Ràng buộc cho bảng tuition
ALTER TABLE tuition
    ADD CONSTRAINT pk_tuition PRIMARY KEY (student_code, academic_year, semester);
ALTER TABLE tuition
    ADD CONSTRAINT fk_tuition_student FOREIGN KEY (student_code) REFERENCES student_basic_info(student_code);
ALTER TABLE tuition
    ADD CONSTRAINT chk_tuition_semester CHECK (semester >= 1 AND semester <= 4);
ALTER TABLE tuition
    ADD CONSTRAINT chk_tuition_fee CHECK (tuition_fee > 0);

-- Ràng buộc cho bảng tuition_payment
ALTER TABLE tuition_payment
    ADD CONSTRAINT pk_tuition_payment PRIMARY KEY (student_code, academic_year, semester, payment_date);
ALTER TABLE tuition_payment
    ADD CONSTRAINT fk_payment_tuition FOREIGN KEY (student_code, academic_year, semester) REFERENCES tuition(student_code, academic_year, semester);
ALTER TABLE tuition_payment
    ADD CONSTRAINT chk_tuition_payment_amount_paid CHECK (amount_paid > 0);

-- Không sử dụng create_distributed_table vì muốn lưu trữ tập trung
-- Dữ liệu này sẽ được lưu trữ trên coordinator node mà không phân mảnh
-- SELECT create_distributed_table('student_basic_info', 'student_code');
-- SELECT create_distributed_table('tuition', 'student_code', colocate_with => 'student_basic_info');
-- SELECT create_distributed_table('tuition_payment', 'student_code', colocate_with => 'student_basic_info'); 