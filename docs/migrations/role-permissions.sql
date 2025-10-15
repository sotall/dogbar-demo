-- Role-based permissions: table, helpers, and RLS policies

-- 1) Helper: role_rank(role text) -> int
CREATE OR REPLACE FUNCTION public.role_rank(r text)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT CASE lower(r)
    WHEN 'super_admin' THEN 5
    WHEN 'admin' THEN 4
    WHEN 'manager' THEN 3
    WHEN 'staff' THEN 2
    WHEN 'viewer' THEN 1
    ELSE 0
  END;
$$;

-- 2) Helper: current_admin_role() -> text (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.current_admin_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.admin_users WHERE id = auth.uid() LIMIT 1;
$$;

-- 3) Permissions matrix table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role text NOT NULL,
  action_key text NOT NULL,
  allowed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT role_permissions_role_check CHECK (role IN ('super_admin','admin','manager','staff','viewer')),
  CONSTRAINT role_permissions_action_key_check CHECK (length(action_key) > 0),
  CONSTRAINT role_permissions_pk PRIMARY KEY (role, action_key)
);

-- 4) Row Level Security for role_permissions
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Only super_admins can modify the matrix
DROP POLICY IF EXISTS role_permissions_write ON public.role_permissions;
CREATE POLICY role_permissions_write
ON public.role_permissions FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.admin_users au
  WHERE au.id = auth.uid() AND au.role = 'super_admin' AND au.status = 'active'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.admin_users au
  WHERE au.id = auth.uid() AND au.role = 'super_admin' AND au.status = 'active'
));

-- Read access: any active admin can read (to drive UI)
DROP POLICY IF EXISTS role_permissions_read ON public.role_permissions;
CREATE POLICY role_permissions_read
ON public.role_permissions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.admin_users au
  WHERE au.id = auth.uid() AND au.status = 'active'
));

-- 5) Enforce role ceiling on admin_users DML
-- (Assumes existing SELECT policies: self-read + active admins)

-- INSERT: cannot create user with higher role than yourself
DROP POLICY IF EXISTS admin_users_insert_role_ceiling ON public.admin_users;
CREATE POLICY admin_users_insert_role_ceiling
ON public.admin_users FOR INSERT
WITH CHECK (public.role_rank(public.current_admin_role()) >= public.role_rank(role));

-- UPDATE: cannot set a user's role higher than yourself
DROP POLICY IF EXISTS admin_users_update_role_ceiling ON public.admin_users;
CREATE POLICY admin_users_update_role_ceiling
ON public.admin_users FOR UPDATE
USING (true)
WITH CHECK (public.role_rank(public.current_admin_role()) >= public.role_rank(role));

-- DELETE: can only delete users with a strictly lower role and never super_admins
DROP POLICY IF EXISTS admin_users_delete_lower_only ON public.admin_users;
CREATE POLICY admin_users_delete_lower_only
ON public.admin_users FOR DELETE
USING (
  role <> 'super_admin'
  AND public.role_rank(public.current_admin_role()) > public.role_rank(role)
);

-- 6) Seed sensible defaults (idempotent upserts)
-- Actions (initial set)
-- users, events, media, site_settings, logs, schema, dashboard, food_trucks
WITH actions(action_key) AS (
  SELECT * FROM (VALUES
    ('users.view'),('users.create'),('users.edit'),('users.delete'),
    ('users.invite'),('users.reset_password'),
    ('events.view'),('events.create'),('events.edit'),('events.delete'),('events.publish'),
    ('media.view'),('media.upload'),('media.delete'),
    ('site_settings.view'),('site_settings.edit'),
    ('logs.view'),('schema.view'),('dashboard.view'),
    ('food_trucks.view'),('food_trucks.create'),('food_trucks.edit'),('food_trucks.delete')
  ) v(action_key)
)
INSERT INTO public.role_permissions(role, action_key, allowed)
SELECT r.role, a.action_key,
  CASE r.role
    WHEN 'super_admin' THEN true
    WHEN 'admin' THEN (a.action_key NOT IN ('users.delete') AND a.action_key NOT IN ('users.create') = FALSE) OR (a.action_key NOT IN ('users.delete'))
    ELSE false
  END
FROM (VALUES ('super_admin'),('admin'),('manager'),('staff'),('viewer')) AS r(role)
CROSS JOIN actions a
ON CONFLICT (role, action_key) DO NOTHING;

-- Fine tune a few non-super roles
-- Admins can view users and edit non-role fields (app-level enforced), create/edit events/media, edit site settings
UPDATE public.role_permissions SET allowed = true WHERE role = 'admin' AND action_key IN (
  'users.view','events.view','events.create','events.edit','events.delete','events.publish',
  'media.view','media.upload','media.delete','site_settings.view','site_settings.edit',
  'dashboard.view','logs.view','schema.view','food_trucks.view','food_trucks.create','food_trucks.edit','food_trucks.delete'
);

-- Manager: manage events/media; view users, dashboard
UPDATE public.role_permissions SET allowed = true WHERE role = 'manager' AND action_key IN (
  'users.view','events.view','events.create','events.edit','events.delete','media.view','media.upload','media.delete','dashboard.view','food_trucks.view','food_trucks.create','food_trucks.edit'
);

-- Staff: limited editing, mostly content ops
UPDATE public.role_permissions SET allowed = true WHERE role = 'staff' AND action_key IN (
  'events.view','events.edit','media.view','media.upload','dashboard.view','food_trucks.view'
);

-- Viewer: read-only
UPDATE public.role_permissions SET allowed = true WHERE role = 'viewer' AND action_key IN (
  'events.view','media.view','dashboard.view','food_trucks.view','site_settings.view'
);


