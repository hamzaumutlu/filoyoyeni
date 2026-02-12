-- ============================================
-- Filoyo CRM - Database Schema Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS TABLE (linked to Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PERSONNEL TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS personnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    base_salary DECIMAL(12, 2) NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADVANCES TABLE (Avans)
-- ============================================
CREATE TABLE IF NOT EXISTS advances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personnel_id UUID NOT NULL REFERENCES personnel(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- METHODS TABLE (Yolcu360, Enuygun, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    entry_commission DECIMAL(5, 2) NOT NULL DEFAULT 0,
    exit_commission DECIMAL(5, 2) NOT NULL DEFAULT 0,
    delivery_commission DECIMAL(5, 2) NOT NULL DEFAULT 0,
    opening_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    group_chat_link TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DATA ENTRIES TABLE (Excel-like grid)
-- ============================================
CREATE TABLE IF NOT EXISTS data_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    method_id UUID NOT NULL REFERENCES methods(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    supplement DECIMAL(12, 2) DEFAULT 0,
    entry DECIMAL(12, 2) DEFAULT 0,
    exit DECIMAL(12, 2) DEFAULT 0,
    commission DECIMAL(12, 2) DEFAULT 0,
    payment DECIMAL(12, 2) DEFAULT 0,
    delivery DECIMAL(12, 2) DEFAULT 0,
    description TEXT,
    balance DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS TABLE (General Expenses)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    method_id UUID REFERENCES methods(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_personnel_company ON personnel(company_id);
CREATE INDEX IF NOT EXISTS idx_advances_personnel ON advances(personnel_id);
CREATE INDEX IF NOT EXISTS idx_advances_company_date ON advances(company_id, date);
CREATE INDEX IF NOT EXISTS idx_methods_company ON methods(company_id);
CREATE INDEX IF NOT EXISTS idx_data_entries_method ON data_entries(method_id);
CREATE INDEX IF NOT EXISTS idx_data_entries_company_date ON data_entries(company_id, date);
CREATE INDEX IF NOT EXISTS idx_payments_company ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method_id);

-- ============================================
-- ROW LEVEL SECURITY (Multi-tenant)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their company's data
CREATE POLICY "Users can view own company" ON companies
    FOR ALL USING (id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage own company data" ON users
    FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Personnel belongs to company" ON personnel
    FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Advances belongs to company" ON advances
    FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Methods belongs to company" ON methods
    FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Data entries belongs to company" ON data_entries
    FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Payments belongs to company" ON payments
    FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS data_entries_updated_at ON data_entries;
CREATE TRIGGER data_entries_updated_at
    BEFORE UPDATE ON data_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Filoyo CRM database schema created successfully!' AS result;
