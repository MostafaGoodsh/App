-- إضافة policy للأدمن لتعديل has_early_access
DO $$ 
BEGIN
  -- حذف الـ policy القديمة إن وجدت
  DROP POLICY IF EXISTS "Admins can update early access" ON public.profiles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- إنشاء policy جديدة للأدمن لتعديل has_early_access
CREATE POLICY "Admins can update early access"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));