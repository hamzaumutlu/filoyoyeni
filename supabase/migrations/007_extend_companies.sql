-- ============================================
-- Extend companies table with contact details
-- ============================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website TEXT;

SELECT 'Companies table extended with phone, address, tax_id, website columns!' AS result;
