-- إنشاء جدول للكروت الدائرية المميزة
CREATE TABLE public.roadmap_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  description_en TEXT,
  background_color TEXT DEFAULT '#1a1a2e',
  background_gradient TEXT DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  icon_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- محتوى الصفحة الداخلية
  page_title TEXT,
  page_title_en TEXT,
  page_content TEXT,
  page_content_en TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  
  -- metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- تفعيل RLS
ALTER TABLE public.roadmap_cards ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بمشاهدة الكروت النشطة
CREATE POLICY "Anyone can view active roadmap cards"
  ON public.roadmap_cards
  FOR SELECT
  USING (is_active = true);

-- السماح للإداريين بإدارة الكروت
CREATE POLICY "Admins can manage roadmap cards"
  ON public.roadmap_cards
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- إضافة trigger للتحديث التلقائي
CREATE TRIGGER update_roadmap_cards_updated_at
  BEFORE UPDATE ON public.roadmap_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- إدراج البيانات الابتدائية
INSERT INTO public.roadmap_cards (title, title_en, slug, description, description_en, background_gradient, display_order) VALUES
('الورقة البيضاء', 'White Paper', 'white-paper', 'تفاصيل المشروع الكاملة', 'Complete project details', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 1),
('البيع المسبق وعنوان العقد', 'Pre-sale & Early Contract Address', 'pre-sale', 'معلومات البيع المسبق', 'Pre-sale information', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 2),
('المجموعة الأساسية والداخلية', 'Core Group, Insider Group', 'core-group', 'انضم للمجموعات المميزة', 'Join exclusive groups', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 3),
('التوزيع الاقتصادي', 'Tokenomics', 'tokenomics', 'هيكل توزيع العملات', 'Token distribution structure', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 4),
('مجمع بيت المال', 'Money House Pool', 'money-house-pool', 'مجمع السيولة المالية', 'Financial liquidity pool', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 5);