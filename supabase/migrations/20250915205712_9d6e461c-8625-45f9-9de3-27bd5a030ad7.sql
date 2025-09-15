-- إضافة حقل category_id لجدول reels_content لربط الفيديوهات بالأقسام
ALTER TABLE public.reels_content 
ADD COLUMN category_id UUID REFERENCES public.reels_categories(id);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX idx_reels_content_category_id ON public.reels_content(category_id);

-- إضافة تعليق للوضوح
COMMENT ON COLUMN public.reels_content.category_id IS 'معرف القسم الذي ينتمي إليه الفيديو';