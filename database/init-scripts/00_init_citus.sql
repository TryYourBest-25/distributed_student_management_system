-- Kích hoạt extension Citus
SET search_path TO public;
CREATE EXTENSION IF NOT EXISTS citus; 
SELECT citus_set_coordinator_host('citus_coordinator', 5432); 