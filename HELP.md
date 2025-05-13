# Hướng dẫn Developer

## Cài đặt môi trường

1. **Cài đặt Docker và Docker Compose:**
   - Truy cập trang [Docker](https://www.docker.com/products/docker-desktop) và tải về phiên bản phù hợp với hệ điều hành của bạn.
   - Làm theo hướng dẫn cài đặt trên trang web để cài đặt Docker.
   - Kiểm tra Docker đã hoạt động bằng cách chạy lệnh `docker --version` trong terminal.
   - Docker Compose thường được cài đặt cùng với Docker Desktop. Kiểm tra phiên bản Docker Compose bằng lệnh `docker-compose --version`.

2. **Cài đặt PostgreSQL và Citus:**
   - Truy cập [trang chủ PostgreSQL](https://www.postgresql.org/download/) và tải về phiên bản phù hợp với hệ điều hành của bạn.
   - Làm theo hướng dẫn cài đặt trên trang web để cài đặt PostgreSQL.
   - Cài đặt Citus như một extension của PostgreSQL theo hướng dẫn trên [trang chủ Citus](https://www.citusdata.com/download/).
   - Kích hoạt Citus trong PostgreSQL bằng lệnh `CREATE EXTENSION citus;` trong psql.

3. **Cài đặt Git:**
   - Truy cập [trang chủ Git](https://git-scm.com/downloads) và tải về phiên bản phù hợp với hệ điều hành của bạn.
   - Làm theo hướng dẫn cài đặt trên trang web để cài đặt Git.
   - Kiểm tra Git đã hoạt động bằng cách chạy lệnh `git --version`.

4. **Cài đặt .NET SDK 9**:
   - Truy cập [trang chủ .NET](https://dotnet.microsoft.com/download) và tải về phiên bản .NET SDK 9.

5. **Khởi động các dịch vụ:**

a. Cụm Database: [compose-dev.yml](./database/compose-dev.yml)
b. Với các service:

- Do chưa sử dụng docker compose nên các service sẽ được chạy bằng:

- Dùng IDEs(Ưu tiên JetBrains Rider) để mở các solution trong các thư mục.
- Tiến hành build và chạy các service.
