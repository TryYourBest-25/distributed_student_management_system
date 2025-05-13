#!/bin/bash

# Script này sẽ chạy trong container slave để cấu hình replication

# Đợi MySQL khởi động hoàn tất trên container slave này
echo "Đợi MySQL khởi động trên slave..."
until mysqladmin ping -u root -p"$MYSQL_ROOT_PASSWORD" --silent; do
    echo "Đang đợi MySQL khởi động..."
    sleep 2
done

# Đợi cho master khởi động hoàn tất
echo "Đợi MySQL Master khởi động..."
until mysql -h mysql-academic -u root -p"$MYSQL_ROOT_PASSWORD" -e "SELECT 1" &> /dev/null; do
    echo "Đang đợi MySQL Master..."
    sleep 5
done

# Đợi user replication được tạo
echo "Đợi user replication được tạo..."
until mysql -h mysql-academic -u root -p"$MYSQL_ROOT_PASSWORD" -e "SELECT User FROM mysql.user WHERE User='repl'" | grep 'repl' &> /dev/null; do
    echo "Đang đợi user replication..."
    sleep 5
done

# Lấy thông tin log file và position từ master
echo "Lấy thông tin master status..."
# Sử dụng \G để output dễ parse hơn
MS_STATUS=$(mysql -h mysql-academic -u root -p"$MYSQL_ROOT_PASSWORD" -e "SHOW BINARY LOG STATUS\G")
CURRENT_LOG=$(echo "$MS_STATUS" | grep 'File:' | awk '{print $2}')
CURRENT_POS=$(echo "$MS_STATUS" | grep 'Position:' | awk '{print $2}')

echo "Master status - Log File: $CURRENT_LOG, Position: $CURRENT_POS"

# Kiểm tra xem có lấy được giá trị không
if [ -z "$CURRENT_LOG" ] || [ -z "$CURRENT_POS" ]; then
  echo "Lỗi: Không thể lấy thông tin Binary Log File hoặc Position từ master."
  echo "Master Status Output:"
  echo "$MS_STATUS"
  exit 1
fi

# Cấu hình slave
echo "Cấu hình slave..."
mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "
STOP REPLICA;
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='mysql-academic',
  SOURCE_USER='repl',
  SOURCE_PASSWORD='$MYSQL_REPL_PASSWORD',
  SOURCE_LOG_FILE='$CURRENT_LOG',
  SOURCE_LOG_POS=$CURRENT_POS,
  GET_SOURCE_PUBLIC_KEY=1;
START REPLICA;
"

echo "Thiết lập replication hoàn tất!"

# Kiểm tra trạng thái slave
echo "Kiểm tra trạng thái replica..."
mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SHOW REPLICA STATUS\G" 