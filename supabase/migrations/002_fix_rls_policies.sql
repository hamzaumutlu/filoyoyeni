-- ============================================
-- Filoyo CRM - Fix RLS Policies
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Users can manage own company data" ON users;
DROP POLICY IF EXISTS "Personnel belongs to company" ON personnel;
DROP POLICY IF EXISTS "Advances belongs to company" ON advances;
DROP POLICY IF EXISTS "Methods belongs to company" ON methods;
DROP POLICY IF EXISTS "Data entries belongs to company" ON data_entries;
DROP POLICY IF EXISTS "Payments belongs to company" ON payments;

-- ============================================
-- COMPANIES POLICIES
-- ============================================
-- Super admins can see all companies
CREATE POLICY "Super admin full access to companies" ON companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Regular users can see their own company
CREATE POLICY "Users can view own company" ON companies
    FOR SELECT USING (
        id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- ============================================
-- USERS POLICIES
-- ============================================
-- Super admins can manage all users
CREATE POLICY "Super admin full access to users" ON users
    FOR ALL USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
    );

-- Admins can view users in their company
CREATE POLICY "Admins can view company users" ON users
    FOR SELECT USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- Allow inserting own user record during signup
CREATE POLICY "Allow user self-insert" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================
-- PERSONNEL POLICIES
-- ============================================
CREATE POLICY "Personnel view by company" ON personnel
    FOR SELECT USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Personnel insert by company" ON personnel
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Personnel update by company" ON personnel
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Personnel delete by company" ON personnel
    FOR DELETE USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- ============================================
-- ADVANCES POLICIES
-- ============================================
CREATE POLICY "Advances view by company" ON advances
    FOR SELECT USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Advances insert by company" ON advances
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Advances update by company" ON advances
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Advances delete by company" ON advances
    FOR DELETE USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- ============================================
-- METHODS POLICIES
-- ============================================
CREATE POLICY "Methods view by company" ON methods
    FOR SELECT USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Methods insert by company" ON methods
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Methods update by company" ON methods
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Methods delete by company" ON methods
    FOR DELETE USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- ============================================
-- DATA ENTRIES POLICIES
-- ============================================
CREATE POLICY "Data entries view by company" ON data_entries
    FOR SELECT USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Data entries insert by company" ON data_entries
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Data entries update by company" ON data_entries
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Data entries delete by company" ON data_entries
    FOR DELETE USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- ============================================
-- PAYMENTS POLICIES
-- ============================================
CREATE POLICY "Payments view by company" ON payments
    FOR SELECT USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Payments insert by company" ON payments
    FOR INSERT WITH CHECK (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Payments update by company" ON payments
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Payments delete by company" ON payments
    FOR DELETE USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- ============================================
-- INITIAL DATA: Create default company and link existing auth user
-- ============================================

-- Create default company if not exists
INSERT INTO companies (id, name, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Varsayılan Firma', 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'RLS policies updated successfully!' AS result;
