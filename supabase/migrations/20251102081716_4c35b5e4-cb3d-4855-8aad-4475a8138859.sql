-- Add 2FA columns to anubis_subscriptions
ALTER TABLE anubis_subscriptions 
ADD COLUMN IF NOT EXISTS two_factor_secret text,
ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_verified_at timestamp with time zone;

-- Create anubis_settings table for admin configuration
CREATE TABLE IF NOT EXISTS anubis_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_enabled boolean DEFAULT false,
  free_tier_enabled boolean DEFAULT true,
  monthly_price numeric DEFAULT 0,
  quarterly_price numeric DEFAULT 0,
  yearly_price numeric DEFAULT 0,
  currency text DEFAULT 'EGP',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE anubis_settings ENABLE ROW LEVEL SECURITY;

-- Policies for anubis_settings
CREATE POLICY "Anyone can view anubis settings"
  ON anubis_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage anubis settings"
  ON anubis_settings FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Insert default settings
INSERT INTO anubis_settings (payment_enabled, free_tier_enabled)
VALUES (false, true)
ON CONFLICT DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_anubis_settings_updated_at
  BEFORE UPDATE ON anubis_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update check_anubis_subscription_access to allow free tier
CREATE OR REPLACE FUNCTION check_anubis_subscription_access(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  free_tier_enabled boolean;
BEGIN
  -- Check if free tier is enabled
  SELECT anubis_settings.free_tier_enabled INTO free_tier_enabled
  FROM anubis_settings
  LIMIT 1;
  
  -- If free tier is enabled, allow access to all registered users
  IF free_tier_enabled THEN
    RETURN EXISTS (
      SELECT 1 FROM anubis_subscriptions
      WHERE anubis_subscriptions.user_id = user_uuid
    );
  END IF;
  
  -- Otherwise check for active paid subscription
  RETURN EXISTS (
    SELECT 1 FROM anubis_subscriptions
    WHERE anubis_subscriptions.user_id = user_uuid
    AND anubis_subscriptions.status = 'active'
    AND (anubis_subscriptions.end_date IS NULL OR anubis_subscriptions.end_date > now())
  );
END;
$$;