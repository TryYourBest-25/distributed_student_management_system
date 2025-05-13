# Hệ thống Quản lý Điểm Sinh viên Phân tán

Hệ thống quản lý điểm sinh viên phân tán sử dụng MySQL Galera Cluster cho môn Cơ sở dữ liệu phân tán.

## Kiến trúc hệ thống

Hệ thống sử dụng kiến trúc Microservices với 4 node MySQL Galera Cluster:

1. **mysql-node1**: Lưu trữ dữ liệu trung tâm (center_db)
   - Bảng: department, course, lecturer, users

2. **mysql-node2**: Lưu trữ dữ liệu khoa CNTT (department_cntt_db)
   - Bảng: class, student, credit_class, registration
   - Bản sao: course, lecturer

3. **mysql-node3**: Lưu trữ dữ liệu khoa VT (department_vt_db)
   - Bảng: class, student, credit_class, registration
   - Bản sao: course, lecturer

4. **mysql-node4**: Lưu trữ dữ liệu phòng kế toán (accounting_db)
   - Bảng: student_info, tuition_fee, tuition_payment_detail

## Bảng dữ liệu

Bảng tiếng Anh tương ứng với bảng tiếng Việt:

| Tiếng Anh          | Tiếng Việt      |
|--------------------|-----------------|
| department         | Khoa            |
| course             | Monhoc          |
| lecturer           | Giangvien       |
| class              | Lop             |
| student            | Sinhvien        |
| credit_class       | Loptinchi       |
| registration       | Dangky          |
| tuition_fee        | HocPhi          |
| tuition_payment_detail | CT_DongHocPhi |

## Cơ chế đồng bộ dữ liệu

Hệ thống sử dụng MySQL Federated Engine để đồng bộ dữ liệu giữa các server:

1. **Federated Tables**: Tạo bảng trên một server có thể truy cập dữ liệu từ server khác
   - Ví dụ: `course_cntt` trên server center kết nối đến `course` trên server CNTT

2. **Triggers**: Kích hoạt đồng bộ dữ liệu khi có thay đổi
   - Đồng bộ giảng viên từ center -> khoa
   - Đồng bộ môn học từ center -> khoa
   - Đồng bộ sinh viên từ khoa -> kế toán

3. **Distributed Views**: Tạo các view tổng hợp dữ liệu từ nhiều server
   - Báo cáo điểm sinh viên theo lớp tín chỉ
   - Báo cáo tình trạng đóng học phí

4. **Stored Procedures**: Xử lý giao tác phân tán
   - Đăng ký lớp tín chỉ
   - Nhập điểm
   - Đóng học phí

## Cách triển khai

### 1. Cài đặt môi trường

Yêu cầu hệ thống:
- Docker và Docker Compose
- Bash shell

### 2. Khởi tạo hệ thống

```bash
# Tạo thư mục cấu hình và script
mkdir -p config
mkdir -p init-scripts

# Cấp quyền thực thi cho script bootstrap
chmod +x init-scripts/bootstrap.sh

# Khởi động container
docker-compose up -d

# Khởi tạo Galera Cluster và cơ sở dữ liệu
./init-scripts/bootstrap.sh
```

### 3. Kiểm tra trạng thái Galera Cluster

```bash
docker exec -it mysql-node1 mysql -u root -prootpassword -e "SHOW STATUS LIKE 'wsrep_cluster%'"
```

### 4. Kiểm tra các bảng Federated

```bash
# Kiểm tra các bảng federated trên center_db
docker exec -it mysql-node1 mysql -u root -prootpassword center_db -e "SHOW TABLES LIKE '%_cntt%'"

# Kiểm tra các bảng federated trên department_cntt_db
docker exec -it mysql-node2 mysql -u root -prootpassword department_cntt_db -e "SHOW TABLES LIKE '%_acc%'"
```

### 5. Truy cập cơ sở dữ liệu

- **Center DB**: `mysql -h 127.0.0.1 -P 3307 -u root -prootpassword center_db`
- **CNTT DB**: `mysql -h 127.0.0.1 -P 3308 -u root -prootpassword department_cntt_db`
- **VT DB**: `mysql -h 127.0.0.1 -P 3309 -u root -prootpassword department_vt_db`
- **Accounting DB**: `mysql -h 127.0.0.1 -P 3310 -u root -prootpassword accounting_db`

### 6. Sử dụng Stored Procedures

#### Đăng ký lớp tín chỉ:
```sql
SET @result = 0;
SET @message = '';
CALL sp_register_credit_class('SV001', 1, @result, @message);
SELECT @result, @message;
```

#### Nhập điểm:
```sql
SET @result = 0;
SET @message = '';
CALL sp_update_student_grades(1, 'SV001', 8, 7.5, 8.0, @result, @message);
SELECT @result, @message;
```

#### Đóng học phí:
```sql
SET @result = 0;
SET @message = '';
CALL sp_pay_tuition_fee('SV001', '2023-2024', 1, 5000000, @result, @message);
SELECT @result, @message;
```

## Người phát triển

- [Tên của bạn]

## Giấy phép

Dự án này được phân phối dưới giấy phép MIT. 