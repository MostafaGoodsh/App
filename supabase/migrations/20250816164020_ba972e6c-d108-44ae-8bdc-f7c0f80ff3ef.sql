-- تحديث سياسة RLS لجدول custom_tokens للسماح للمستخدمين بإضافة عملات غير مؤكدة
DROP POLICY IF EXISTS "Authenticated users can add custom tokens" ON public.custom_tokens;

CREATE POLICY "Authenticated users can add unverified custom tokens" 
ON public.custom_tokens 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND is_verified = false
);