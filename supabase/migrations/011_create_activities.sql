-- ============================================
-- Filoyo CRM - Activities Table Migration
-- Aktiviteler tablosu (Dashboard Son Aktiviteler)
-- ============================================

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    activity TEXT NOT NULL,
    order_id TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME NOT NULL DEFAULT CURRENT_TIME,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'Beklemede' CHECK (status IN ('Tamamlandı', 'Beklemede', 'İptal')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activities_company ON activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_company_date ON activities(company_id, date);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policy (same pattern as other tables)
CREATE POLICY "Activities belongs to company" ON activities
    FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

SELECT 'Activities table created successfully!' AS result;
