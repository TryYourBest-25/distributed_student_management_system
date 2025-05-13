#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# Database connection parameters - will be passed as environment variables
PG_HOST="${PGHOST:-citus_master}"
PG_PORT="${PGPORT:-5432}"
PG_USER="${PGUSER:-postgres}"
PG_DBNAME="${PGDATABASE:-postgres}" # Should match POSTGRES_DB from .dev.env
# PGPASSWORD should be set as an environment variable in compose-dev.yml

EXPECTED_WORKERS=2 # Number of worker nodes we expect

echo "Waiting for Citus coordinator ('$PG_HOST') to be ready..."
# Basic check for coordinator readiness (can be improved)
until psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -c ";" &>/dev/null; do
  >&2 echo "Coordinator is unavailable - sleeping"
  sleep 5
done
echo "Citus coordinator is up."

echo "Waiting for $EXPECTED_WORKERS worker nodes to be registered and active..."
while true; do
  # Ensure citus_utils is in search_path or qualify the table name
  # Since search_path might not be set for this psql session, qualify it.
  # If this still fails, we might need to set search_path explicitly inside the psql command.
  WORKER_COUNT=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -tAc "SELECT COUNT(*) FROM pg_dist_node WHERE nodename LIKE 'citus_worker_%' AND port = $PG_PORT AND noderole = 'worker' AND isactive = true;" 2>/dev/null || echo "0")
  
  if [[ "$WORKER_COUNT" -ge "$EXPECTED_WORKERS" ]]; then
    echo "Found $WORKER_COUNT active worker(s). Proceeding with distributed setup."
    break
  else
    echo "Found $WORKER_COUNT active worker(s). Waiting for $EXPECTED_WORKERS... Retrying in 10 seconds."
    sleep 10
  fi
done

echo "All workers are active. Proceeding to configure distributed tables and reference tables."

# === EXECUTE CITUS SETUP SQL FILES ===
# These files should contain SELECT create_reference_table(...) and SELECT create_distributed_table(...)

SQL_SETUP_DIR="/setup_scripts"

echo "Setting up reference tables (01a)..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -a -f "${SQL_SETUP_DIR}/01a_setup_reference_tables.sql"

echo "Setting up faculty distributed tables (02a)..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -a -f "${SQL_SETUP_DIR}/02a_setup_faculty_distributed_tables.sql"

echo "Setting up accounting distributed tables (03a)..."
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DBNAME" -a -f "${SQL_SETUP_DIR}/03a_setup_accounting_distributed_tables.sql"


echo "Citus distributed setup completed successfully."
exit 0 