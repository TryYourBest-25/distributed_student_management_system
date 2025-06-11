-- =========================================================================================
-- Bảng Phân Tán theo faculty_code (Mã Khoa)
-- =========================================================================================

SET search_path TO public;

-- Bảng Lớp học (class)
CREATE TABLE class (
    class_code VARCHAR(10) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    academic_year_code VARCHAR(9) NOT NULL, 
    faculty_code VARCHAR(10) NOT NULL -- Cột phân phối
);
COMMENT ON TABLE class IS 'Bảng chứa thông tin các lớp học';
COMMENT ON COLUMN class.class_code IS 'Mã lớp';
COMMENT ON COLUMN class.class_name IS 'Tên lớp';
COMMENT ON COLUMN class.academic_year_code IS 'Khóa học (ví dụ K60, D2020)';
COMMENT ON COLUMN class.faculty_code IS 'Mã khoa (FK và cột phân phối)';

-- Bảng Sinh viên (student)
CREATE TABLE student (
    student_code VARCHAR(10) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(10) NOT NULL,
    class_code VARCHAR(10) NOT NULL, 
    gender BOOLEAN DEFAULT FALSE,
    birth_date DATE,
    address VARCHAR(100),
    is_suspended BOOLEAN DEFAULT FALSE,
    faculty_code VARCHAR(10) NOT NULL
);
COMMENT ON TABLE student IS 'Bảng chứa thông tin sinh viên';
COMMENT ON COLUMN student.student_code IS 'Mã sinh viên';
COMMENT ON COLUMN student.last_name IS 'Họ sinh viên';
COMMENT ON COLUMN student.first_name IS 'Tên sinh viên';
COMMENT ON COLUMN student.class_code IS 'Mã lớp';
COMMENT ON COLUMN student.gender IS 'Phái (FALSE: Nam, TRUE: Nữ)';
COMMENT ON COLUMN student.birth_date IS 'Ngày sinh';
COMMENT ON COLUMN student.address IS 'Địa chỉ';
COMMENT ON COLUMN student.is_suspended IS 'Đã nghỉ học (TRUE: nghỉ, FALSE: còn học)';
COMMENT ON COLUMN student.faculty_code IS 'Mã khoa của sinh viên (cột phân phối)';

-- Bảng Lớp tín chỉ (credit_class)
CREATE TABLE credit_class (
    credit_class_id SERIAL NOT NULL,
    academic_year VARCHAR(9) NOT NULL,
    semester INTEGER NOT NULL,
    course_code VARCHAR(10) NOT NULL,
    group_number INTEGER NOT NULL,
    lecturer_code VARCHAR(10) NOT NULL,
    faculty_code VARCHAR(10) NOT NULL, -- Cột phân phối
    min_student SMALLINT NOT NULL DEFAULT 1,
    is_cancelled BOOLEAN DEFAULT FALSE
);
COMMENT ON TABLE credit_class IS 'Bảng chứa thông tin các lớp tín chỉ';
COMMENT ON COLUMN credit_class.credit_class_id IS 'Mã lớp tín chỉ (tự động tăng)';
COMMENT ON COLUMN credit_class.academic_year IS 'Niên khóa (ví dụ: 2023-2024)';
COMMENT ON COLUMN credit_class.semester IS 'Học kỳ';
COMMENT ON COLUMN credit_class.course_code IS 'Mã môn học (FK)';
COMMENT ON COLUMN credit_class.group_number IS 'Nhóm';
COMMENT ON COLUMN credit_class.lecturer_code IS 'Mã giảng viên (FK)';
COMMENT ON COLUMN credit_class.faculty_code IS 'Mã khoa quản lý lớp tín chỉ (FK và cột phân phối)';
COMMENT ON COLUMN credit_class.min_student IS 'Số sinh viên tối thiểu';
COMMENT ON COLUMN credit_class.is_cancelled IS 'Lớp đã bị hủy (TRUE: hủy)';

-- Bảng Đăng ký (registration)
CREATE TABLE registration (
    credit_class_id INTEGER NOT NULL,
    student_code VARCHAR(10) NOT NULL,
    attendance_score REAL,
    midterm_score REAL,
    final_score REAL,
    is_cancelled BOOLEAN DEFAULT FALSE,
    faculty_code VARCHAR(10) NOT NULL -- Cột phân phối
);
COMMENT ON TABLE registration IS 'Bảng chứa thông tin đăng ký lớp tín chỉ của sinh viên';
COMMENT ON COLUMN registration.credit_class_id IS 'Mã lớp tín chỉ (phần của PK)';
COMMENT ON COLUMN registration.student_code IS 'Mã sinh viên (phần của PK)';
COMMENT ON COLUMN registration.attendance_score IS 'Điểm chuyên cần (0-10)';
COMMENT ON COLUMN registration.midterm_score IS 'Điểm giữa kỳ (0-10)';
COMMENT ON COLUMN registration.final_score IS 'Điểm cuối kỳ (0-10)';
COMMENT ON COLUMN registration.is_cancelled IS 'Đăng ký đã bị hủy (TRUE: hủy)';
COMMENT ON COLUMN registration.faculty_code IS 'Mã khoa (cột phân phối, phần của PK)';

-- =========================================================================================
-- Định nghĩa các ràng buộc (Constraints)
-- =========================================================================================

-- Ràng buộc cho bảng class
ALTER TABLE class
    ADD CONSTRAINT pk_class PRIMARY KEY (faculty_code, class_code);
ALTER TABLE class
    ADD CONSTRAINT fk_class_faculty FOREIGN KEY (faculty_code) REFERENCES faculty(faculty_code)  ON DELETE CASCADE;
ALTER TABLE class
    ADD CONSTRAINT fk_class_global_code FOREIGN KEY (class_code, class_name) REFERENCES global_class_code(class_code, class_name)  ON DELETE CASCADE;

-- Ràng buộc cho bảng student
ALTER TABLE student
    ADD CONSTRAINT pk_student PRIMARY KEY (faculty_code, student_code);
ALTER TABLE student
    ADD CONSTRAINT fk_student_class FOREIGN KEY (faculty_code, class_code) REFERENCES class(faculty_code, class_code)  ON DELETE CASCADE;
ALTER TABLE student
    ADD CONSTRAINT fk_student_faculty_dist FOREIGN KEY (faculty_code) REFERENCES faculty(faculty_code)  ON DELETE CASCADE;
ALTER TABLE student
    ADD CONSTRAINT fk_student_global_code FOREIGN KEY (student_code) REFERENCES global_student_code(student_code) ON UPDATE CASCADE ON DELETE CASCADE;

-- Ràng buộc cho bảng credit_class
ALTER TABLE credit_class
    ADD CONSTRAINT pk_credit_class PRIMARY KEY (faculty_code, credit_class_id);
ALTER TABLE credit_class
    ADD CONSTRAINT uq_credit_class UNIQUE (academic_year, semester, course_code, group_number, faculty_code);
ALTER TABLE credit_class
    ADD CONSTRAINT fk_credit_class_course FOREIGN KEY (course_code) REFERENCES course(course_code)  ON DELETE CASCADE;
ALTER TABLE credit_class
    ADD CONSTRAINT fk_credit_class_lecturer FOREIGN KEY (lecturer_code) REFERENCES lecturer(lecturer_code)  ON DELETE RESTRICT;
ALTER TABLE credit_class
    ADD CONSTRAINT fk_credit_class_faculty FOREIGN KEY (faculty_code) REFERENCES faculty(faculty_code)  ON DELETE CASCADE;
ALTER TABLE credit_class
    ADD CONSTRAINT chk_credit_class_semester CHECK (semester >= 1 AND semester <= 4);
ALTER TABLE credit_class
    ADD CONSTRAINT chk_credit_class_group CHECK (group_number >= 1);
ALTER TABLE credit_class
    ADD CONSTRAINT chk_credit_class_min_student CHECK (min_student > 0);

-- Ràng buộc cho bảng registration
ALTER TABLE registration
    ADD CONSTRAINT pk_registration PRIMARY KEY (faculty_code, credit_class_id, student_code);
ALTER TABLE registration
    ADD CONSTRAINT fk_registration_credit_class FOREIGN KEY (faculty_code, credit_class_id) REFERENCES credit_class(faculty_code, credit_class_id)  ON DELETE CASCADE;
ALTER TABLE registration
    ADD CONSTRAINT fk_registration_student FOREIGN KEY (faculty_code, student_code) REFERENCES student(faculty_code, student_code)  ON DELETE CASCADE;
ALTER TABLE registration
    ADD CONSTRAINT fk_registration_faculty_dist FOREIGN KEY (faculty_code) REFERENCES faculty(faculty_code)  ON DELETE CASCADE;
ALTER TABLE registration
    ADD CONSTRAINT chk_attendance_score CHECK (attendance_score IS NULL OR (attendance_score >= 0 AND attendance_score <= 10));
ALTER TABLE registration
    ADD CONSTRAINT chk_midterm_score CHECK (midterm_score IS NULL OR (midterm_score >= 0 AND midterm_score <= 10));
ALTER TABLE registration
    ADD CONSTRAINT chk_final_score CHECK (final_score IS NULL OR (final_score >= 0 AND final_score <= 10));

-- =========================================================================================
-- Tạo các bảng phân tán (Distributed Tables)
-- =========================================================================================

SELECT create_distributed_table('class', 'faculty_code');
SELECT create_distributed_table('student', 'faculty_code', colocate_with => 'class');
SELECT create_distributed_table('credit_class', 'faculty_code');
SELECT create_distributed_table('registration', 'faculty_code', colocate_with => 'student'); 