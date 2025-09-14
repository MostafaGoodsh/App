-- إضافة policy للأدمن لقراءة جميع الـ reels
CREATE POLICY "admin_select_reels" ON public.reels_content
FOR SELECT 
TO public
USING (is_admin(auth.uid()));