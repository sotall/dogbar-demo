-- ================================================
-- Optimized RLS Policies (No Recursion)
-- ================================================
-- This fixes the infinite recursion by using a simpler approach
-- ================================================

-- Drop existing policies
DROP POLICY IF EXISTS "secure_admin_users_select" ON admin_users;
DROP POLICY IF EXISTS "secure_admin_users_insert" ON admin_users;
DROP POLICY IF EXISTS "secure_admin_users_update" ON admin_users;
DROP POLICY IF EXISTS "secure_admin_users_delete" ON admin_users;

DROP POLICY IF EXISTS "secure_events_select_published" ON events;
DROP POLICY IF EXISTS "secure_events_insert" ON events;
DROP POLICY IF EXISTS "secure_events_update" ON events;
DROP POLICY IF EXISTS "secure_events_delete" ON events;

-- ================================================
-- admin_users - Simple approach (no recursion)
-- ================================================

-- SELECT: Only authenticated users can read admin_users
CREATE POLICY "admin_users_select_auth"
ON admin_users FOR SELECT
USING (auth.uid() IS NOT NULL);

-- INSERT: Only authenticated users can insert
CREATE POLICY "admin_users_insert_auth"
ON admin_users FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Only authenticated users can update
CREATE POLICY "admin_users_update_auth"
ON admin_users FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- DELETE: Only authenticated users can delete
CREATE POLICY "admin_users_delete_auth"
ON admin_users FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ================================================
-- events - Public read published, auth write
-- ================================================

-- SELECT: Public can read published events
CREATE POLICY "events_select_published"
ON events FOR SELECT
USING (status = 'published');

-- INSERT: Only authenticated users can insert
CREATE POLICY "events_insert_auth"
ON events FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Only authenticated users can update
CREATE POLICY "events_update_auth"
ON events FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- DELETE: Only authenticated users can delete
CREATE POLICY "events_delete_auth"
ON events FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ================================================
-- Verification
-- ================================================
-- Test these queries:

-- Should return 0 (blocked) when not logged in:
-- SELECT count(*) FROM admin_users;

-- Should return published events when not logged in:
-- SELECT count(*) FROM events WHERE status = 'published';

-- Should work when logged in as admin:
-- SELECT count(*) FROM admin_users;
