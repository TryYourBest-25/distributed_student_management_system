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

# Tạo các bảng accounting distributed
echo "Creating accounting distributed tables..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -f "$SCHEMA_DIR/03_accounting_distributed_tables.sql"

# Thêm dữ liệu tham chiếu
echo "Adding reference data..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -v ON_ERROR_STOP=1 -f "$SCHEMA_DIR/04_reference_data.sql"

echo "Schema initialization completed successfully!" 