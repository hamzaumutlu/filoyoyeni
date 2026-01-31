-- ============================================
-- Filoyo CRM - Auto-create user record trigger
-- Run this in Supabase SQL Editor
-- ============================================

-- Create function to auto-insert user record when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, company_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
        COALESCE(
            (NEW.raw_user_meta_data->>'company_id')::uuid,
            '00000000-0000-0000-0000-000000000001'::uuid
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create user record
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Manually insert existing auth users into users table
-- This fixes users who registered before this trigger
-- ============================================
INSERT INTO public.users (id, email, role, company_id)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'admin'),
    COALESCE(
        (au.raw_user_meta_data->>'company_id')::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid
    )
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'User auto-creation trigger installed and existing users synced!' AS result;
