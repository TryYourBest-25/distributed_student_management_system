#!/bin/bash

# Script này sẽ chạy trong container master để tạo user replication

echo "Tạo người dùng replication trên Master..."
mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "
DROP USER IF EXISTS 'repl'@'%';
CREATE USER 'repl'@'%' IDENTIFIED WITH 'caching_sha2_password' BY '$MYSQL_REPL_PASSWORD';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;
"
echo "Tạo user replication hoàn tất!" 

# Alternatively, you can use ALTER USER to change the existing user's authentication method:
# mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "
# ALTER USER 'repl'@'%' IDENTIFIED WITH mysql_native_password BY '$MYSQL_REPL_PASSWORD';
# FLUSH PRIVILEGES;
# "