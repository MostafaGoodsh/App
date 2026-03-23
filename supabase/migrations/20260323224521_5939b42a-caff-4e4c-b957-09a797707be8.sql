
CREATE TABLE IF NOT EXISTS public.ui_card_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_key text UNIQUE NOT NULL,
  card_label text NOT NULL,
  card_label_en text,
  page_name text NOT NULL DEFAULT 'general',
  background_image text,
  background_color text,
  background_gradient text,
  text_color text,
  title_color text,
  font_family text DEFAULT 'Cairo',
  font_size text DEFAULT 'medium',
  font_weight text DEFAULT 'normal',
  title_font_size text DEFAULT 'large',
  title_font_weight text DEFAULT 'bold',
  title_text_align text DEFAULT 'right',
  description_text_align text DEFAULT 'right',
  icon_url text,
  overlay_opacity numeric DEFAULT 0.6,
  border_color text,
  border_radius text DEFAULT 'xl',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ui_card_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ui_card_settings" ON public.ui_card_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage ui_card_settings" ON public.ui_card_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.ui_card_settings (card_key, card_label, card_label_en, page_name, background_gradient, display_order) VALUES
  ('profile_header', 'كارت الملف الشخصي', 'Profile Header Card', 'profile', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 1),
  ('profile_stats', 'إحصائيات الحساب', 'Account Stats Card', 'profile', 'linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)', 2),
  ('profile_engagement', 'إحصائيات التفاعل', 'Engagement Stats Card', 'profile', NULL, 3),
  ('profile_follow', 'المتابعات', 'Follow Stats Card', 'profile', NULL, 4),
  ('tasks_intro_general', 'مقدمة المهام العامة', 'General Tasks Intro', 'daily_tasks', NULL, 5),
  ('tasks_intro_personality', 'مقدمة مهام الشخصية', 'Personality Tasks Intro', 'daily_tasks', NULL, 6),
  ('tasks_daily_card', 'كارت المهام اليومية', 'Daily Tasks Card', 'daily_tasks', NULL, 7),
  ('streak_current', 'السلسلة الحالية', 'Current Streak', 'daily_tasks', 'linear-gradient(to bottom right, #fff7ed, #fef2f2)', 8),
  ('streak_longest', 'أطول سلسلة', 'Longest Streak', 'daily_tasks', 'linear-gradient(to bottom right, #faf5ff, #fdf2f8)', 9),
  ('streak_sessions', 'إجمالي الجلسات', 'Total Sessions', 'daily_tasks', 'linear-gradient(to bottom right, #eff6ff, #eef2ff)', 10),
  ('streak_score', 'قوة الحساب', 'Profile Score', 'daily_tasks', 'linear-gradient(to bottom right, #f0fdf4, #ecfdf5)', 11),
  ('mining_control', 'لوحة التعدين', 'Mining Control Panel', 'mining', NULL, 12),
  ('mining_stats', 'إحصائيات التعدين', 'Mining Stats', 'mining', NULL, 13),
  ('mining_level', 'مستوى التعدين', 'Mining Level', 'mining', NULL, 14),
  ('learning_timeline', 'الجدول الزمني للتعلم', 'Learning Timeline', 'learning', NULL, 15),
  ('wallet_overview', 'نظرة عامة المحفظة', 'Wallet Overview', 'wallet', NULL, 16),
  ('reels_card', 'كارت الريلز', 'Reels Card', 'reels', NULL, 17),
  ('surveys_card', 'كارت الاستبيانات', 'Surveys Card', 'surveys', NULL, 18)
ON CONFLICT (card_key) DO NOTHING;
