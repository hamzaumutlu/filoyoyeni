-- ============================================
-- Filoyo CRM - Fix Activities Table RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================
-- Problem: activities table was created with old inline-subquery
-- RLS pattern instead of the get_user_company_id() helper function.
-- It also lacks the super_admin full access policy.
-- ============================================

-- ============================================
-- Step 1: Drop old broken policy
-- ============================================
DROP POLICY IF EXISTS "Activities belongs to company" ON activities;

-- ============================================
-- Step 2: Create proper per-operation policies
-- (same pattern as all other tables in 005_fix_all_rls_policies.sql)
-- ============================================
DROP POLICY IF EXISTS "Activities view by company" ON activities;
CREATE POLICY "Activities view by company" ON activities
    FOR SELECT USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Activities insert by company" ON activities;
CREATE POLICY "Activities insert by company" ON activities
    FOR INSERT WITH CHECK (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Activities update by company" ON activities;
CREATE POLICY "Activities update by company" ON activities
    FOR UPDATE USING (company_id = public.get_user_company_id());

DROP POLICY IF EXISTS "Activities delete by company" ON activities;
CREATE POLICY "Activities delete by company" ON activities
    FOR DELETE USING (company_id = public.get_user_company_id());

-- ============================================
-- Step 3: Add super admin full access
-- (same pattern as 008_add_superadmin_policies.sql)
-- ============================================
DROP POLICY IF EXISTS "Super admin full access to activities" ON activities;
CREATE POLICY "Super admin full access to activities" ON activities
    FOR ALL USING (public.get_user_role() = 'super_admin')
    WITH CHECK (public.get_user_role() = 'super_admin');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Activities RLS policies fixed successfully!' AS result;
