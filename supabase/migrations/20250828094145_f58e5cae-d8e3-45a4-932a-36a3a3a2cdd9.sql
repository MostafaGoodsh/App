-- Enhanced Wallet Security Implementation - Fixed Version
-- This migration adds multiple security layers for cryptocurrency wallet access

-- 1. Create wallet access audit table
CREATE TABLE public.wallet_access_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL,
  user_id UUID NOT NULL,
  access_type TEXT NOT NULL, -- 'view', 'decrypt', 'transaction'
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  mfa_verified BOOLEAN DEFAULT false,
  risk_score INTEGER DEFAULT 0, -- 0-100 risk assessment
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked BOOLEAN DEFAULT false,
  block_reason TEXT
);

-- 2. Create wallet security settings table
CREATE TABLE public.wallet_security_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL UNIQUE,
  mfa_required BOOLEAN DEFAULT true,
  ip_whitelist TEXT[], -- Array of allowed IP addresses
  max_daily_access INTEGER DEFAULT 10,
  require_device_verification BOOLEAN DEFAULT true,
  auto_lock_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create trusted devices table
CREATE TABLE public.trusted_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_trusted BOOLEAN DEFAULT false,
  trust_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_fingerprint)
);

-- 4. Create MFA sessions table
CREATE TABLE public.mfa_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  wallet_id UUID,
  challenge_code TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 minutes'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.wallet_access_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallet_access_audit
CREATE POLICY "Users can view their wallet access logs"
ON public.wallet_access_audit
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert access logs"
ON public.wallet_access_audit
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all access logs"
ON public.wallet_access_audit
FOR SELECT
USING (is_admin(auth.uid()));

-- RLS Policies for wallet_security_settings
CREATE POLICY "Users can manage their wallet security settings"
ON public.wallet_security_settings
FOR ALL
USING (wallet_id IN (
  SELECT id FROM public.wallets WHERE user_id = auth.uid()
))
WITH CHECK (wallet_id IN (
  SELECT id FROM public.wallets WHERE user_id = auth.uid()
));

-- RLS Policies for trusted_devices
CREATE POLICY "Users can manage their trusted devices"
ON public.trusted_devices
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mfa_sessions
CREATE POLICY "Users can access their MFA sessions"
ON public.mfa_sessions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Create security validation function
CREATE OR REPLACE FUNCTION public.validate_wallet_access(
  p_wallet_id UUID,
  p_access_type TEXT,
  p_device_fingerprint TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_settings RECORD;
  v_risk_score INTEGER := 0;
  v_blocked BOOLEAN := false;
  v_block_reason TEXT := '';
  v_daily_access_count INTEGER;
  v_device_trusted BOOLEAN := false;
  v_mfa_required BOOLEAN := true;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Authentication required',
      'risk_score', 100
    );
  END IF;
  
  -- Verify wallet ownership
  IF NOT EXISTS (
    SELECT 1 FROM public.wallets 
    WHERE id = p_wallet_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Wallet access denied',
      'risk_score', 100
    );
  END IF;
  
  -- Get security settings
  SELECT * INTO v_settings
  FROM public.wallet_security_settings
  WHERE wallet_id = p_wallet_id;
  
  -- Create default settings if none exist
  IF v_settings IS NULL THEN
    INSERT INTO public.wallet_security_settings (wallet_id)
    VALUES (p_wallet_id)
    RETURNING * INTO v_settings;
  END IF;
  
  -- Check daily access limit
  SELECT COUNT(*) INTO v_daily_access_count
  FROM public.wallet_access_audit
  WHERE wallet_id = p_wallet_id 
    AND user_id = v_user_id
    AND accessed_at >= CURRENT_DATE;
  
  IF v_daily_access_count >= v_settings.max_daily_access THEN
    v_blocked := true;
    v_block_reason := 'Daily access limit exceeded';
    v_risk_score := 80;
  END IF;
  
  -- Check IP whitelist
  IF v_settings.ip_whitelist IS NOT NULL 
     AND array_length(v_settings.ip_whitelist, 1) > 0 
     AND p_ip_address IS NOT NULL THEN
    IF NOT (p_ip_address::TEXT = ANY(v_settings.ip_whitelist)) THEN
      v_risk_score := v_risk_score + 30;
      v_block_reason := v_block_reason || ' Unrecognized IP address.';
    END IF;
  END IF;
  
  -- Check device trust
  IF p_device_fingerprint IS NOT NULL THEN
    SELECT is_trusted INTO v_device_trusted
    FROM public.trusted_devices
    WHERE user_id = v_user_id 
      AND device_fingerprint = p_device_fingerprint
      AND (trust_expires_at IS NULL OR trust_expires_at > now());
    
    IF NOT COALESCE(v_device_trusted, false) THEN
      v_risk_score := v_risk_score + 25;
      v_block_reason := v_block_reason || ' Untrusted device.';
    END IF;
  END IF;
  
  -- Determine if MFA is required
  v_mfa_required := v_settings.mfa_required OR v_risk_score > 50;
  
  -- Final risk assessment
  IF v_risk_score > 70 THEN
    v_blocked := true;
    v_block_reason := 'High risk access attempt blocked';
  END IF;
  
  -- Log the access attempt
  INSERT INTO public.wallet_access_audit (
    wallet_id, user_id, access_type, ip_address, 
    device_fingerprint, risk_score, blocked, block_reason
  ) VALUES (
    p_wallet_id, v_user_id, p_access_type, p_ip_address,
    p_device_fingerprint, v_risk_score, v_blocked, v_block_reason
  );
  
  RETURN jsonb_build_object(
    'allowed', NOT v_blocked,
    'mfa_required', v_mfa_required,
    'risk_score', v_risk_score,
    'reason', COALESCE(v_block_reason, 'Access validated'),
    'settings', row_to_json(v_settings)
  );
END;
$$;

-- 6. Create secure wallet access function
CREATE OR REPLACE FUNCTION public.secure_wallet_access(
  p_wallet_id UUID,
  p_access_type TEXT,
  p_mfa_token TEXT DEFAULT NULL,
  p_device_fingerprint TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_validation_result JSONB;
  v_mfa_valid BOOLEAN := false;
  v_user_id UUID;
  v_audit_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- First validate basic access
  v_validation_result := public.validate_wallet_access(
    p_wallet_id, 
    p_access_type, 
    p_device_fingerprint,
    inet_client_addr()
  );
  
  -- If access is not allowed, return immediately
  IF NOT (v_validation_result->>'allowed')::BOOLEAN THEN
    RETURN v_validation_result;
  END IF;
  
  -- Check MFA if required
  IF (v_validation_result->>'mfa_required')::BOOLEAN THEN
    IF p_mfa_token IS NULL THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'mfa_required', true,
        'reason', 'MFA verification required'
      );
    END IF;
    
    -- Verify MFA token
    SELECT verified INTO v_mfa_valid
    FROM public.mfa_sessions
    WHERE user_id = v_user_id
      AND wallet_id = p_wallet_id
      AND session_token = p_mfa_token
      AND expires_at > now()
      AND verified = true;
    
    IF NOT COALESCE(v_mfa_valid, false) THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'Invalid or expired MFA token'
      );
    END IF;
    
    -- Update the most recent access log with MFA verification
    SELECT id INTO v_audit_id
    FROM public.wallet_access_audit
    WHERE wallet_id = p_wallet_id
      AND user_id = v_user_id
      AND accessed_at >= now() - interval '1 minute'
    ORDER BY accessed_at DESC
    LIMIT 1;
    
    IF v_audit_id IS NOT NULL THEN
      UPDATE public.wallet_access_audit
      SET mfa_verified = true
      WHERE id = v_audit_id;
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'reason', 'Secure access granted',
    'mfa_verified', COALESCE(v_mfa_valid, false)
  );
END;
$$;

-- 7. Create MFA session function
CREATE OR REPLACE FUNCTION public.create_wallet_mfa_session(
  p_wallet_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_session_token TEXT;
  v_challenge_code TEXT;
  v_session_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Authentication required');
  END IF;
  
  -- Generate secure tokens
  v_session_token := encode(gen_random_bytes(32), 'hex');
  v_challenge_code := lpad((random() * 999999)::int::text, 6, '0');
  
  -- Create MFA session
  INSERT INTO public.mfa_sessions (
    user_id, wallet_id, session_token, challenge_code
  ) VALUES (
    v_user_id, p_wallet_id, v_session_token, v_challenge_code
  ) RETURNING id INTO v_session_id;
  
  RETURN jsonb_build_object(
    'session_id', v_session_id,
    'session_token', v_session_token,
    'challenge_code', v_challenge_code,
    'expires_in', 300
  );
END;
$$;

-- 8. Create device registration function
CREATE OR REPLACE FUNCTION public.register_trusted_device(
  p_device_fingerprint TEXT,
  p_device_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_device_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Authentication required');
  END IF;
  
  -- Insert or update trusted device
  INSERT INTO public.trusted_devices (
    user_id, device_fingerprint, device_name, is_trusted, trust_expires_at
  ) VALUES (
    v_user_id, p_device_fingerprint, p_device_name, true, now() + interval '30 days'
  )
  ON CONFLICT (user_id, device_fingerprint) 
  DO UPDATE SET
    device_name = COALESCE(EXCLUDED.device_name, trusted_devices.device_name),
    is_trusted = true,
    trust_expires_at = now() + interval '30 days',
    last_used = now()
  RETURNING id INTO v_device_id;
  
  RETURN jsonb_build_object(
    'device_id', v_device_id,
    'trusted', true,
    'expires_at', now() + interval '30 days'
  );
END;
$$;

-- 9. Create triggers for updated_at
CREATE TRIGGER update_wallet_security_settings_updated_at
  BEFORE UPDATE ON public.wallet_security_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();