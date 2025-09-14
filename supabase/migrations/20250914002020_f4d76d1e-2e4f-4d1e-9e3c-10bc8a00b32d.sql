-- حذف السياسات الموجودة وإعادة إنشائها
DROP POLICY IF EXISTS "Admins can manage reels content" ON public.reels_content;
DROP POLICY IF EXISTS "Anyone can view active reels" ON public.reels_content;

-- إنشاء السياسات من جديد
CREATE POLICY "Anyone can view active reels" 
ON public.reels_content 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage reels content" 
ON public.reels_content 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));