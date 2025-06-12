#!/bin/bash
set -e

# Script này sẽ chạy trong container schema_initializer riêng biệt
# Thông số kết nối database - kết nối tới container citus_coordinator
PG_HOST="citus_coordinator"
PG_PORT="5432"
PG_USER="${POSTGRES_USER:-postgres}"
PG_DBNAME="${POSTGRES_DB:-postgres}"
PG_PASSWORD="${POSTGRES_PASSWORD}"
EXPECTED_WORKERS=${EXPECTED_WORKERS:-2}

# Thư mục chứa các file SQL
SCHEMA_DIR="/schema_files"

echo "====== SCHEMA INITIALIZATION SCRIPT ======"
echo "Waiting for Citus workers to be registered..."

# Đặt biến môi trường để psql không yêu cầu mật khẩu
export PGPASSWORD="$PG_PASSWORD"

# Kiểm tra database đã sẵn sàng chưa
echo "Checking if PostgreSQL is ready..."
until psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -c "SELECT 1" > /dev/null 2>&1; do
  echo "PostgreSQL is unavailable - sleeping 5s"
  sleep 5
done
echo "PostgreSQL is ready!"


# Kiểm tra cấu trúc bảng pg_dist_node để xác định đúng các giá trị enum
echo "Checking pg_dist_node structure..."
# Lấy thông tin chi tiết về bảng pg_dist_node và field noderole
NODEROLE_INFO=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -t -c "\d pg_dist_node" 2>/dev/null || echo "Table not found")
echo "pg_dist_node structure: $NODEROLE_INFO"

# Thử các truy vấn khác nhau cho đến khi tìm được đúng cách truy vấn
echo "Attempting to find correct query format for worker nodes..."

# Kiểm tra số worker đã đăng ký sử dụng các truy vấn khác nhau
function get_worker_count() {
  # Thử truy vấn 1 - sử dụng nodename LIKE 'citus_worker_%'
  local count1=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -t -c \
    "SELECT count(*) FROM pg_dist_node WHERE nodename LIKE 'citus_worker_%' AND isactive = true;" 2>/dev/null || echo "0")
  
  # Thử truy vấn 2 - sử dụng liệt kê tất cả node và đếm thủ công
  local nodes=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -t -c \
    "SELECT nodename, noderole, isactive FROM pg_dist_node;" 2>/dev/null || echo "")
  
  # Hiển thị thông tin debug (gửi ra stderr để không ảnh hưởng đến giá trị trả về)
  echo "Available nodes:" >&2
  echo "$nodes" >&2
  
  # Sử dụng kết quả từ truy vấn 1 nếu có
  local count="${count1//[[:space:]]/}"
  if [[ -z "$count" || "$count" == "0" ]]; then
    # Đếm số lượng worker từ danh sách node
    local count_workers=$(echo "$nodes" | grep -c "citus_worker_")
    count="$count_workers"
  fi
  
  # Đảm bảo count là một số nguyên hợp lệ
  if [[ -z "$count" || ! "$count" =~ ^[0-9]+$ ]]; then
    count="0"
  fi
  
  # Chỉ trả về số nguyên
  echo "$count"
}

# Kiểm tra xem các worker đã được đăng ký chưa
MAX_ATTEMPTS=30
ATTEMPT=0
echo "Waiting for $EXPECTED_WORKERS worker nodes to be registered..."

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  WORKER_COUNT=$(get_worker_count)
  
  echo "Found $WORKER_COUNT active worker(s). Expected: $EXPECTED_WORKERS (Attempt: $((ATTEMPT+1))/$MAX_ATTEMPTS)"
  
  if [ "$WORKER_COUNT" -ge "$EXPECTED_WORKERS" ]; then
    echo "All workers are registered. Proceeding with schema creation..."
    break
  fi
  
  ATTEMPT=$((ATTEMPT+1))
  sleep 10
done

if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
  echo "WARNING: Timeout waiting for workers. Found only $WORKER_COUNT out of $EXPECTED_WORKERS expected workers."
  echo "Proceeding anyway, but some operations might fail."
fi

# Tạo các bảng reference 
echo "Creating reference tables..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -f "$SCHEMA_DIR/01_reference_tables.sql"

# Tạo các bảng faculty distributed
echo "Creating faculty distributed tables..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -f "$SCHEMA_DIR/02_faculty_distributed_tables.sql"

# Tạo các bảng accounting distributed - Bỏ qua bước này vì schema kế toán sẽ được khởi tạo riêng
# echo "Creating accounting distributed tables..."
# psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -f "$SCHEMA_DIR/03_accounting_distributed_tables.sql"

# Thêm dữ liệu tham chiếu
echo "Adding reference data..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -f "$SCHEMA_DIR/04_reference_data.sql"

# Thêm indexes
echo "Creating indexes..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -f "$SCHEMA_DIR/05_indexes.sql"

# --- BEGIN CDC CONFIGURATION FOR CITUS COORDINATOR ---
echo "Configuring Citus Coordinator for Change Data Capture (CDC)..."

# 1. Enable citus.enable_change_data_capture on the coordinator
echo "Enabling citus.enable_change_data_capture on coordinator..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -c "ALTER SYSTEM SET citus.enable_change_data_capture = 'on';"
# Đảm bảo wal_level = logical trên coordinator
echo "Setting wal_level = logical on coordinator..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -c "ALTER SYSTEM SET wal_level = logical;"
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -c "SELECT pg_reload_conf();"

# 2. Grant REPLICATION privilege to the PostgreSQL user Debezium will use (nếu chưa có)
# Người dùng postgres mặc định thường đã là superuser và có quyền này.
# psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -c "ALTER USER \"$PG_USER\" WITH REPLICATION;"

# 3. Set REPLICA IDENTITY for the student table on the coordinator.
# Lệnh này trên coordinator sẽ áp dụng cho cấu trúc logic của bảng phân tán.
# sleep 20s
sleep 25s
echo "Restarting coordinator..."
echo "Setting REPLICA IDENTITY FULL for public.student table (on coordinator)..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -c "ALTER TABLE public.student REPLICA IDENTITY FULL;"


# 4. Create PUBLICATION on worker nodes
echo "Creating PUBLICATION on worker nodes..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -c "CREATE PUBLICATION dbz_student_shards_publication FOR TABLE public.student;"

# 5. Create logical replication slot on worker nodes
echo "Creating logical replication slot on worker nodes..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -c "SELECT * FROM run_command_on_all_nodes(\$\$SELECT pg_create_logical_replication_slot('dbz_student_shards_publication', 'pgoutput');\$\$);"

# 6. Create user replication for debezium
echo "Creating user replication for debezium..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -c "CREATE USER debezium WITH REPLICATION;"


echo "CDC Configuration for Citus Coordinator completed. REMEMBER TO CREATE PUBLICATIONS ON WORKER NODES."
# --- END CDC CONFIGURATION FOR CITUS COORDINATOR ---

echo "Schema initialization completed successfully!" 