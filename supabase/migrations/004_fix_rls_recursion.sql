-- ============================================
-- Filoyo CRM - Fix RLS Recursion Issue
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop problematic policies on users table
DROP POLICY IF EXISTS "Super admin full access to users" ON users;
DROP POLICY IF EXISTS "Admins can view company users" ON users;
DROP POLICY IF EXISTS "Allow user self-insert" ON users;

-- ============================================
-- Create helper function to get user's company_id
-- This avoids recursive RLS checks
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- USERS TABLE - Fixed Policies (No Recursion)
-- ============================================

-- Users can always view their own record
CREATE POLICY "Users can view own record" ON users
    FOR SELECT USING (id = auth.uid());

-- Users can view others in same company (using helper function)
CREATE POLICY "Users can view company users" ON users
    FOR SELECT USING (company_id = public.get_user_company_id());

-- Super admins can see all users
CREATE POLICY "Super admin full access to users" ON users
    FOR ALL USING (public.get_user_role() = 'super_admin');

-- Allow inserting own user record during signup
CREATE POLICY "Allow user self-insert" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- Users can update their own record
CREATE POLICY "Users can update own record" ON users
    FOR UPDATE USING (id = auth.uid());

-- ============================================
-- Fix companies policies too
-- ============================================
DROP POLICY IF EXISTS "Super admin full access to companies" ON companies;
DROP POLICY IF EXISTS "Users can view own company" ON companies;

CREATE POLICY "Users can view own company" ON companies
    FOR SELECT USING (id = public.get_user_company_id());

CREATE POLICY "Super admin full access to companies" ON companies
    FOR ALL USING (public.get_user_role() = 'super_admin');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'RLS recursion fix applied successfully!' AS result;
