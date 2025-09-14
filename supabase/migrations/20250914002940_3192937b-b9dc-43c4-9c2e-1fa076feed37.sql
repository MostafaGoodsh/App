-- حذف السياسات المكررة وإعادة إنشائها بشكل صحيح
DROP POLICY IF EXISTS "Anyone can view active reels content" ON public.reels_content;
DROP POLICY IF EXISTS "Anyone can view active reels" ON public.reels_content;
DROP POLICY IF EXISTS "Admins can manage reels content" ON public.reels_content;

-- إنشاء السياسات الصحيحة
CREATE POLICY "view_active_reels" 
ON public.reels_content 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "admin_manage_reels" 
ON public.reels_content 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));