-- ================================================
-- RLS Complete Cleanup and Security Fix
-- ================================================
-- This script will:
-- 1. DROP ALL existing policies on admin_users and events
-- 2. CREATE only the secure policies we need
-- ================================================

-- ================================================
-- STEP 1: Drop ALL existing policies
-- ================================================

-- Drop ALL admin_users policies
DROP POLICY IF EXISTS "Enable read access for all users" ON admin_users;
DROP POLICY IF EXISTS "Public read access" ON admin_users;
DROP POLICY IF EXISTS "Allow public read" ON admin_users;
DROP POLICY IF EXISTS "Admin users can view their own data" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Only super admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can update admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete admin_users" ON admin_users;
DROP POLICY IF EXISTS "admin_users_delete_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_insert_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_select_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_self" ON admin_users;

-- Drop ALL events policies
DROP POLICY IF EXISTS "Enable update for all users" ON events;
DROP POLICY IF EXISTS "Enable delete for all users" ON events;
DROP POLICY IF EXISTS "Public can update events" ON events;
DROP POLICY IF EXISTS "Public can delete events" ON events;
DROP POLICY IF EXISTS "Allow public update" ON events;
DROP POLICY IF EXISTS "Allow public delete" ON events;
DROP POLICY IF EXISTS "Public can read events" ON events;
DROP POLICY IF EXISTS "Public can read published events" ON events;
DROP POLICY IF EXISTS "Admins can insert events" ON events;
DROP POLICY IF EXISTS "Admins can update events" ON events;
DROP POLICY IF EXISTS "Admins can delete events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Only super admins can delete events" ON events;

-- Enable RLS (if not already enabled)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ================================================
-- STEP 2: Create ONLY secure policies
-- ================================================

-- ================================================
-- admin_users table - Super restrictive
-- ================================================

-- SELECT: Only authenticated admins can read admin_users
CREATE POLICY "secure_admin_users_select"
ON admin_users FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

-- INSERT: Only super admins can create new admin users
CREATE POLICY "secure_admin_users_insert"
ON admin_users FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active' AND role = 'super_admin'
  )
);

-- UPDATE: Only active admins can update admin users
CREATE POLICY "secure_admin_users_update"
ON admin_users FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

-- DELETE: Only super admins can delete admin users
CREATE POLICY "secure_admin_users_delete"
ON admin_users FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active' AND role = 'super_admin'
  )
);

-- ================================================
-- events table - Public read, admin write
-- ================================================

-- SELECT: Public can ONLY read published events
CREATE POLICY "secure_events_select_published"
ON events FOR SELECT
USING (status = 'published');

-- INSERT: Only authenticated admins can create events
CREATE POLICY "secure_events_insert"
ON events FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

-- UPDATE: Only authenticated admins can update events
CREATE POLICY "secure_events_update"
ON events FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

-- DELETE: Only authenticated admins can delete events
CREATE POLICY "secure_events_delete"
ON events FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

-- ================================================
-- Verification Queries
-- ================================================
-- Run these after to verify:

-- Should show only our 4 new admin_users policies:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'admin_users' ORDER BY policyname;

-- Should show only our 4 new events policies:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'events' ORDER BY policyname;

-- Test that anonymous access is blocked:
-- SELECT count(*) FROM admin_users; -- Should return 0 or error

