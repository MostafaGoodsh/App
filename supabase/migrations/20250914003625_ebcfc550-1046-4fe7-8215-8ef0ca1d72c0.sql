-- إضافة سياسة منفصلة للإدراج للمديرين
CREATE POLICY "admin_insert_reels" 
ON public.reels_content 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- إضافة سياسة منفصلة للتحديث للمديرين  
CREATE POLICY "admin_update_reels" 
ON public.reels_content 
FOR UPDATE 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- إضافة سياسة منفصلة للحذف للمديرين
CREATE POLICY "admin_delete_reels" 
ON public.reels_content 
FOR DELETE 
USING (is_admin(auth.uid()));

-- حذف السياسة الشاملة التي قد تسبب مشاكل
DROP POLICY IF EXISTS "admin_manage_reels" ON public.reels_content;