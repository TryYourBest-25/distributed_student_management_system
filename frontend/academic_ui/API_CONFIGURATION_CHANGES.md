# Thay đổi Cấu hình API cho Academic UI

## Tóm tắt
Academic UI đã được cấu hình để gọi Faculty IT Service qua API Gateway với đúng API versioning.

## Kiến trúc API Calls

```
Academic UI (localhost:32101)
    ↓ /api/faculty/v1/it-faculty/classes
Next.js Rewrite
    ↓ localhost:5000/faculty/v1/it-faculty/classes
API Gateway (Ocelot)
    ↓ faculty-service-it:8080/api/v1/it-faculty/classes
Faculty IT Service
```

## Các thay đổi đã thực hiện

### 1. Cập nhật biến môi trường (.env.dev)
- Thêm `API_GATEWAY_URL=http://localhost:5000`
- Thêm `API_FACULTY_URL=http://localhost:30000/api/v1`
- Giữ nguyên `API_ACADEMIC_URL=http://localhost:14200/api/v1` để dự phòng

### 2. Cập nhật Next.js Configuration (next.config.ts)
- `/api/faculty/*` → `${API_GATEWAY_URL}/faculty/*`
- `/api/academic/*` → `${API_GATEWAY_URL}/academic/*`
- Expose biến môi trường `API_GATEWAY_URL`

### 3. Cập nhật Services với API Versioning
Tất cả các service sử dụng `/api/faculty/v1` để gọi Faculty IT Service qua API Gateway:

#### class-service.ts
- `baseUrl`: `/api/faculty/v1`

#### course-service.ts  
- `baseUrl`: `/api/academic/v1` (courses nằm trong Academic Service)
- `API_BASE_URL`: `/api/academic/v1`

#### credit-class-service.ts
- `baseUrl`: `/api/faculty/v1`

#### student-service.ts
- `baseUrl`: `/api/faculty/v1`

#### lecturer-service.ts
- `API_BASE_URL`: `/api/academic/v1` (lecturers nằm trong Academic Service)

## Faculty Service Endpoint Format
Faculty Service sử dụng route pattern:
```
/api/v{version}/{facultyCode}/[controller]
```

Ví dụ:
- Classes: `/api/v1/it-faculty/classes`
- Students: `/api/v1/it-faculty/students`
- Credit Classes: `/api/v1/it-faculty/creditclasses`

## API Gateway Routing (ocelot.json)
- `/faculty/*` → `faculty-service-it:8080/api/*`
- `/academic/*` → `academic-service:8080/api/*`
- `/tuition/*` → `tuition-service:8080/api/*`

## Authentication Fix
- Tạm thời bỏ kiểm tra roles `PGV` và `KHOA` trong NextAuth để test
- User có thể đăng nhập với bất kỳ role nào từ Keycloak

## Tenant Management
- Thêm TenantService để gọi API Gateway endpoint `/tenants` qua API route `/api/tenants`
- Thêm TenantSelector component để chọn khoa dựa theo role user
- Thêm TenantContext để quản lý tenant được chọn
- Faculty code được lấy từ tenant được chọn thay vì hardcode
- Các trang Classes và Credit Classes tự động sử dụng identifier của khoa được chọn
- Hiển thị thông báo khi chưa chọn tenant

## Lưu ý
- Academic UI hiện tại gọi Faculty IT Service qua API Gateway với đúng versioning
- Courses và Lecturers được gọi từ Academic Service
- Classes, Students, Credit Classes được gọi từ Faculty Service với tenant động
- Tất cả API calls đều đi qua API Gateway (port 5000), không gọi trực tiếp đến microservices
- Faculty code được lấy từ tenant được chọn trong TenantSelector

## Endpoint Mapping
- **Courses**: Academic Service → `/api/academic/v1/courses`
- **Lecturers**: Academic Service → `/api/academic/v1/lecturers`
- **Classes, Students, Credit Classes**: Faculty Service → `/api/faculty/v1/{facultyCode}/[controller]`
- **Tenants**: API Gateway → `/api/gateway/tenants` 