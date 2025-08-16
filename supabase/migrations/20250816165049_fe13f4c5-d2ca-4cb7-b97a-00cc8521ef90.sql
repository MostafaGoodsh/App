-- إصلاح سياسة RLS لجدول custom_tokens
DROP POLICY IF EXISTS "Authenticated users can add unverified custom tokens" ON public.custom_tokens;

-- سياسة جديدة أكثر مرونة للسماح للمستخدمين المصادق عليهم بإضافة عملات غير مؤكدة
CREATE POLICY "Allow authenticated users to add custom tokens" 
ON public.custom_tokens 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL
);