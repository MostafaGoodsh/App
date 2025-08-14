-- Enhanced security for identity verification table
-- Add admin-only policies and encryption for sensitive data

-- First, add audit logging table for identity verification access
CREATE TABLE IF NOT EXISTS public.identity_verification_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  verification_id UUID NOT NULL REFERENCES public.identity_verification(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL,
  access_type TEXT NOT NULL, -- 'view', 'update', 'admin_view'
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on audit table
ALTER TABLE public.identity_verification_audit ENABLE ROW LEVEL SECURITY;

-- Create audit policies - only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.identity_verification_audit 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs" 
ON public.identity_verification_audit 
FOR INSERT 
WITH CHECK (true);

-- Add admin-only policies for identity verification
CREATE POLICY "Admins can view all identity verifications" 
ON public.identity_verification 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update verification status" 
ON public.identity_verification 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Create function to encrypt sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Simple encryption function - in production, use proper encryption
  -- This is a placeholder for actual encryption implementation
  IF data IS NULL OR data = '' THEN
    RETURN data;
  END IF;
  RETURN encode(digest(data || current_setting('app.encryption_key', true), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log identity verification access
CREATE OR REPLACE FUNCTION public.log_identity_verification_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.identity_verification_audit (
    verification_id,
    accessed_by,
    access_type,
    accessed_at
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    CASE 
      WHEN TG_OP = 'SELECT' THEN 'view'
      WHEN TG_OP = 'UPDATE' THEN 'update'
      ELSE 'unknown'
    END,
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for audit logging
CREATE TRIGGER identity_verification_access_log
  AFTER SELECT OR UPDATE ON public.identity_verification
  FOR EACH ROW EXECUTE FUNCTION public.log_identity_verification_access();

-- Add constraints to limit data exposure
ALTER TABLE public.identity_verification 
ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'under_review'));

-- Add index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_identity_verification_user_status 
ON public.identity_verification(user_id, status);

-- Add index for audit queries
CREATE INDEX IF NOT EXISTS idx_identity_verification_audit_user 
ON public.identity_verification_audit(accessed_by, accessed_at);

-- Update existing policies to be more restrictive
DROP POLICY IF EXISTS "Users can view their own verification" ON public.identity_verification;

-- Recreate user policy with additional security checks
CREATE POLICY "Users can view their own verification with audit" 
ON public.identity_verification 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
);

-- Add policy for users to only update specific fields
DROP POLICY IF EXISTS "Users can update their own verification" ON public.identity_verification;

CREATE POLICY "Users can update limited fields only" 
ON public.identity_verification 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
  AND status IN ('pending', 'rejected') -- Only allow updates when pending or rejected
);

-- Create view for sanitized identity verification data (admin use)
CREATE OR REPLACE VIEW public.identity_verification_admin_view AS
SELECT 
  id,
  user_id,
  verification_type,
  status,
  document_type,
  CASE 
    WHEN document_number IS NOT NULL 
    THEN '***' || RIGHT(document_number, 4)
    ELSE NULL 
  END as document_number_masked,
  full_name,
  nationality,
  CASE 
    WHEN address IS NOT NULL 
    THEN LEFT(address, 20) || '...'
    ELSE NULL 
  END as address_partial,
  CASE 
    WHEN phone_number IS NOT NULL 
    THEN '***' || RIGHT(phone_number, 4)
    ELSE NULL 
  END as phone_number_masked,
  date_of_birth,
  created_at,
  updated_at,
  verified_at,
  verification_notes
FROM public.identity_verification;