-- إنشاء جدول reels_content مع سياسات RLS صحيحة
CREATE TABLE IF NOT EXISTS public.reels_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.reels_content ENABLE ROW LEVEL SECURITY;

-- سياسة للمشاهدة العامة للمحتوى النشط
CREATE POLICY "Anyone can view active reels" 
ON public.reels_content 
FOR SELECT 
USING (is_active = true);

-- سياسة للإدارة الكاملة للأدمن
CREATE POLICY "Admins can manage reels content" 
ON public.reels_content 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- إنشاء trigger للتحديث التلقائي لـ updated_at
CREATE OR REPLACE FUNCTION public.update_reels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reels_content_updated_at
  BEFORE UPDATE ON public.reels_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reels_updated_at();