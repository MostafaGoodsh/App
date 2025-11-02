-- Drop existing check_anubis_access function
DROP FUNCTION IF EXISTS public.check_anubis_access(uuid);

-- Create anubis_subscriptions table
CREATE TABLE IF NOT EXISTS public.anubis_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL DEFAULT 'free_trial',
  status TEXT NOT NULL DEFAULT 'pending',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  payment_amount NUMERIC,
  payment_currency TEXT DEFAULT 'EGP',
  payment_method TEXT,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.anubis_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own anubis subscription"
  ON public.anubis_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscription
CREATE POLICY "Users can insert their own anubis subscription"
  ON public.anubis_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all anubis subscriptions"
  ON public.anubis_subscriptions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all subscriptions
CREATE POLICY "Admins can update all anubis subscriptions"
  ON public.anubis_subscriptions
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create new function to check anubis subscription access
CREATE OR REPLACE FUNCTION public.check_anubis_subscription_access(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF has_role(user_uuid, 'admin'::app_role) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has active anubis subscription
  RETURN EXISTS (
    SELECT 1 FROM anubis_subscriptions
    WHERE user_id = user_uuid 
    AND status = 'active'
    AND (end_date IS NULL OR end_date > now())
  );
END;
$$;

-- Add language column to surveys table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'surveys' 
    AND column_name = 'language'
  ) THEN
    ALTER TABLE public.surveys ADD COLUMN language TEXT DEFAULT 'ar';
  END IF;
END $$;