-- Fix remaining security definer functions with mutable search paths

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Fix is_admin function  
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Fix mask_contact_info function
CREATE OR REPLACE FUNCTION public.mask_contact_info(email text, phone text)
RETURNS TABLE(masked_email text, masked_phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Fix log_profile_update function
CREATE OR REPLACE FUNCTION public.log_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log the update
  INSERT INTO public.profiles_audit (
    profile_id,
    accessed_by,
    access_type,
    accessed_at,
    fields_accessed
  ) VALUES (
    NEW.id,
    auth.uid(),
    'update',
    now(),
    ARRAY['full_name', 'email', 'phone', 'avatar_url', 'preferred_language']
  );
  
  RETURN NEW;
END;
$$;

-- Fix log_transaction_access function
CREATE OR REPLACE FUNCTION public.log_transaction_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only log if it's not the transaction owner accessing their own data
    IF auth.uid() != NEW.user_id THEN
        INSERT INTO public.transactions_audit (
            transaction_id,
            accessed_by,
            access_type,
            masked_data
        ) VALUES (
            NEW.id,
            auth.uid(),
            TG_OP,
            is_admin(auth.uid())
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Fix get_secure_transaction_export function
CREATE OR REPLACE FUNCTION public.get_secure_transaction_export(p_access_reason text, p_date_from timestamp with time zone DEFAULT (now() - '30 days'::interval), p_date_to timestamp with time zone DEFAULT now())
RETURNS TABLE(transaction_count bigint, total_volume_range text, avg_amount_range text, network_distribution jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Only admins can access this function
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: admin privileges required';
    END IF;
    
    -- Log the export access
    INSERT INTO public.transactions_audit (
        transaction_id,
        accessed_by,
        access_type,
        access_reason,
        masked_data
    ) VALUES (
        gen_random_uuid(),
        auth.uid(),
        'EXPORT',
        p_access_reason,
        true
    );
    
    RETURN QUERY
    SELECT 
        count(*)::bigint as transaction_count,
        CASE 
            WHEN sum(amount) < 10000 THEN 'low'
            WHEN sum(amount) < 100000 THEN 'medium' 
            WHEN sum(amount) < 1000000 THEN 'high'
            ELSE 'very_high'
        END as total_volume_range,
        CASE 
            WHEN avg(amount) < 100 THEN 'small'
            WHEN avg(amount) < 1000 THEN 'medium'
            WHEN avg(amount) < 10000 THEN 'large'
            ELSE 'very_large'
        END as avg_amount_range,
        jsonb_object_agg(network, network_count) as network_distribution
    FROM (
        SELECT 
            network,
            count(*) as network_count
        FROM public.transactions 
        WHERE created_at BETWEEN p_date_from AND p_date_to
        GROUP BY network
    ) network_stats;
END;
$$;

-- Fix get_secure_profile_export function
CREATE OR REPLACE FUNCTION public.get_secure_profile_export()
RETURNS TABLE(total_profiles bigint, profiles_with_email bigint, profiles_with_phone bigint, avg_profile_age_days numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can access this function
  IF NOT public.is_admin(auth.uid()) THEN
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
$$;

-- Fix process_confirmed_deposit function
CREATE OR REPLACE FUNCTION public.process_confirmed_deposit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- إذا تم تأكيد الإيداع
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    -- تحديث رصيد wallet_tokens
    UPDATE public.wallet_tokens 
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE wallet_id = NEW.wallet_id 
      AND (cryptocurrency = NEW.cryptocurrency OR 
           (token_id IN (
             SELECT id FROM public.custom_tokens 
             WHERE symbol = NEW.cryptocurrency AND network = NEW.network
           )));
    
    -- إنشاء سجل معاملة
    INSERT INTO public.transactions (
      user_id,
      wallet_id,
      amount,
      transaction_type,
      description,
      status,
      transaction_hash,
      network,
      gas_fee
    ) VALUES (
      NEW.user_id,
      NEW.wallet_id,
      NEW.amount,
      'receive',
      'إيداع ' || NEW.amount || ' ' || NEW.cryptocurrency || ' من ' || LEFT(NEW.from_address, 10) || '...',
      'completed',
      NEW.transaction_hash,
      NEW.network,
      0
    );
    
    -- تحديد وقت المعالجة
    NEW.processed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix mask_transaction_data function
CREATE OR REPLACE FUNCTION public.mask_transaction_data(p_amount numeric, p_wallet_id uuid, p_transaction_hash text, p_reference_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN jsonb_build_object(
        'amount_range', CASE 
            WHEN p_amount < 100 THEN 'small (<100)'
            WHEN p_amount < 1000 THEN 'medium (100-1K)'
            WHEN p_amount < 10000 THEN 'large (1K-10K)'
            ELSE 'very_large (>10K)'
        END,
        'wallet_masked', substring(p_wallet_id::text from 1 for 8) || '****',
        'hash_masked', CASE 
            WHEN p_transaction_hash IS NOT NULL 
            THEN substring(p_transaction_hash from 1 for 6) || '...' || substring(p_transaction_hash from length(p_transaction_hash)-5)
            ELSE NULL 
        END,
        'reference_masked', CASE 
            WHEN p_reference_id IS NOT NULL 
            THEN substring(p_reference_id from 1 for 4) || '****'
            ELSE NULL 
        END
    );
END;
$$;

-- Fix get_identity_verification_admin_view function
CREATE OR REPLACE FUNCTION public.get_identity_verification_admin_view()
RETURNS TABLE(id uuid, user_id uuid, full_name text, status text, verification_type text, created_at timestamp with time zone, verified_at timestamp with time zone, document_info_masked text, document_status text, verification_notes text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can access this function
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    iv.id,
    iv.user_id,
    iv.full_name,
    iv.status,
    iv.verification_type,
    iv.created_at,
    iv.verified_at,
    -- Mask sensitive document info for admin viewing
    CASE 
      WHEN iv.document_type IS NOT NULL THEN iv.document_type || ' (***' || RIGHT(COALESCE(iv.document_number, ''), 4) || ')'
      ELSE NULL 
    END as document_info_masked,
    -- Hide actual document URLs and show only metadata
    CASE 
      WHEN iv.document_front_url IS NOT NULL THEN 'Document uploaded'
      ELSE 'No document' 
    END as document_status,
    iv.verification_notes
  FROM public.identity_verification iv;
END;
$$;

-- Fix get_profiles_admin_view function
CREATE OR REPLACE FUNCTION public.get_profiles_admin_view()
RETURNS TABLE(id uuid, user_id uuid, full_name text, masked_email text, masked_phone text, solana_address text, avatar_url text, preferred_language text, created_at timestamp with time zone, updated_at timestamp with time zone, access_count bigint, last_accessed timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can access this function
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    contact.masked_email,
    contact.masked_phone,
    p.solana_address,
    p.avatar_url,
    p.preferred_language,
    p.created_at,
    p.updated_at,
    COALESCE(audit_stats.access_count, 0) as access_count,
    audit_stats.last_accessed
  FROM public.profiles p
  CROSS JOIN LATERAL public.mask_contact_info(p.email, p.phone) as contact
  LEFT JOIN (
    SELECT 
      profile_id,
      COUNT(*) as access_count,
      MAX(accessed_at) as last_accessed
    FROM public.profiles_audit
    GROUP BY profile_id
  ) audit_stats ON audit_stats.profile_id = p.id;
END;
$$;

-- Fix update_kyc_status function
CREATE OR REPLACE FUNCTION public.update_kyc_status(verification_id uuid, new_status text, admin_notes text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Fix calculate_account_strength function
CREATE OR REPLACE FUNCTION public.calculate_account_strength(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  strength INTEGER := 100; -- Base strength
  profile_completeness INTEGER := 0;
  verification_bonus INTEGER := 0;
  activity_bonus INTEGER := 0;
BEGIN
  -- Check profile completeness (300 points max)
  SELECT 
    CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 50 ELSE 0 END +
    CASE WHEN email IS NOT NULL AND email != '' THEN 50 ELSE 0 END +
    CASE WHEN phone IS NOT NULL AND phone != '' THEN 50 ELSE 0 END +
    CASE WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN 50 ELSE 0 END +
    CASE WHEN solana_address IS NOT NULL AND solana_address != '' THEN 100 ELSE 0 END
  INTO profile_completeness
  FROM public.profiles 
  WHERE user_id = p_user_id;
  
  -- Check verification status (500 points max)
  SELECT 
    CASE WHEN status = 'approved' THEN 500 ELSE 0 END
  INTO verification_bonus
  FROM public.identity_verification 
  WHERE user_id = p_user_id 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Calculate activity bonus (200 points max)
  -- Based on recent transactions and engagement
  SELECT 
    LEAST(200, COUNT(*) * 10)
  INTO activity_bonus
  FROM public.transactions 
  WHERE user_id = p_user_id 
    AND created_at > now() - interval '30 days';
  
  strength := strength + COALESCE(profile_completeness, 0) + COALESCE(verification_bonus, 0) + COALESCE(activity_bonus, 0);
  
  RETURN strength;
END;
$$;

-- Fix update_mining_progress function
CREATE OR REPLACE FUNCTION public.update_mining_progress(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  mining_profile RECORD;
  hours_passed NUMERIC;
  amount_to_add NUMERIC;
  new_account_strength INTEGER;
  eligible_level INTEGER;
  result JSONB;
BEGIN
  -- Get current mining profile
  SELECT * INTO mining_profile
  FROM public.user_mining_profiles 
  WHERE user_id = p_user_id;
  
  -- If no profile exists, create one
  IF mining_profile IS NULL THEN
    new_account_strength := public.calculate_account_strength(p_user_id);
    
    INSERT INTO public.user_mining_profiles (user_id, account_strength, mining_rate_per_hour)
    VALUES (p_user_id, new_account_strength, 1.0000)
    RETURNING * INTO mining_profile;
  END IF;
  
  -- Calculate hours passed since last update
  hours_passed := EXTRACT(EPOCH FROM (now() - mining_profile.last_mining_update)) / 3600.0;
  
  -- Calculate mining amount (only if mining is active and less than 24 hours)
  IF mining_profile.is_mining_active AND hours_passed <= 24 THEN
    amount_to_add := mining_profile.mining_rate_per_hour * hours_passed;
    
    -- Update account strength
    new_account_strength := public.calculate_account_strength(p_user_id);
    
    -- Check if user is eligible for level upgrade
    SELECT level_number INTO eligible_level
    FROM public.mining_levels 
    WHERE required_account_strength <= new_account_strength
    ORDER BY level_number DESC
    LIMIT 1;
    
    -- Update mining profile
    UPDATE public.user_mining_profiles 
    SET 
      total_mined = total_mined + amount_to_add,
      account_strength = new_account_strength,
      current_level = COALESCE(eligible_level, current_level),
      mining_rate_per_hour = COALESCE((
        SELECT mining_rate_per_hour 
        FROM public.mining_levels 
        WHERE level_number = COALESCE(eligible_level, mining_profile.current_level)
      ), mining_rate_per_hour),
      last_mining_update = now(),
      updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Add to mining history for current hour
    INSERT INTO public.mining_history (user_id, hour_timestamp, amount_mined, mining_rate, account_strength, level_number)
    VALUES (
      p_user_id, 
      date_trunc('hour', now()), 
      amount_to_add, 
      mining_profile.mining_rate_per_hour, 
      new_account_strength, 
      COALESCE(eligible_level, mining_profile.current_level)
    )
    ON CONFLICT (user_id, hour_timestamp) DO UPDATE SET
      amount_mined = mining_history.amount_mined + EXCLUDED.amount_mined;
  ELSE
    amount_to_add := 0;
    new_account_strength := mining_profile.account_strength;
  END IF;
  
  -- Return result
  result := jsonb_build_object(
    'mined_amount', amount_to_add,
    'total_mined', mining_profile.total_mined + amount_to_add,
    'account_strength', new_account_strength,
    'current_level', mining_profile.current_level,
    'mining_rate', mining_profile.mining_rate_per_hour,
    'hours_passed', hours_passed,
    'is_active', mining_profile.is_mining_active
  );
  
  RETURN result;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', '')
  );
  RETURN new;
END;
$$;