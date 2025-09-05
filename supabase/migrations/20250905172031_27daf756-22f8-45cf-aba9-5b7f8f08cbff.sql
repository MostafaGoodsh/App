-- إضافة حقل category لجدول learning_content
ALTER TABLE public.learning_content 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'crypto'::text CHECK (category IN ('crypto', 'general', 'divine'));

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_learning_content_category ON public.learning_content(category);
CREATE INDEX IF NOT EXISTS idx_learning_content_category_published ON public.learning_content(category, is_published);