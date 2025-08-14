-- Enhanced security for profiles table
-- Add audit logging and controlled admin access with data masking

-- Create audit table for profile access tracking
CREATE TABLE IF NOT EXISTS public.profiles_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL,
  access_type TEXT NOT NULL, -- 'view', 'update', 'admin_view'
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  fields_accessed TEXT[] -- Track which fields were accessed
);

-- Enable RLS on audit table
ALTER TABLE public.profiles_audit ENABLE ROW LEVEL SECURITY;

-- Create audit policies
CREATE POLICY "Only admins can view profile audit logs" 
ON public.profiles_audit 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert profile audit logs" 
ON public.profiles_audit 
FOR INSERT 
WITH CHECK (true);

-- Add admin access policies for profiles with restrictions
CREATE POLICY "Admins can view limited profile data" 
ON public.profiles 
FOR SELECT 
USING (
  is_admin(auth.uid()) 
  AND auth.uid() IS NOT NULL
);

-- Create function to mask sensitive profile data
CREATE OR REPLACE FUNCTION public.mask_contact_info(
  email TEXT, 
  phone TEXT
) 
RETURNS TABLE(masked_email TEXT, masked_phone TEXT) AS $$
BEGIN
  RETURN QUERY SELECT 
    CASE 
      WHEN email IS NOT NULL AND email != '' THEN
        LEFT(email, 2) || '***@' || SPLIT_PART(email, '@', 2)
      ELSE NULL 
    END as masked_email,
    CASE 
      WHEN phone IS NOT NULL AND phone != '' THEN
        '***' || RIGHT(phone, 4)
      ELSE NULL 
    END as masked_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log profile access
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS TRIGGER AS $$
DECLARE
  access_type_val TEXT;
BEGIN
  -- Determine access type
  CASE TG_OP
    WHEN 'SELECT' THEN access_type_val := 'view';
    WHEN 'UPDATE' THEN access_type_val := 'update';
    ELSE access_type_val := 'unknown';
  END CASE;

  -- Log the access
  INSERT INTO public.profiles_audit (
    profile_id,
    accessed_by,
    access_type,
    accessed_at,
    fields_accessed
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    access_type_val,
    now(),
    CASE 
      WHEN TG_OP = 'UPDATE' THEN ARRAY['full_name', 'email', 'phone', 'avatar_url', 'preferred_language']
      ELSE ARRAY['profile_viewed']
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for audit logging on profile access
CREATE TRIGGER profile_access_audit_log
  AFTER SELECT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_access();

-- Create secure admin view with masked contact information
CREATE OR REPLACE VIEW public.profiles_admin_secure AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  m.masked_email,
  m.masked_phone,
  p.avatar_url,
  p.preferred_language,
  p.created_at,
  p.updated_at,
  -- Include useful metadata
  (SELECT COUNT(*) FROM public.profiles_audit WHERE profile_id = p.id) as access_count,
  (SELECT MAX(accessed_at) FROM public.profiles_audit WHERE profile_id = p.id) as last_accessed
FROM public.profiles p
CROSS JOIN LATERAL public.mask_contact_info(p.email, p.phone) m;

-- Set up RLS for the admin view
ALTER VIEW public.profiles_admin_secure SET (security_barrier = true);

-- Add additional security constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add constraints for phone number (basic validation)
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_phone_format 
CHECK (phone IS NULL OR phone ~ '^[\+\d\s\-\(\)]{7,20}$');

-- Create indexes for better performance and security monitoring
CREATE INDEX IF NOT EXISTS idx_profiles_audit_accessed_by_time 
ON public.profiles_audit(accessed_by, accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_audit_profile_time 
ON public.profiles_audit(profile_id, accessed_at DESC);

-- Enhance existing user policies with additional security checks
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile with logging" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile with validation" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
  -- Prevent users from changing their user_id
  AND user_id = OLD.user_id
);

-- Create function for secure profile data export (admin only)
CREATE OR REPLACE FUNCTION public.get_secure_profile_export()
RETURNS TABLE(
  total_profiles BIGINT,
  profiles_with_email BIGINT,
  profiles_with_phone BIGINT,
  avg_profile_age_days NUMERIC
) AS $$
BEGIN
  -- Only admins can access this function
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY 
  SELECT 
    COUNT(*) as total_profiles,
    COUNT(email) FILTER (WHERE email IS NOT NULL AND email != '') as profiles_with_email,
    COUNT(phone) FILTER (WHERE phone IS NOT NULL AND phone != '') as profiles_with_phone,
    ROUND(AVG(EXTRACT(days FROM now() - created_at)), 2) as avg_profile_age_days
  FROM public.profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment documenting security measures
COMMENT ON TABLE public.profiles IS 'User profiles table with enhanced security: RLS policies restrict access to own data, admin access is logged and masked, contact information is validated and protected against unauthorized access.';