# Hướng dẫn triển khai Microservices với Docker

## 📋 Tổng quan

Dự án được triển khai với các microservice sau:

| Service | Port | Container Name | Tenant |
|---------|------|---------------|---------| 
| **API Gateway** | 5000 | `api-gateway` | - |
| **AcademicService** | 14200 | `academic-service` | - |
| **FacultyService (IT)** | 30000 | `faculty-service-it` | `IT-FACULTY` |
| **FacultyService (TEL)** | 30001 | `faculty-service-tel` | `TEL-FACULTY` |
| **TuitionService** | 14100 | `tuition-service` | - |

### 🔗 Shared Dependencies

Tất cả các microservice đều có dependency vào project `Shared` bao gồm:
- **Domain Value Objects**: `StudentCode`, `ClassCode`, `FacultyCode`, etc.
- **Common Exceptions**: `BadInputException`, `ResourceNotFoundException`, etc.
- **Infrastructure Helpers**: Logging, Database entities, etc.
- **API Models**: `PageableParamRequest`, `OrderableParamRequest`

## 🚀 Cách triển khai

### 1. Prerequisites

Đảm bảo bạn đã cài đặt:
- Docker 20.10+
- Docker Compose 2.0+

### 2. Build và chạy services

```bash
# Cấp quyền thực thi cho script
chmod +x scripts/docker-dev.sh

# Build tất cả microservices
./scripts/docker-dev.sh build

# Khởi động tất cả services
./scripts/docker-dev.sh start
```

### 3. Kiểm tra trạng thái

```bash
# Xem trạng thái tất cả services
./scripts/docker-dev.sh status

# Xem logs của service cụ thể
./scripts/docker-dev.sh logs academic-service
./scripts/docker-dev.sh logs faculty-service-it
./scripts/docker-dev.sh logs tuition-service
```

## 🔗 API Endpoints

### Thông qua API Gateway (Port 5000)

| Service | Endpoint Pattern | Example |
|---------|------------------|---------|
| **Academic** | `/academic/api/v1/*` | `http://localhost:5000/academic/api/v1/courses` |
| **Faculty** | `/faculty/api/v1/*` | `http://localhost:5000/faculty/api/v1/IT-FACULTY/classes` |
| **Tuition** | `/tuition/api/v1/*` | `http://localhost:5000/tuition/api/v1/students/SV001` |

### Trực tiếp đến Service (Development)

| Service | Direct URL | Example |
|---------|------------|---------|
| **Academic** | `http://localhost:14200` | `http://localhost:14200/api/v1/courses` |
| **Faculty IT** | `http://localhost:30000` | `http://localhost:30000/api/v1/IT-FACULTY/classes` |
| **Faculty TEL** | `http://localhost:30001` | `http://localhost:30001/api/v1/TEL-FACULTY/classes` |
| **Tuition** | `http://localhost:14100` | `http://localhost:14100/api/v1/students/SV001` |

## 📊 Database

Tất cả microservice sử dụng **Citus Distributed PostgreSQL**:
- **Coordinator**: `localhost:25000`
- **Worker 0**: `localhost:25010`
- **Worker 1**: `localhost:25011`
- **Database**: `dsmsdb`
- **Username**: `coor`
- **Password**: `coor`

## 🏗️ Kiến trúc Multi-tenant FacultyService

FacultyService được triển khai với 2 instance riêng biệt:

### Faculty Service IT
- **Container**: `faculty-service-it`
- **Port**: `30000`
- **Tenant**: `IT-FACULTY`
- **Environment Variable**: `Tenant=IT-FACULTY`

### Faculty Service TEL
- **Container**: `faculty-service-tel`
- **Port**: `30001`
- **Tenant**: `TEL-FACULTY`
- **Environment Variable**: `Tenant=TEL-FACULTY`

## 🛠️ Các lệnh hữu ích

### Quản lý services

```bash
# Restart chỉ microservices (không restart database)
./scripts/docker-dev.sh restart

# Dừng tất cả services
./scripts/docker-dev.sh stop

# Cleanup hoàn toàn (xóa containers, volumes, networks)
./scripts/docker-dev.sh cleanup
```

### Debug và monitoring

```bash
# Xem logs real-time của API Gateway
./scripts/docker-dev.sh logs api-gateway

# Xem logs của Faculty Service IT
./scripts/docker-dev.sh logs faculty-service-it

# Xem logs của Tuition Service
./scripts/docker-dev.sh logs tuition-service

# Exec vào container để debug
docker exec -it academic-service bash
docker exec -it faculty-service-it bash
docker exec -it tuition-service bash
```

### Database operations

```bash
# Kết nối đến Coordinator database
docker exec -it coordinator0 psql -U coor -d dsmsdb

# Kết nối đến Worker database
docker exec -it worker0 psql -U coor -d dsmsdb
docker exec -it worker1 psql -U coor -d dsmsdb
```

## 🔧 Cấu hình Environment Variables

Các biến môi trường quan trọng được cấu hình trong `compose-dev.yml`:

### Common cho tất cả services
```yaml
ASPNETCORE_ENVIRONMENT: Development
ASPNETCORE_URLS: http://+:8080
ConnectionStrings__DefaultConnection: Host=coordinator0;Port=5432;Database=dsmsdb;Username=coor;Password=coor
```

### Riêng cho Faculty Services
```yaml
# Faculty IT
Tenant: IT-FACULTY

# Faculty TEL  
Tenant: TEL-FACULTY
```

## 🚨 Troubleshooting

### Service không khởi động được
1. Kiểm tra logs: `./scripts/docker-dev.sh logs <service-name>`
2. Kiểm tra database đã sẵn sàng: `./scripts/docker-dev.sh status`
3. Restart service: `docker-compose -f compose-dev.yml restart <service-name>`

### Database connection issues
1. Đảm bảo Coordinator đã healthy: `docker-compose -f compose-dev.yml ps coordinator0`
2. Kiểm tra network: `docker network ls | grep dsms`
3. Test connection: `docker exec -it coordinator0 pg_isready -U coor -d dsmsdb`

### Port conflicts
Nếu gặp lỗi port đã được sử dụng, thay đổi ports trong `compose-dev.yml`:
```yaml
ports:
  - "${CUSTOM_PORT:-14200}:8080"
```

## 📝 API Testing

### Example requests thông qua API Gateway

```bash
# Lấy danh sách khóa học
curl http://localhost:5000/academic/api/v1/courses

# Lấy thông tin sinh viên
curl http://localhost:5000/tuition/api/v1/students/SV001

# Lấy danh sách lớp học IT
curl http://localhost:5000/faculty/api/v1/IT-FACULTY/classes

# Tạo học phí mới
curl -X POST http://localhost:5000/tuition/api/v1/students/SV001/tuitions \
  -H "Content-Type: application/json" \
  -H "X-Api-Version: 1.0" \
  -d '{"academicYear":"2023-2024","semester":1,"tuitionFee":5000000}'
```

### Headers quan trọng
```
X-Api-Version: 1.0
Content-Type: application/json
```

## 🔄 Development Workflow

1. **Thay đổi code** trong service
2. **Rebuild service**: `docker-compose -f compose-dev.yml build <service-name>`
3. **Restart service**: `docker-compose -f compose-dev.yml restart <service-name>`
4. **Test**: Gửi request đến API Gateway hoặc trực tiếp service

## 📈 Monitoring

### Health Check Endpoints
- API Gateway: `http://localhost:5000/health`
- Academic Service: `http://localhost:14200/health`
- Faculty Service IT: `http://localhost:30000/health`
- Faculty Service TEL: `http://localhost:30001/health`
- Tuition Service: `http://localhost:14100/health`

### Logs Locations
Logs được output ra console và có thể xem qua Docker logs:
```bash
# Theo dõi logs real-time tất cả services
docker-compose -f compose-dev.yml logs -f

# Chỉ xem logs của microservices
docker-compose -f compose-dev.yml logs -f api-gateway academic-service faculty-service-it faculty-service-tel tuition-service
``` 

## 🔗 Shared Project Dependencies

### Tổng quan
Tất cả các microservice đều có dependency vào project `Shared`, điều này ảnh hưởng đến cách build Docker containers:

### Cấu trúc Project References
```
AcademicService.Domain/  → ProjectReference: ../../Shared/
FacultyService.Domain/   → ProjectReference: ../../Shared/
TuitionService.Domain/   → ProjectReference: ../../Shared/
```

### Shared Project chứa:
- **Domain Value Objects**: `StudentCode`, `ClassCode`, `FacultyCode`, `CourseCode`, etc.
- **Common Exceptions**: `BadInputException`, `ResourceNotFoundException`, `DuplicateException`
- **Infrastructure Helpers**: Logging behaviors, Stream helpers
- **API Models**: `PageableParamRequest`, `OrderableParamRequest`
- **Database Entities**: Common entity definitions

### Docker Build Strategy

#### Build Context Configuration
Do dependency vào Shared project, build context được đặt tại `./src/`:

```yaml
# compose-dev.yml
academic-service:
  build:
    context: ./src              # ← Build context tại src level
    dockerfile: ./AcademicService/Dockerfile  # ← Dockerfile location
```

#### Dockerfile Structure
Mỗi Dockerfile được cập nhật để copy Shared project:

```dockerfile
# Copy project files for dependencies
COPY AcademicService/*.sln .
COPY AcademicService/AcademicService.Api/*.csproj ./AcademicService.Api/
COPY AcademicService/AcademicService.Application/*.csproj ./AcademicService.Application/
COPY AcademicService/AcademicService.Domain/*.csproj ./AcademicService.Domain/
COPY AcademicService/AcademicService.Infrastructure/*.csproj ./AcademicService.Infrastructure/
COPY Shared/*.csproj ./Shared/  # ← Shared project

RUN dotnet restore

# Copy source code
COPY AcademicService/ ./AcademicService/
COPY Shared/ ./Shared/  # ← Copy Shared source
```

### Troubleshooting Shared Dependencies

#### Build failures related to Shared project:
```bash
# Check if Shared project exists
ls -la src/Shared/

# Clean build cache and rebuild
docker system prune -f
./scripts/docker-dev.sh build --no-cache

# Check Dockerfile paths are correct
docker build -t test-build -f src/AcademicService/Dockerfile src/
```

#### Common issues:
1. **ProjectReference not found**: Kiểm tra đường dẫn reference trong `.csproj`
2. **Namespace conflicts**: Đảm bảo using statements đúng
3. **Missing Shared types**: Verify Shared project build thành công

### Development Best Practices

1. **Khi thay đổi Shared project**: Rebuild tất cả services phụ thuộc
2. **Khi thêm dependency mới**: Cập nhật Dockerfile để copy project
3. **Testing**: Test cả direct service call và thông qua API Gateway