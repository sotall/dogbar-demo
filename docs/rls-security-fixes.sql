-- ================================================
-- RLS Security Fixes - Critical Vulnerabilities
-- ================================================
-- Fixes 3 vulnerabilities found in security audit:
-- 1. admin_users table publicly readable
-- 2. Unauthenticated users can update events  
-- 3. Unauthenticated users can delete events
-- ================================================
-- Date: 2025-10-14
-- Security Test Results: 3 CRITICAL vulnerabilities found
-- ================================================

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ================================================
-- FIX #1: Secure admin_users table
-- ================================================

-- Drop any existing permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON admin_users;
DROP POLICY IF EXISTS "Public read access" ON admin_users;
DROP POLICY IF EXISTS "Allow public read" ON admin_users;

-- Only authenticated admins can read admin_users
CREATE POLICY "Admins can read admin_users"
ON admin_users FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

-- Only super admins can insert new admin users
CREATE POLICY "Super admins can insert admin_users"
ON admin_users FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active' AND role = 'super_admin'
  )
);

-- Only admins can update admin users
CREATE POLICY "Admins can update admin_users"
ON admin_users FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

-- Only super admins can delete admin users
CREATE POLICY "Super admins can delete admin_users"
ON admin_users FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active' AND role = 'super_admin'
  )
);

-- ================================================
-- FIX #2 & #3: Secure events table
-- ================================================

-- Drop any existing permissive update/delete policies
DROP POLICY IF EXISTS "Enable update for all users" ON events;
DROP POLICY IF EXISTS "Enable delete for all users" ON events;
DROP POLICY IF EXISTS "Public can update events" ON events;
DROP POLICY IF EXISTS "Public can delete events" ON events;
DROP POLICY IF EXISTS "Allow public update" ON events;
DROP POLICY IF EXISTS "Allow public delete" ON events;

-- Public can read ONLY published events
DROP POLICY IF EXISTS "Public can read events" ON events;
DROP POLICY IF EXISTS "Public can read published events" ON events;
CREATE POLICY "Public can read published events"
ON events FOR SELECT
USING (status = 'published');

-- Only authenticated admins can insert events
CREATE POLICY "Admins can insert events"
ON events FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

-- Only authenticated admins can update events
CREATE POLICY "Admins can update events"
ON events FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

-- Only authenticated admins can delete events
CREATE POLICY "Admins can delete events"
ON events FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

-- ================================================
-- Verification Queries
-- ================================================
-- Run these to verify policies are working:

-- Should return current policies on admin_users:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'admin_users';

-- Should return current policies on events:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'events';

-- Test anonymous access (should return 0 rows):
-- SELECT count(*) FROM admin_users;

-- ================================================
-- IMPORTANT: After applying these policies
-- ================================================
-- 1. Re-run security test at: http://localhost:5173/test-security.html
-- 2. Verify all 3 vulnerabilities now show BLOCKED
-- 3. Test admin portal still works for authenticated users
-- 4. Test public site still displays published events
-- ================================================

