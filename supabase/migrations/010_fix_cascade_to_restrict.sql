-- ============================================
-- Filoyo CRM - Change CASCADE to RESTRICT
-- Prevents deleting a company from removing all associated data
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: First recreate the fallback company (in case it was deleted)
INSERT INTO companies (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Filoyo Demo')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Fix users with invalid company_id
UPDATE users
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL
   OR company_id NOT IN (SELECT id FROM companies);

-- Step 3: Change METHODS foreign key from CASCADE to RESTRICT
ALTER TABLE methods DROP CONSTRAINT IF EXISTS methods_company_id_fkey;
ALTER TABLE methods ADD CONSTRAINT methods_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT;

-- Step 4: Change PAYMENTS foreign key from CASCADE to RESTRICT
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_company_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT;

-- Step 5: Change PERSONNEL foreign key from CASCADE to RESTRICT
ALTER TABLE personnel DROP CONSTRAINT IF EXISTS personnel_company_id_fkey;
ALTER TABLE personnel ADD CONSTRAINT personnel_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT;

-- Step 6: Change ADVANCES foreign key from CASCADE to RESTRICT
ALTER TABLE advances DROP CONSTRAINT IF EXISTS advances_company_id_fkey;
ALTER TABLE advances ADD CONSTRAINT advances_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT;

-- Step 7: Change DATA_ENTRIES foreign key from CASCADE to RESTRICT
ALTER TABLE data_entries DROP CONSTRAINT IF EXISTS data_entries_company_id_fkey;
ALTER TABLE data_entries ADD CONSTRAINT data_entries_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT;

-- Step 8: Change USERS foreign key from CASCADE to RESTRICT
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_company_id_fkey;
ALTER TABLE users ADD CONSTRAINT users_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT;

SELECT 'All CASCADE constraints changed to RESTRICT! Companies can no longer be deleted if they have associated data.' AS result;
