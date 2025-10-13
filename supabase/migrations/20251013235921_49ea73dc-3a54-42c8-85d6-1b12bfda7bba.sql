-- تعديل function التدقيق للسماح بـ system updates
CREATE OR REPLACE FUNCTION public.log_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- تسجيل التعديل فقط إذا كان في user_id
  IF auth.uid() IS NOT NULL THEN
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
  END IF;
  
  RETURN NEW;
END;
$$;

-- الآن إلغاء الوصول للمستخدمين من @webxios.pro
UPDATE public.profiles
SET has_access = false
WHERE email LIKE '%@webxios.pro';