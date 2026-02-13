-- ============================================
-- Filoyo CRM - Add Super Admin Full Access to ALL Tables
-- Run this in Supabase SQL Editor
-- ============================================
-- Problem: Companies table has super_admin policy but
-- methods, payments, personnel, advances, data_entries do not.
-- This causes super_admin users to be blocked from inserting
-- into these tables when their company_id is NULL or mismatched.
-- ============================================

-- ============================================
-- METHODS - Super Admin Full Access
-- ============================================
DROP POLICY IF EXISTS "Super admin full access to methods" ON methods;
CREATE POLICY "Super admin full access to methods" ON methods
    FOR ALL USING (public.get_user_role() = 'super_admin')
    WITH CHECK (public.get_user_role() = 'super_admin');

-- ============================================
-- PAYMENTS - Super Admin Full Access
-- ============================================
DROP POLICY IF EXISTS "Super admin full access to payments" ON payments;
CREATE POLICY "Super admin full access to payments" ON payments
    FOR ALL USING (public.get_user_role() = 'super_admin')
    WITH CHECK (public.get_user_role() = 'super_admin');

-- ============================================
-- PERSONNEL - Super Admin Full Access
-- ============================================
DROP POLICY IF EXISTS "Super admin full access to personnel" ON personnel;
CREATE POLICY "Super admin full access to personnel" ON personnel
    FOR ALL USING (public.get_user_role() = 'super_admin')
    WITH CHECK (public.get_user_role() = 'super_admin');

-- ============================================
-- ADVANCES - Super Admin Full Access
-- ============================================
DROP POLICY IF EXISTS "Super admin full access to advances" ON advances;
CREATE POLICY "Super admin full access to advances" ON advances
    FOR ALL USING (public.get_user_role() = 'super_admin')
    WITH CHECK (public.get_user_role() = 'super_admin');

-- ============================================
-- DATA ENTRIES - Super Admin Full Access
-- ============================================
DROP POLICY IF EXISTS "Super admin full access to data_entries" ON data_entries;
CREATE POLICY "Super admin full access to data_entries" ON data_entries
    FOR ALL USING (public.get_user_role() = 'super_admin')
    WITH CHECK (public.get_user_role() = 'super_admin');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Super admin full access policies added to all tables!' AS result;
