-- إضافة عمود للتحكم بالوصول المبكر في جدول profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_early_access BOOLEAN DEFAULT false;

-- دالة للتحقق من حالة الوصول المبكر
CREATE OR REPLACE FUNCTION public.check_early_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT has_early_access FROM public.profiles WHERE user_id = _user_id),
    false
  );
$$;

-- منح الأدمن وصول مبكر تلقائياً
UPDATE public.profiles 
SET has_early_access = true 
WHERE user_id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);