-- Drop all tables in the current schema (pgsql)
DO $$ DECLARE
    r RECORD;
BEGIN
    -- Loop through all tables in the current schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all schema except 'public' and system schemas (pgsql)
DO $$ DECLARE
    r RECORD;
BEGIN
    -- Loop through all schemas excluding 'public' and system schemas
    FOR r IN (SELECT nspname FROM pg_namespace WHERE nspname != 'public' AND nspname NOT LIKE 'pg_%' AND nspname != 'information_schema') LOOP
        EXECUTE 'DROP SCHEMA ' || quote_ident(r.nspname) || ' CASCADE';
    END LOOP;
END $$;
