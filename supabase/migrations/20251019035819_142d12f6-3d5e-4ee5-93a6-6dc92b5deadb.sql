-- إضافة حقول جديدة لإدارة محتوى الصفحة الداخلية لكروت الرودماب

-- إضافة صورة غلاف للصفحة الداخلية
ALTER TABLE public.roadmap_cards 
ADD COLUMN IF NOT EXISTS page_cover_image TEXT;

-- إضافة خلفية مخصصة للصفحة الداخلية
ALTER TABLE public.roadmap_cards 
ADD COLUMN IF NOT EXISTS page_background TEXT DEFAULT '#ffffff';

-- إضافة محتوى الصفحة بالإنجليزية
ALTER TABLE public.roadmap_cards 
ADD COLUMN IF NOT EXISTS page_content_en TEXT;

-- إضافة لون نص مخصص للصفحة
ALTER TABLE public.roadmap_cards 
ADD COLUMN IF NOT EXISTS page_text_color TEXT DEFAULT '#000000';

COMMENT ON COLUMN public.roadmap_cards.page_cover_image IS 'صورة الغلاف للصفحة الداخلية';
COMMENT ON COLUMN public.roadmap_cards.page_background IS 'خلفية الصفحة الداخلية (لون أو gradient)';
COMMENT ON COLUMN public.roadmap_cards.page_content_en IS 'محتوى الصفحة بالإنجليزية';
COMMENT ON COLUMN public.roadmap_cards.page_text_color IS 'لون النص في الصفحة الداخلية';