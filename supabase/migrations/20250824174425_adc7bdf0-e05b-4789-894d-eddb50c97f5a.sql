-- Create mining levels table
CREATE TABLE public.mining_levels (
  id SERIAL PRIMARY KEY,
  level_number INTEGER NOT NULL UNIQUE,
  level_name TEXT NOT NULL,
  required_account_strength INTEGER NOT NULL,
  mining_rate_per_hour NUMERIC(10,4) NOT NULL,
  upgrade_cost NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user mining profiles table
CREATE TABLE public.user_mining_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 1,
  account_strength INTEGER NOT NULL DEFAULT 100,
  total_mined NUMERIC(15,8) NOT NULL DEFAULT 0,
  mining_rate_per_hour NUMERIC(10,4) NOT NULL DEFAULT 1.0000,
  last_mining_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_mining_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (current_level) REFERENCES public.mining_levels(level_number)
);

-- Create mining history table for 24-hour tracking
CREATE TABLE public.mining_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hour_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  amount_mined NUMERIC(10,8) NOT NULL,
  mining_rate NUMERIC(10,4) NOT NULL,
  account_strength INTEGER NOT NULL,
  level_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default mining levels
INSERT INTO public.mining_levels (level_number, level_name, required_account_strength, mining_rate_per_hour, upgrade_cost) VALUES
(1, 'مبتدئ', 0, 1.0000, 0),
(2, 'متوسط', 500, 2.5000, 100),
(3, 'متقدم', 1000, 5.0000, 250),
(4, 'خبير', 2000, 10.0000, 500),
(5, 'محترف', 4000, 20.0000, 1000),
(6, 'ماستر', 8000, 50.0000, 2500),
(7, 'أسطوري', 15000, 100.0000, 5000);

-- Enable RLS
ALTER TABLE public.mining_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mining_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mining_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mining_levels
CREATE POLICY "Anyone can view mining levels" ON public.mining_levels FOR SELECT USING (true);

-- RLS Policies for user_mining_profiles
CREATE POLICY "Users can view their own mining profile" ON public.user_mining_profiles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mining profile" ON public.user_mining_profiles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mining profile" ON public.user_mining_profiles 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all mining profiles" ON public.user_mining_profiles 
FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for mining_history
CREATE POLICY "Users can view their own mining history" ON public.mining_history 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert mining history" ON public.mining_history 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all mining history" ON public.mining_history 
FOR SELECT USING (is_admin(auth.uid()));

-- Create function to calculate account strength
CREATE OR REPLACE FUNCTION public.calculate_account_strength(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Create function to update mining progress
CREATE OR REPLACE FUNCTION public.update_mining_progress(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Create unique constraint for mining history per hour
CREATE UNIQUE INDEX idx_mining_history_user_hour ON public.mining_history(user_id, hour_timestamp);

-- Add triggers for updated_at
CREATE TRIGGER update_user_mining_profiles_updated_at
  BEFORE UPDATE ON public.user_mining_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();