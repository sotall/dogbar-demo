-- Fix ALL RLS policies to use is_admin_user() instead of has_any_role()
-- This fixes the broken JWT custom claims issue across all tables

-- ==========================================
-- 1. FIX site_content TABLE
-- ==========================================
DROP POLICY IF EXISTS "Admins can modify site content" ON site_content;

CREATE POLICY "Admins can modify site content"
ON site_content
FOR ALL
TO public
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- ==========================================
-- 2. FIX events TABLE
-- ==========================================
DROP POLICY IF EXISTS "Admins can manage events" ON events CASCADE;

CREATE POLICY "Admins can manage events"
ON events
FOR ALL
TO public
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- ==========================================
-- 3. FIX food_trucks TABLE  
-- ==========================================
DROP POLICY IF EXISTS "Admins can manage food trucks" ON food_trucks CASCADE;

CREATE POLICY "Admins can manage food trucks"
ON food_trucks
FOR ALL
TO public
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- ==========================================
-- 4. FIX admin_users TABLE
-- ==========================================
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users CASCADE;

CREATE POLICY "Admins can manage admin users"
ON admin_users
FOR ALL
TO public
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- ==========================================
-- 5. FIX audit_logs TABLE
-- ==========================================
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs CASCADE;

CREATE POLICY "Admins can view audit logs"
ON audit_logs
FOR SELECT
TO public
USING (is_admin_user());

-- ==========================================
-- VERIFICATION
-- ==========================================
SELECT 
  'UPDATED POLICIES' as status,
  tablename,
  policyname,
  SUBSTRING(qual::text, 1, 50) as using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND (policyname LIKE '%Admins%' OR policyname LIKE '%admin%')
ORDER BY tablename, policyname;

