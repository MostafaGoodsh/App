-- إضافة صلاحيات التحديث والحذف للمديرين في جدول الاستبيانات
CREATE POLICY "Admins can update surveys" 
ON public.surveys 
FOR UPDATE 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete surveys" 
ON public.surveys 
FOR DELETE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all surveys" 
ON public.surveys 
FOR SELECT 
USING (is_admin(auth.uid()));

-- إضافة صلاحيات التحديث والحذف للمديرين في جدول محتوى التعلم
CREATE POLICY "Admins can update learning content" 
ON public.learning_content 
FOR UPDATE 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete learning content" 
ON public.learning_content 
FOR DELETE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all learning content" 
ON public.learning_content 
FOR SELECT 
USING (is_admin(auth.uid()));