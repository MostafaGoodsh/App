-- تحديث دالة التحقق من الوصول لدعم free tier بشكل أفضل
CREATE OR REPLACE FUNCTION public.check_anubis_subscription_access(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_access boolean;
  free_tier_enabled boolean;
BEGIN
  -- التحقق من تفعيل free tier
  SELECT anubis_settings.free_tier_enabled 
  INTO free_tier_enabled
  FROM public.anubis_settings
  LIMIT 1;
  
  -- إذا كان free tier مفعل، السماح بالوصول لأي مستخدم لديه اشتراك (أي حالة)
  IF free_tier_enabled THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.anubis_subscriptions
      WHERE user_id = user_uuid
    ) INTO has_access;
  ELSE
    -- إذا لم يكن free tier مفعل، التحقق من الاشتراك النشط فقط
    SELECT EXISTS (
      SELECT 1
      FROM public.anubis_subscriptions
      WHERE user_id = user_uuid
        AND status = 'active'
        AND (end_date IS NULL OR end_date > now())
    ) INTO has_access;
  END IF;
  
  RETURN has_access;
END;
$$;