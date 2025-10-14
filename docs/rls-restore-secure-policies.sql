-- ================================================
-- RESTORE SECURE RLS POLICIES
-- ================================================
-- The "optimized" policies were too permissive
-- This restores the working secure policies
-- ================================================

-- Drop the permissive policies
DROP POLICY IF EXISTS "admin_users_select_auth" ON admin_users;
DROP POLICY IF EXISTS "admin_users_insert_auth" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_auth" ON admin_users;
DROP POLICY IF EXISTS "admin_users_delete_auth" ON admin_users;

DROP POLICY IF EXISTS "events_select_published" ON events;
DROP POLICY IF EXISTS "events_insert_auth" ON events;
DROP POLICY IF EXISTS "events_update_auth" ON events;
DROP POLICY IF EXISTS "events_delete_auth" ON events;

-- ================================================
-- RESTORE SECURE POLICIES (Working Version)
-- ================================================

-- admin_users - Only authenticated admins can access
CREATE POLICY "secure_admin_users_select"
ON admin_users FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

CREATE POLICY "secure_admin_users_insert"
ON admin_users FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active' AND role = 'super_admin'
  )
);

CREATE POLICY "secure_admin_users_update"
ON admin_users FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

CREATE POLICY "secure_admin_users_delete"
ON admin_users FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active' AND role = 'super_admin'
  )
);

-- events - Public read published, admin write
CREATE POLICY "secure_events_select_published"
ON events FOR SELECT
USING (status = 'published');

CREATE POLICY "secure_events_insert"
ON events FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

CREATE POLICY "secure_events_update"
ON events FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

CREATE POLICY "secure_events_delete"
ON events FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM admin_users WHERE status = 'active'
  )
);

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
