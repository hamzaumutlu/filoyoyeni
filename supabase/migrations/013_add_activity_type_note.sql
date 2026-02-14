-- ============================================
-- Filoyo CRM - Add Activity Type & Note columns
-- Run this in Supabase SQL Editor
-- ============================================

ALTER TABLE activities ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Gelir' CHECK (type IN ('Gelir', 'Gider'));
ALTER TABLE activities ADD COLUMN IF NOT EXISTS note TEXT;

SELECT 'Activity type & note columns added successfully!' AS result;
