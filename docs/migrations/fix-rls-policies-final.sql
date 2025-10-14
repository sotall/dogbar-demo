-- ================================================
-- FIX RLS POLICY VULNERABILITIES - FINAL
-- ================================================
-- This fixes the conflicting policies that allowed
-- unauthenticated access to admin_users table
-- ================================================

-- Drop all existing admin_users policies
DROP POLICY IF EXISTS "secure_admin_users_select" ON admin_users;
DROP POLICY IF EXISTS "admin_users_select_self" ON admin_users;
DROP POLICY IF EXISTS "admin_users_select_all" ON admin_users;
DROP POLICY IF EXISTS "secure_admin_users_insert" ON admin_users;
DROP POLICY IF EXISTS "secure_admin_users_update" ON admin_users;
DROP POLICY IF EXISTS "secure_admin_users_delete" ON admin_users;

-- Drop all existing events policies
DROP POLICY IF EXISTS "secure_events_select_published" ON events;
DROP POLICY IF EXISTS "events_select_published" ON events;
DROP POLICY IF EXISTS "secure_events_insert" ON events;
DROP POLICY IF EXISTS "secure_events_update" ON events;
DROP POLICY IF EXISTS "secure_events_delete" ON events;

-- ================================================
-- CREATE SECURITY DEFINER FUNCTION
-- ================================================
-- This avoids recursion issues in RLS policies
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- ADMIN_USERS POLICIES (SECURE)
-- ================================================

-- Only active admins can read admin_users
CREATE POLICY "admin_users_select_secure"
ON admin_users FOR SELECT
USING (is_admin_user());

-- Only super_admins can create users
CREATE POLICY "admin_users_insert_secure"
ON admin_users FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND status = 'active' 
    AND role = 'super_admin'
  )
);

-- Only active admins can update
CREATE POLICY "admin_users_update_secure"
ON admin_users FOR UPDATE
USING (is_admin_user());

-- Only super_admins can delete
CREATE POLICY "admin_users_delete_secure"
ON admin_users FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND status = 'active' 
    AND role = 'super_admin'
  )
);

-- ================================================
-- EVENTS POLICIES (SECURE)
-- ================================================

-- Public can read published events only
CREATE POLICY "events_select_published"
ON events FOR SELECT
USING (status = 'published');

-- Only active admins can insert
CREATE POLICY "events_insert_admin"
ON events FOR INSERT
WITH CHECK (is_admin_user());

-- Only active admins can update
CREATE POLICY "events_update_admin"
ON events FOR UPDATE
USING (is_admin_user());

-- Only active admins can delete
CREATE POLICY "events_delete_admin"
ON events FOR DELETE
USING (is_admin_user());

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
-- Test these queries to verify security:

-- Should return 0 when not logged in:
-- SELECT count(*) FROM admin_users;

-- Should return published events when not logged in:
-- SELECT count(*) FROM events WHERE status = 'published';

-- Should work when logged in as admin:
-- SELECT count(*) FROM admin_users;

-- Should block updates when not logged in:
-- UPDATE events SET title = 'test' WHERE id = '00000000-0000-0000-0000-000000000000';
