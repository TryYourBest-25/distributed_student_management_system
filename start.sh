#!/bin/bash

source .env.dev

# Start the services, remove volumes, and remove orphan containers
docker compose -f compose-dev.yml down --volumes --remove-orphans
echo "================================================1. CREATE DATABASE================================================"
docker compose -f compose-dev.yml up -d

echo "Waiting for the services to start..."
sleep 30

echo "Creating user replication for accounting_db..."
# Kết nối đến coordinator0 và tạo user replication cho accounting_db
docker exec coordinator0 psql -h "coordinator0" -U "${POSTGRES_COORDINATOR_0_USER:-coor}" -d "${POSTGRES_COORDINATOR_0_DB:-dsmsdb}" -c "CREATE ROLE ${POSTGRES_ACC_DB_USER:-acc_user} WITH LOGIN REPLICATION PASSWORD ${POSTGRES_ACC_DB_PASSWORD:-acc_user};"
docker exec coordinator0 psql -h "coordinator0" -U "${POSTGRES_COORDINATOR_0_USER:-coor}" -d "${POSTGRES_COORDINATOR_0_DB:-dsmsdb}" -c "GRANT ALL PRIVILEGES ON TABLE student IN SCHEMA public TO ${POSTGRES_ACC_DB_USER:-acc_user};"

# tạo schema cho coordinator0 - sử dụng script khởi tạo có sẵn
echo "Creating schema for coordinator0..."
docker exec coordinator0 bash -c 'for f in /opt/scripts/*.sql; do echo "Executing $f"; psql -U '"${POSTGRES_COORDINATOR_0_USER:-coor}"' -d '"${POSTGRES_COORDINATOR_0_DB:-dsmsdb}"' -f "$f"; done'


# set citus.enable_change_data_capture=on và wal-level=logical
echo "Setting citus.enable_change_data_capture=on and wal_level=logical..."
docker exec coordinator0 psql -h "coordinator0" -U "${POSTGRES_COORDINATOR_0_USER:-coor}" -d "${POSTGRES_COORDINATOR_0_DB:-dsmsdb}" -c "ALTER SYSTEM SET citus.enable_change_data_capture = 'on';"
docker exec coordinator0 psql -h "coordinator0" -U "${POSTGRES_COORDINATOR_0_USER:-coor}" -d "${POSTGRES_COORDINATOR_0_DB:-dsmsdb}" -c "ALTER SYSTEM SET wal_level = 'logical';"
docker exec coordinator0 psql -h "coordinator0" -U "${POSTGRES_COORDINATOR_0_USER:-coor}" -d "${POSTGRES_COORDINATOR_0_DB:-dsmsdb}" -c "SELECT pg_reload_conf();"

# restart coordinator0 docker
echo "Restarting coordinator0..."
docker compose -f compose-dev.yml restart coordinator0

# chờ cho đến khi coordinator0 healthy
echo "Waiting for coordinator0 to be healthy..."
while ! docker ps | grep coordinator0 | grep -q healthy; do
    echo "coordinator0 is not healthy yet, waiting..."
    sleep 5
done
echo "coordinator0 is healthy!"

# set replica identity cho student table
echo "Setting replica identity for student table..."
docker exec coordinator0 psql -h "coordinator0" -U "${POSTGRES_COORDINATOR_0_USER:-coor}" -d "${POSTGRES_COORDINATOR_0_DB:-dsmsdb}" -c "ALTER TABLE public.student REPLICA IDENTITY FULL;"

# tạo publication cho student table
echo "Creating publication for student table..."
docker exec coordinator0 psql -h "coordinator0" -U "${POSTGRES_COORDINATOR_0_USER:-coor}" -d "${POSTGRES_COORDINATOR_0_DB:-dsmsdb}" -c "CREATE PUBLICATION dbz_student_shards_publication FOR TABLE public.student;"

# tạo logical replication slot cho student table
echo "Creating logical replication slot for student table..."
docker exec coordinator0 psql -h "coordinator0" -U "${POSTGRES_COORDINATOR_0_USER:-coor}" -d "${POSTGRES_COORDINATOR_0_DB:-dsmsdb}" -c "SELECT * FROM run_command_on_all_nodes(\$\$SELECT pg_create_logical_replication_slot('dbz_student_shards_publication', 'pgoutput');\$\$);"

echo "CDC Configuration for Citus Coordinator completed. REMEMBER TO CREATE PUBLICATIONS ON WORKER NODES."
echo "Done!"

# Chờ debezium-source sẵn sàng
echo "Waiting for debezium-source to be ready..."
until curl -f http://localhost:${DEBEZIUM_SOURCE_HOST_PORT:-28083}/connectors > /dev/null 2>&1; do
    echo "debezium-source is not ready yet, waiting..."
    sleep 5
done
echo "debezium-source is ready!"

# Gửi request đến debezium-source
echo "================================================2. CREATE DEBEZIUM CONNECTORS================================================"
echo "Creating Debezium connectors..."


echo "Creating sync worker-1 connector..."
curl -X POST -H "Content-Type: application/json" --data @debezium_json/sync_worker_0.json http://localhost:${DEBEZIUM_SOURCE_HOST_PORT:-28083}/connectors

echo "Creating sync worker-2 connector..."
curl -X POST -H "Content-Type: application/json" --data @debezium_json/sync_worker_1.json http://localhost:${DEBEZIUM_SOURCE_HOST_PORT:-28083}/connectors

echo "Creating target-sink connector..."
curl -X POST -H "Content-Type: application/json" --data @debezium_json/target-sink-worker-0.json http://localhost:${DEBEZIUM_SOURCE_HOST_PORT:-28083}/connectors

echo "================================================SETUP COMPLETED================================================"
echo "All services started and configured successfully!"
echo "Access points:"
echo "- Citus Coordinator (via HAProxy): http://localhost:${PROXYDB_HOST_PORT_1:-26000}"
echo "- Accounting DB: http://localhost:${POSTGRES_ACC_DB_HOST_PORT:-25020}"
echo "- Kafka UI: http://localhost:${KAFKAUI_HOST_PORT:-25700}"
echo "- Debezium Source API: http://localhost:${DEBEZIUM_SOURCE_HOST_PORT:-28083}"
echo "- HAProxy Stats: http://localhost:${PROXYDB_HOST_PORT_2:-26001}"
echo "- Debezium Sink API: http://localhost:${DEBEZIUM_SINK_HOST_PORT:-25383}"
echo "- Keycloak: http://localhost:${KEYCLOAK_HOST_PORT:-25352}"
echo "- Keycloak DB: http://localhost:${KEYCLOAK_DB_HOST_PORT:-25030}"


