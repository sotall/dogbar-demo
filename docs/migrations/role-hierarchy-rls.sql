-- Role Hierarchy RLS Policies
-- Ensures users can only edit permissions for roles below their own rank
-- Prevents privilege escalation and accidental lockouts

-- Helper function to get current admin user's role
CREATE OR REPLACE FUNCTION current_admin_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT role FROM admin_users WHERE id = auth.uid() AND status = 'active';
$$;

-- Drop existing permissive policies
DROP POLICY IF EXISTS role_permissions_update ON public.role_permissions;
DROP POLICY IF EXISTS role_permissions_insert ON public.role_permissions;
DROP POLICY IF EXISTS role_permissions_delete ON public.role_permissions;

-- SELECT: Super admins and admins can view all permissions
-- (Keep existing SELECT policy as-is - it should already exist)

-- UPDATE: Only allow updating roles with lower rank than current user
CREATE POLICY role_permissions_update_hierarchy
ON public.role_permissions FOR UPDATE
USING (
  -- User must be super_admin or admin
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.id = auth.uid() 
    AND au.status = 'active'
    AND au.role IN ('super_admin', 'admin')
  )
  -- Target role must have lower rank than current user's role
  AND public.role_rank(role) < public.role_rank(public.current_admin_role())
)
WITH CHECK (
  -- Maintain same conditions for the updated row
  public.role_rank(role) < public.role_rank(public.current_admin_role())
  -- Super admin permissions must always be true (existing constraint handles this)
);

-- INSERT: Only allow creating permissions for lower-rank roles
CREATE POLICY role_permissions_insert_hierarchy
ON public.role_permissions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.id = auth.uid() 
    AND au.status = 'active'
    AND au.role = 'super_admin'
  )
  AND public.role_rank(role) < public.role_rank(public.current_admin_role())
  AND (role <> 'super_admin' OR allowed = true)
);

-- DELETE: Only allow deleting permissions for lower-rank roles
CREATE POLICY role_permissions_delete_hierarchy
ON public.role_permissions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.id = auth.uid() 
    AND au.status = 'active'
    AND au.role = 'super_admin'
  )
  AND public.role_rank(role) < public.role_rank(public.current_admin_role())
  AND role <> 'super_admin'
);

-- Additional safeguard: Prevent users from elevating their own role
CREATE POLICY admin_users_no_self_rank_change
ON public.admin_users FOR UPDATE
USING (
  -- Allow if not updating self, or if updating self but not changing role
  id != auth.uid() 
  OR role = (SELECT role FROM public.admin_users WHERE id = auth.uid())
)
WITH CHECK (
  -- If updating self, new role rank must not exceed old role rank
  id != auth.uid() 
  OR public.role_rank(role) <= public.role_rank((SELECT role FROM public.admin_users WHERE id = auth.uid()))
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION current_admin_role() TO authenticated;
GRANT EXECUTE ON FUNCTION role_rank(TEXT) TO authenticated;
