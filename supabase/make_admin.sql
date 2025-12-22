-- SQL script to promote a user to admin role

-- 1. Replace 'target_email@example.com' with the actual email address of the user.
-- 2. Run this script in your Supabase SQL Editor.

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'target_email@example.com';

-- Verify the update
SELECT * FROM public.profiles WHERE email = 'target_email@example.com';
