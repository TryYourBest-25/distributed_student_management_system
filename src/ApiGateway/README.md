# API Gateway với Ocelot

## Cấu hình

API Gateway chạy trên:

- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`

## Routing

### Academic Service

- **Upstream**: `/academic/{endpoint}`
- **Downstream**: `http://localhost:14200/api/{endpoint}`
- **Ví dụ**:
    - GET `/academic/faculties` → `http://localhost:14200/api/faculties`
    - GET `/academic/v1/courses` → `http://localhost:14200/api/v1/courses`

### Faculty Service

- **Upstream**: `/faculty/{endpoint}`
- **Downstream**: `http://localhost:30000/api/{endpoint}`
- **Ví dụ**:
    - GET `/faculty/v1/IT-FACULTY/students` → `http://localhost:30000/api/v1/IT-FACULTY/students`
    - GET `/faculty/v1/IT-FACULTY/classes` → `http://localhost:30000/api/v1/IT-FACULTY/classes`

### Tuition Service

- **Upstream**: `/tuition/{endpoint}`
- **Downstream**: `http://localhost:14100/api/{endpoint}`
- **Ví dụ**:
    - GET `/tuition/payments` → `http://localhost:14100/api/payments`
    - POST `/tuition/invoices` → `http://localhost:14100/api/invoices`

## Chạy ứng dụng

```bash
cd src/ApiGateway
dotnet run
```

## Test API

```bash
# Test Academic Service qua Gateway
curl http://localhost:5000/academic/faculties

# Test Faculty Service qua Gateway  
curl http://localhost:5000/faculty/v1/IT-FACULTY/students

# Test Tuition Service qua Gateway
curl http://localhost:5000/tuition/payments
``` 