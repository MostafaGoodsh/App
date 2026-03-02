
-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  tokens_rewarded NUMERIC NOT NULL DEFAULT 7,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate referrals
ALTER TABLE public.referrals ADD CONSTRAINT unique_referred UNIQUE (referred_id);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);

-- Add referral_code to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referred_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Check if user already has a code
  SELECT referral_code INTO v_code FROM public.profiles WHERE user_id = p_user_id;
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;
  
  -- Generate unique code
  LOOP
    v_code := 'MSR-' || upper(substr(md5(random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  UPDATE public.profiles SET referral_code = v_code WHERE user_id = p_user_id;
  RETURN v_code;
END;
$$;

-- Function to process referral
CREATE OR REPLACE FUNCTION public.process_referral(p_referral_code TEXT, p_referred_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_referrer_id UUID;
  v_referral_count INTEGER;
  v_already_referred BOOLEAN;
BEGIN
  -- Check if user already used a referral
  SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referred_id = p_referred_user_id) INTO v_already_referred;
  IF v_already_referred THEN
    RETURN jsonb_build_object('success', false, 'error', 'لقد استخدمت رمز إحالة بالفعل');
  END IF;
  
  -- Find referrer
  SELECT user_id INTO v_referrer_id FROM public.profiles WHERE referral_code = p_referral_code;
  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'رمز الإحالة غير صحيح');
  END IF;
  
  -- Can't refer yourself
  IF v_referrer_id = p_referred_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'لا يمكنك إحالة نفسك');
  END IF;
  
  -- Check referral limit (max 10)
  SELECT referral_count INTO v_referral_count FROM public.profiles WHERE user_id = v_referrer_id;
  IF COALESCE(v_referral_count, 0) >= 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'وصل هذا المستخدم للحد الأقصى من الإحالات');
  END IF;
  
  -- Create referral record
  INSERT INTO public.referrals (referrer_id, referred_id, referral_code, tokens_rewarded)
  VALUES (v_referrer_id, p_referred_user_id, p_referral_code, 7);
  
  -- Update referrer count
  UPDATE public.profiles SET referral_count = COALESCE(referral_count, 0) + 1 WHERE user_id = v_referrer_id;
  
  -- Update referred_by
  UPDATE public.profiles SET referred_by = v_referrer_id WHERE user_id = p_referred_user_id;
  
  -- Credit 7 MS-RA tokens to referrer's internal wallet
  INSERT INTO public.internal_wallet_balances (user_id, token_id, balance)
  SELECT v_referrer_id, id, 7
  FROM public.internal_tokens WHERE symbol = 'MSRA' AND is_active = true
  ON CONFLICT (user_id, token_id)
  DO UPDATE SET balance = internal_wallet_balances.balance + 7, updated_at = now();
  
  RETURN jsonb_build_object('success', true, 'message', 'تم تطبيق الإحالة بنجاح! حصل المُحيل على 7 $MS-RA');
END;
$$;

-- Function to get total mining across all users
CREATE OR REPLACE FUNCTION public.get_total_mining_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_mined NUMERIC;
  v_total_users INTEGER;
  v_max_supply NUMERIC := 1000000000; -- 1 billion
BEGIN
  SELECT COALESCE(SUM(total_mined), 0), COUNT(*)
  INTO v_total_mined, v_total_users
  FROM public.user_mining_profiles;
  
  RETURN jsonb_build_object(
    'total_mined', v_total_mined,
    'total_miners', v_total_users,
    'max_supply', v_max_supply,
    'percentage_mined', CASE WHEN v_max_supply > 0 THEN (v_total_mined / v_max_supply) * 100 ELSE 0 END
  );
END;
$$;
