-- ============================================
-- Filoyo CRM - Fix ALL tables for persistence
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add authorized_email to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS authorized_email TEXT;

-- 2. Add method_id to advances (for payment method tracking)
ALTER TABLE advances ADD COLUMN IF NOT EXISTS method_id UUID REFERENCES methods(id) ON DELETE SET NULL;

-- 3. Insert demo company (needed for foreign key constraints)
INSERT INTO companies (id, name, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Filoyo Demo', 'active')
ON CONFLICT (id) DO NOTHING;

-- 4. Drop ALL existing RLS policies
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 5. Disable RLS on ALL tables (admin panel - single tenant)
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE personnel DISABLE ROW LEVEL SECURITY;
ALTER TABLE advances DISABLE ROW LEVEL SECURITY;
ALTER TABLE methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE data_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- ============================================
SELECT 'Migration complete: RLS disabled, columns added, demo company created!' AS result;
