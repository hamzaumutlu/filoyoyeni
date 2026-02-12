-- ============================================
-- Filoyo CRM - Add authorized_email & Fix RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add authorized_email column to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS authorized_email TEXT;

-- 2. Drop existing RLS policies on companies
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Super admin full access to companies" ON companies;
DROP POLICY IF EXISTS "Users can view own company" ON companies;

-- 3. Disable RLS on companies (admin panel - single tenant)
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Migration 006 applied: authorized_email added, RLS disabled on companies' AS result;
