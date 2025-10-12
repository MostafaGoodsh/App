-- إضافة حقل للتحكم في الوصول للمحتوى
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_access BOOLEAN DEFAULT false;

-- إنشاء دالة لمنح الوصول
CREATE OR REPLACE FUNCTION public.grant_user_access(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  UPDATE public.profiles 
  SET has_access = true
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- إنشاء دالة لإلغاء الوصول
CREATE OR REPLACE FUNCTION public.revoke_user_access(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  UPDATE public.profiles 
  SET has_access = false
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;