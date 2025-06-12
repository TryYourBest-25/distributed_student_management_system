# Hệ Thống Quản Lý Sinh Viên Phân Tán với Citus & HAProxy - Hướng Dẫn

## Tổng Quan Kiến Trúc

Kiến trúc này sử dụng Docker Compose để triển khai một cụm cơ sở dữ liệu PostgreSQL phân tán bằng Citus, với HAProxy làm bộ cân bằng tải cho các kết nối đến node điều phối (coordinator) của Citus. Hệ thống cũng bao gồm một node coordinator dự phòng (standby) và các script cho việc sao lưu (backup) và phục hồi (restore) thủ công.

Các thành phần chính:

1. **`haproxy_loadbalancer`**:
    * Là điểm vào (entry point) cho tất cả các kết nối từ ứng dụng đến cơ sở dữ liệu.
    * Lắng nghe trên cổng `16432` (có thể cấu hình trong `haproxy/haproxy.cfg` và `compose-dev.yml`).
    * Phân phối kết nối đến node Citus coordinator đang hoạt động (`citus_coordinator`).
    * Cung cấp trang thống kê (stats UI) tại `http://localhost:8404`.

2. **`citus_coordinator`**:
    * Node điều phối chính của cụm Citus.
    * Lưu trữ metadata của cụm, các bảng tham chiếu (reference tables) và điều phối truy vấn trên các node worker.
    * Chạy các script khởi tạo schema trong `./init-scripts` khi khởi động lần đầu.
    * Chứa script `backup.sh` để sao lưu dữ liệu.

3. **`citus_coordinator_standby`**:
    * Node điều phối dự phòng, ban đầu không hoạt động.
    * Có thể được phục hồi dữ liệu từ bản backup của `citus_coordinator`.
    * Dùng cho kịch bản failover thủ công.

4. **`citus_worker_1`, `citus_worker_2`**:
    * Các node công nhân (worker) của Citus.
    * Lưu trữ các mảnh dữ liệu (shards) của các bảng phân tán (distributed tables).
    * Thực thi các phần của truy vấn song song dưới sự điều phối của coordinator.

5. **Volumes Dữ Liệu và Cấu Hình:**
    * `coordinator_data`, `coordinator_standby_data`, `worker1_data`, `worker2_data`: Lưu trữ dữ liệu của các node PostgreSQL tương ứng.
    * `backup_data`: Lưu trữ các bản sao lưu.
    * `./init-scripts`: Chứa các file SQL và shell script để khởi tạo schema và đăng ký worker tự động.
    * `./haproxy`: Chứa file cấu hình `haproxy.cfg`.
    * `./scripts`: Chứa các script tiện ích như `backup.sh`, `restore_to_standby.sh`.

## Các Loại Bảng Trong Citus

Trong Citus, có ba loại bảng chính bạn cần nắm vững khi thiết kế schema:

1. **Bảng Phân Tán (Distributed Tables):**
    * **Khái niệm:** Đây là các bảng lớn mà dữ liệu của chúng được chia thành nhiều mảnh nhỏ (shards) và các mảnh này được lưu trữ trải rộng trên các node worker trong cụm Citus. Node coordinator chỉ lưu trữ metadata về vị trí của các shard.
    * **Cách tạo:** Sử dụng hàm `create_distributed_table('table_name', 'distribution_column_name', colocate_with => 'other_table')`.
    * **Cột Phân Tán (Distribution Column):** Là cột được sử dụng để quyết định dữ liệu sẽ được phân chia vào các shard như thế nào. Việc chọn cột phân tán tốt là cực kỳ quan trọng để đạt hiệu năng cao và cân bằng tải.
    * **Co-location:** Khi các bảng phân tán có cùng kiểu dữ liệu cột phân tán và được co-located, các shard tương ứng của chúng sẽ được đặt trên cùng một worker. Điều này cho phép các phép JOIN và khóa ngoại giữa chúng được thực thi cục bộ trên worker, mang lại hiệu suất cao.
    * **Sử dụng khi:** Bảng có kích thước lớn, cần khả năng mở rộng (scale-out) cho cả lưu trữ và năng lực xử lý truy vấn.
    * **Ví dụ trong dự án:** `class`, `student`, `credit_class`, `registration` (phân tán theo `faculty_code`).

2. **Bảng Tham Chiếu (Reference Tables):**
    * **Khái niệm:** Đây là các bảng nhỏ hơn mà một bản sao đầy đủ của dữ liệu được lưu trữ trên TẤT CẢ các node worker, cũng như trên node coordinator.
    * **Cách tạo:** Sử dụng hàm `create_reference_table('table_name')`.
    * **Sử dụng khi:** Bảng có kích thước tương đối nhỏ, ít thay đổi và thường xuyên được JOIN với các bảng phân tán lớn. Việc có bản sao trên mỗi worker giúp các phép JOIN này có thể được thực hiện cục bộ trên worker mà không cần truy vấn qua mạng đến coordinator hoặc worker khác.
    * **Ví dụ trong dự án:** `faculty`, `course`, `lecturer`, `user_account`, `role`.

3. **Bảng Cục Bộ (Local Tables):**
    * **Khái niệm:** Đây là các bảng PostgreSQL tiêu chuẩn, chỉ tồn tại trên node coordinator và không được Citus quản lý hoặc phân tán.
    * **Cách tạo:** Sử dụng lệnh `CREATE TABLE` thông thường của PostgreSQL mà không gọi hàm của Citus.
    * **Sử dụng khi:** Các bảng này thường dùng cho các mục đích quản trị, metadata tạm thời hoặc các bảng rất nhỏ không cần thiết phải tham gia vào các truy vấn phân tán hoặc không cần khả năng mở rộng của Citus. Trong kiến trúc này, chúng ta hạn chế sử dụng bảng local trên coordinator cho dữ liệu nghiệp vụ chính để tối ưu hóa mô hình phân tán.
    * **Ví dụ trong dự án:** `user_account`, `role`, `tuition_payment`, `tuition`, `student_basic_info`.
    * **Lưu ý:** Không thể JOIN hiệu quả giữa bảng local trên coordinator và bảng phân tán trên worker (sẽ yêu cầu kéo nhiều dữ liệu về coordinator).

Việc lựa chọn đúng loại bảng cho từng thực thể dữ liệu là chìa khóa để xây dựng một hệ thống Citus hiệu quả và có khả năng mở rộng tốt.

## Cách Hoạt Động

### 1. Khởi Động Hệ Thống

```bash
# Từ thư mục gốc của project (nơi chứa thư mục database)
cd database
docker-compose -f ../compose-dev.yml up -d
```

* Các container `citus_coordinator`,  `citus_worker_1`, `citus_worker_2`, và `workerlist_gen` sẽ khởi động.
* `workerlist_gen` sẽ:
    1. Lắng nghe các sự kiện Docker.
    2. Khi các container `citus_worker_1` và `citus_worker_2` (có label `com.citusdata.role=Worker`) khởi động và sẵn sàng, `workerlist_gen` sẽ phát hiện chúng.
    3. Tự động thực thi lệnh `psql` để gọi hàm `master_initialize_node_metadata(true)` trên `citus_coordinator`, việc này sẽ đăng ký các worker vào bảng `pg_dist_node` của coordinator.
* Trong khi đó, `citus_coordinator` khi khởi động lần đầu (PGDATA trống) sẽ:
    1. Khởi tạo cơ sở dữ liệu PostgreSQL.
    2. Thực thi các tệp trong `init-scripts` theo thứ tự bảng chữ cái:
        * `00_init_citus.sql`: Tạo extension Citus.
        * `05_wait_and_create_schemas.sh`:
            * Script này sẽ đợi cho đến khi `workerlist_gen` đăng ký đủ 2 worker vào `pg_dist_node` (có cơ chế retry và timeout).
            * Sau khi xác nhận worker đã được đăng ký, script sẽ tuần tự thực thi các file SQL sau để tạo schema và dữ liệu:
                * `01_reference_tables.sql`: Tạo các bảng tham chiếu.
                * `02_faculty_distributed_tables.sql`: Tạo các bảng phân tán theo khoa.
                * `03_accounting_distributed_tables.sql`: Tạo các bảng phân tán theo sinh viên (cho kế toán).
                * `04_reference_data.sql`: Chèn dữ liệu tham chiếu ban đầu.
* Các node worker (`citus_worker_1`, `citus_worker_2`) sẽ khởi động và được `workerlist-gen` tự động đăng ký với `citus_coordinator`.
* `haproxy_loadbalancer` khởi động và bắt đầu chuyển tiếp kết nối từ cổng `16432` đến `citus_coordinator:5432`.

### 2. Kết Nối Cơ Sở Dữ Liệu

Ứng dụng của bạn nên kết nối đến PostgreSQL thông qua HAProxy:

* **Host**: `localhost` (hoặc địa chỉ IP của Docker host)
* **Port**: `16432` (cổng frontend của HAProxy)
* **Database**: `student_db` (tên trong `.dev.env`)
* **User**: `postgres` (tên trong `.dev.env`)
* **Password**: Mật khẩu bạn đặt trong `.dev.env`

HAProxy sẽ tự động chuyển kết nối này đến `citus_coordinator`.

### 3. Sao Lưu Dữ Liệu (Backup)

Script `database/scripts/backup.sh` được thiết kế để sao lưu toàn bộ cụm Citus. Dữ liệu backup sẽ được lưu vào volume `backup_data`, cụ thể là trong thư mục `/var/lib/postgresql/backups` bên trong container `citus_coordinator`.

**Cách chạy backup:**

```bash
docker exec -it citus_coordinator bash /opt/scripts/backup.sh
```

Script này thực hiện:

1. `pg_dumpall --globals-only`: Sao lưu các global objects (roles, tablespaces) từ coordinator.
2. `pg_dump --schema-only`: Sao lưu schema của database (bao gồm bảng tham chiếu và schema bảng phân tán) từ coordinator.
3. `SELECT citus_backup_logical_shards(...)`: Sao lưu dữ liệu của các shard (bảng phân tán) và các bảng tham chiếu. Citus sẽ tạo một thư mục con (ví dụ: `shard_backups_YYYYMMDD_HHMMSS`) bên trong thư mục backup chính chứa các file dữ liệu này.

### 4. Phục Hồi và Failover Thủ Công (Manual Failover)

Quy trình này được sử dụng khi `citus_coordinator` (node chính) gặp sự cố và bạn muốn chuyển sang `citus_coordinator_standby`.

**Các bước chính:**

1. **Phát hiện sự cố:** Xác định `citus_coordinator` không hoạt động.
2. **Chuẩn bị Standby (Restore):**
    * Đảm bảo bạn có bản backup gần nhất (từ `backup.sh`).
    * **Quan trọng:** Dừng container standby: `docker-compose -f ../compose-dev.yml stop citus_coordinator_standby`.
    * (Khuyến nghị cho fresh restore) Xóa dữ liệu cũ trong volume của standby. Tìm đường dẫn volume bằng `docker volume inspect database_coordinator_standby_data` và xóa nội dung của nó (ví dụ: `sudo rm -rf /var/lib/docker/volumes/database_coordinator_standby_data/_data/*`).
    * Khởi động lại container standby: `docker-compose -f ../compose-dev.yml up -d citus_coordinator_standby`. Nó sẽ tự tạo PGDATA trống.
    * Chờ standby khởi động hoàn toàn. Sau đó, chạy script restore:

        ```bash
        docker exec -it citus_coordinator_standby bash /opt/scripts/restore_to_standby.sh
        ```

        Script `restore_to_standby.sh` sẽ:
        * Tìm bản backup mới nhất trong volume `backup_data`.
        * Xóa dữ liệu cũ (nếu có) trong PGDATA của standby (đã làm ở bước trên nhưng script có thể làm lại).
        * Restore global objects.
        * Tạo database (nếu chưa có).
        * Restore schema.
        * Kích hoạt extension Citus.
        * Restore dữ liệu cho reference tables và các shards của distributed tables.
        * **Rất quan trọng:** Đăng ký lại các node `citus_worker_1` và `citus_worker_2` với `citus_coordinator_standby` mới này.

3. **Kiểm tra Standby:** Kết nối trực tiếp đến `citus_coordinator_standby` (ví dụ, bằng cách tạm thời expose cổng của nó trong `compose-dev.yml` hoặc dùng `docker exec`) và kiểm tra dữ liệu, trạng thái cụm, trạng thái worker.

4. **Cập nhật HAProxy:**
    * Mở tệp `database/haproxy/haproxy.cfg`.
    * Trong phần `backend pg_backend`, thay đổi server active:

        ```diff
        backend pg_backend
            mode tcp
            balance roundrobin
            option pgsql-check user postgres
        -   server citus_coord1 citus_coordinator:5432 check port 5432
        +   # server citus_coord1 citus_coordinator:5432 check port 5432 # Comment out a cũ
        +   server citus_coord_standby citus_coordinator_standby:5432 check port 5432 # Kích hoạt standby
        ```

5. **Reload HAProxy:**
    Để HAProxy áp dụng cấu hình mới mà không làm gián đoạn các kết nối hiện có (graceful reload):

    ```bash
    docker exec -it haproxy_loadbalancer haproxy -sf $(cat /var/run/haproxy/haproxy.pid)
    ```

    Hoặc, đơn giản hơn cho môi trường dev (sẽ có downtime ngắn):

    ```bash
    docker-compose -f ../compose-dev.yml restart haproxy_loadbalancer
    ```

6. **Kiểm tra hệ thống:** Ứng dụng của bạn giờ sẽ kết nối đến `citus_coordinator_standby` thông qua HAProxy.

### 5. HAProxy Stats UI

Bạn có thể xem trạng thái của HAProxy, các frontend, backend và server tại:
`http://localhost:8404`
(Thông tin đăng nhập mặc định thường không có, hoặc có thể được cấu hình trong `haproxy.cfg` nếu bạn muốn thêm xác thực cho trang stats).
