
-- Add text alignment columns to home_page_cards
ALTER TABLE public.home_page_cards 
  ADD COLUMN IF NOT EXISTS title_text_align text DEFAULT 'center',
  ADD COLUMN IF NOT EXISTS description_text_align text DEFAULT 'center';

-- Create global typography settings table
CREATE TABLE IF NOT EXISTS public.app_typography_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  section_label text NOT NULL,
  section_label_en text,
  font_family text DEFAULT 'Cairo',
  font_size text DEFAULT 'medium',
  font_weight text DEFAULT 'normal',
  text_color text DEFAULT '#ffffff',
  text_align text DEFAULT 'right',
  title_font_family text DEFAULT 'Cairo',
  title_font_size text DEFAULT 'large',
  title_font_weight text DEFAULT 'bold',
  title_text_color text DEFAULT '#ffffff',
  title_text_align text DEFAULT 'center',
  line_height text DEFAULT 'normal',
  letter_spacing text DEFAULT 'normal',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_typography_settings ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read typography settings"
  ON public.app_typography_settings FOR SELECT
  TO authenticated, anon
  USING (true);

-- Admin write
CREATE POLICY "Admins can manage typography settings"
  ON public.app_typography_settings FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Seed default sections
INSERT INTO public.app_typography_settings (section_key, section_label, section_label_en, text_align, title_text_align) VALUES
  ('home_cards', 'بطاقات الصفحة الرئيسية', 'Home Page Cards', 'center', 'center'),
  ('roadmap', 'خارطة الطريق', 'Roadmap', 'center', 'center'),
  ('learning', 'قسم التعلم', 'Learning Section', 'right', 'center'),
  ('profile', 'البروفايل', 'Profile', 'right', 'right'),
  ('daily_tasks', 'المهام اليومية', 'Daily Tasks', 'right', 'center'),
  ('surveys', 'الاستبيانات', 'Surveys', 'right', 'center'),
  ('updates', 'التحديثات', 'Updates', 'right', 'center'),
  ('wallet', 'المحفظة', 'Wallet', 'right', 'center'),
  ('reels', 'الريلز', 'Reels', 'center', 'center'),
  ('callout', 'الاستدعاء', 'Call Out', 'center', 'center'),
  ('general', 'عام', 'General', 'right', 'center')
ON CONFLICT (section_key) DO NOTHING;
