-- ============================================
-- Filoyo CRM - Fix ALL RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- PERSONNEL POLICIES - Fix with helper function
-- ============================================
DROP POLICY IF EXISTS "Personnel view by company" ON personnel;
DROP POLICY IF EXISTS "Personnel insert by company" ON personnel;
DROP POLICY IF EXISTS "Personnel update by company" ON personnel;
DROP POLICY IF EXISTS "Personnel delete by company" ON personnel;
DROP POLICY IF EXISTS "Personnel belongs to company" ON personnel;

CREATE POLICY "Personnel view by company" ON personnel
    FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Personnel insert by company" ON personnel
    FOR INSERT WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Personnel update by company" ON personnel
    FOR UPDATE USING (company_id = public.get_user_company_id());

CREATE POLICY "Personnel delete by company" ON personnel
    FOR DELETE USING (company_id = public.get_user_company_id());

-- ============================================
-- ADVANCES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Advances view by company" ON advances;
DROP POLICY IF EXISTS "Advances insert by company" ON advances;
DROP POLICY IF EXISTS "Advances update by company" ON advances;
DROP POLICY IF EXISTS "Advances delete by company" ON advances;
DROP POLICY IF EXISTS "Advances belongs to company" ON advances;

CREATE POLICY "Advances view by company" ON advances
    FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Advances insert by company" ON advances
    FOR INSERT WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Advances update by company" ON advances
    FOR UPDATE USING (company_id = public.get_user_company_id());

CREATE POLICY "Advances delete by company" ON advances
    FOR DELETE USING (company_id = public.get_user_company_id());

-- ============================================
-- METHODS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Methods view by company" ON methods;
DROP POLICY IF EXISTS "Methods insert by company" ON methods;
DROP POLICY IF EXISTS "Methods update by company" ON methods;
DROP POLICY IF EXISTS "Methods delete by company" ON methods;
DROP POLICY IF EXISTS "Methods belongs to company" ON methods;

CREATE POLICY "Methods view by company" ON methods
    FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Methods insert by company" ON methods
    FOR INSERT WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Methods update by company" ON methods
    FOR UPDATE USING (company_id = public.get_user_company_id());

CREATE POLICY "Methods delete by company" ON methods
    FOR DELETE USING (company_id = public.get_user_company_id());

-- ============================================
-- DATA ENTRIES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Data entries view by company" ON data_entries;
DROP POLICY IF EXISTS "Data entries insert by company" ON data_entries;
DROP POLICY IF EXISTS "Data entries update by company" ON data_entries;
DROP POLICY IF EXISTS "Data entries delete by company" ON data_entries;
DROP POLICY IF EXISTS "Data entries belongs to company" ON data_entries;

CREATE POLICY "Data entries view by company" ON data_entries
    FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Data entries insert by company" ON data_entries
    FOR INSERT WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Data entries update by company" ON data_entries
    FOR UPDATE USING (company_id = public.get_user_company_id());

CREATE POLICY "Data entries delete by company" ON data_entries
    FOR DELETE USING (company_id = public.get_user_company_id());

-- ============================================
-- PAYMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Payments view by company" ON payments;
DROP POLICY IF EXISTS "Payments insert by company" ON payments;
DROP POLICY IF EXISTS "Payments update by company" ON payments;
DROP POLICY IF EXISTS "Payments delete by company" ON payments;
DROP POLICY IF EXISTS "Payments belongs to company" ON payments;

CREATE POLICY "Payments view by company" ON payments
    FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Payments insert by company" ON payments
    FOR INSERT WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Payments update by company" ON payments
    FOR UPDATE USING (company_id = public.get_user_company_id());

CREATE POLICY "Payments delete by company" ON payments
    FOR DELETE USING (company_id = public.get_user_company_id());

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'All RLS policies fixed successfully!' AS result;
