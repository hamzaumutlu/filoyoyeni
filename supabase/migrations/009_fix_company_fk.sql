-- ============================================
-- Filoyo CRM - Fix Company ID Foreign Key Issue
-- Run ALL of this in Supabase SQL Editor
-- ============================================

-- Step 1: Create the fallback/demo company (used when user has no company)
INSERT INTO companies (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Filoyo Demo')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Fix any users whose company_id doesn't exist in companies table
UPDATE users
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL
   OR company_id NOT IN (SELECT id FROM companies);

-- Step 3: Verify - show final state
SELECT u.id, u.email, u.role, u.company_id, c.name as company_name
FROM users u
LEFT JOIN companies c ON c.id = u.company_id;

SELECT 'Fix completed! All users now have valid company_id.' AS result;
