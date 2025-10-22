-- إضافة حقول جديدة لجدول roadmap_cards

-- حقول التحكم في الفونتات
ALTER TABLE public.roadmap_cards
ADD COLUMN IF NOT EXISTS font_size VARCHAR DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS font_family VARCHAR DEFAULT 'Cairo',
ADD COLUMN IF NOT EXISTS font_weight VARCHAR DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS title_font_size VARCHAR DEFAULT 'large',
ADD COLUMN IF NOT EXISTS content_font_size VARCHAR DEFAULT 'medium';

-- حقول الـ widgets الخارجية
ALTER TABLE public.roadmap_cards
ADD COLUMN IF NOT EXISTS external_widget_url TEXT,
ADD COLUMN IF NOT EXISTS widget_type VARCHAR CHECK (widget_type IN ('iframe', 'dexscreener', 'pumpfun', 'wallet_balance', 'custom_embed', 'none')),
ADD COLUMN IF NOT EXISTS widget_config JSONB DEFAULT '{}';

-- تعليقات على الحقول الجديدة
COMMENT ON COLUMN public.roadmap_cards.font_size IS 'حجم الخط العام: small, medium, large';
COMMENT ON COLUMN public.roadmap_cards.font_family IS 'نوع الخط: Cairo, Tajawal, Roboto, etc.';
COMMENT ON COLUMN public.roadmap_cards.font_weight IS 'سمك الخط: normal, bold, semibold';
COMMENT ON COLUMN public.roadmap_cards.title_font_size IS 'حجم خط العنوان';
COMMENT ON COLUMN public.roadmap_cards.content_font_size IS 'حجم خط المحتوى';
COMMENT ON COLUMN public.roadmap_cards.external_widget_url IS 'رابط الـ widget الخارجي';
COMMENT ON COLUMN public.roadmap_cards.widget_type IS 'نوع الـ widget';
COMMENT ON COLUMN public.roadmap_cards.widget_config IS 'إعدادات إضافية للـ widget بصيغة JSON';