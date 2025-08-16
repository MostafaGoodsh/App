-- Add admin policies for managing KYC/identity verification requests

-- Allow admins to view all identity verification requests
CREATE POLICY "Admins can view all identity verifications" 
ON public.identity_verification 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

-- Allow admins to update verification status and notes
CREATE POLICY "Admins can update verification status" 
ON public.identity_verification 
FOR UPDATE 
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create function to approve/reject KYC requests
CREATE OR REPLACE FUNCTION public.update_kyc_status(
  verification_id UUID,
  new_status TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Validate status
  IF new_status NOT IN ('approved', 'rejected', 'pending') THEN
    RAISE EXCEPTION 'Invalid status. Must be approved, rejected, or pending.';
  END IF;
  
  -- Update the verification record
  UPDATE public.identity_verification 
  SET 
    status = new_status,
    verified_at = CASE WHEN new_status = 'approved' THEN now() ELSE NULL END,
    verification_notes = COALESCE(admin_notes, verification_notes),
    updated_at = now()
  WHERE id = verification_id;
  
  -- Check if update was successful
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;