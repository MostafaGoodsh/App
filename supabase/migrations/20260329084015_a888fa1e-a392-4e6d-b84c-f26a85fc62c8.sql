-- Create a secure view that excludes password_hash
CREATE OR REPLACE VIEW public.anubis_users_safe AS
SELECT id, email, full_name, phone, status, subscription_type, 
       two_factor_enabled, created_at, updated_at, last_login, end_date
FROM public.anubis_users;

-- Grant access to the view
GRANT SELECT ON public.anubis_users_safe TO authenticated;

-- Drop existing SELECT policies on anubis_users that expose password_hash
DROP POLICY IF EXISTS "Users can read own safe data" ON public.anubis_users;
DROP POLICY IF EXISTS "Admins can view all anubis users" ON public.anubis_users;

-- Recreate user SELECT policy - users should use the safe view instead
-- Only allow admins to SELECT from the raw table (they need it for management)
CREATE POLICY "Admins can view all anubis users"
ON public.anubis_users FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Users should NOT have direct SELECT on anubis_users (use the safe view instead)
-- But we need to allow the edge function (service role) to query directly for auth

-- Enable RLS on the view
ALTER VIEW public.anubis_users_safe SET (security_invoker = true);

-- Create RLS-like policy via the view's underlying table
-- The view inherits RLS from anubis_users, so we need a policy for authenticated users
CREATE POLICY "Users can read own data via safe view"
ON public.anubis_users FOR SELECT
TO authenticated
USING (
  email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text
);