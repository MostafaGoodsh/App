-- Insert system badges (KYC verified & Family registered) if they don't exist
INSERT INTO public.badges (name, name_en, description, description_en, icon_emoji, badge_color, is_active)
VALUES 
  ('موثق الهوية', 'KYC Verified', 'تم التحقق من الهوية بنجاح', 'Identity verified successfully', '𓂀', '#4CAF50', true),
  ('عائلة موثقة', 'Family Registered', 'تم تسجيل أفراد الأسرة', 'Family members registered', '𓃒', '#FF9800', true)
ON CONFLICT DO NOTHING;

-- Function to auto-grant KYC badge when identity_verification is approved
CREATE OR REPLACE FUNCTION public.auto_grant_kyc_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_badge_id uuid;
BEGIN
  -- Only trigger when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Find the KYC badge
    SELECT id INTO v_badge_id FROM public.badges WHERE name_en = 'KYC Verified' AND is_active = true LIMIT 1;
    
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_id, reason)
      VALUES (NEW.user_id, v_badge_id, 'تم منحه تلقائياً بعد اعتماد التحقق من الهوية')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to auto-grant Family badge when first family member is approved
CREATE OR REPLACE FUNCTION public.auto_grant_family_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_badge_id uuid;
BEGIN
  -- Only trigger when verification_status changes to 'approved'
  IF NEW.verification_status = 'approved' AND (OLD.verification_status IS NULL OR OLD.verification_status != 'approved') THEN
    -- Find the Family badge
    SELECT id INTO v_badge_id FROM public.badges WHERE name_en = 'Family Registered' AND is_active = true LIMIT 1;
    
    IF v_badge_id IS NOT NULL THEN
      INSERT INTO public.user_badges (user_id, badge_id, reason)
      VALUES (NEW.user_id, v_badge_id, 'تم منحه تلقائياً بعد اعتماد تسجيل أحد أفراد الأسرة')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_auto_grant_kyc_badge ON public.identity_verification;
CREATE TRIGGER trigger_auto_grant_kyc_badge
  AFTER UPDATE ON public.identity_verification
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_grant_kyc_badge();

DROP TRIGGER IF EXISTS trigger_auto_grant_family_badge ON public.family_members;
CREATE TRIGGER trigger_auto_grant_family_badge
  AFTER UPDATE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_grant_family_badge();