
-- Wheel of Fortune segments table
CREATE TABLE public.wheel_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  label_en TEXT,
  reward_type TEXT NOT NULL DEFAULT 'xp' CHECK (reward_type IN ('xp', 'tokens', 'badge', 'nothing', 'custom')),
  reward_value NUMERIC NOT NULL DEFAULT 0,
  reward_description TEXT,
  color TEXT NOT NULL DEFAULT '#D4AF37',
  probability NUMERIC NOT NULL DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wheel settings table
CREATE TABLE public.wheel_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'عجلة الحظ',
  title_en TEXT DEFAULT 'Wheel of Fortune',
  description TEXT DEFAULT 'جرب حظك واربح جوائز!',
  description_en TEXT DEFAULT 'Try your luck and win prizes!',
  spin_cost_xp INT NOT NULL DEFAULT 0,
  free_spins_per_day INT NOT NULL DEFAULT 1,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  background_color TEXT DEFAULT '#1a1a2e',
  intro_text TEXT,
  intro_text_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User spin history
CREATE TABLE public.wheel_spin_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  segment_id UUID REFERENCES public.wheel_segments(id) ON DELETE SET NULL,
  reward_type TEXT NOT NULL,
  reward_value NUMERIC NOT NULL DEFAULT 0,
  xp_cost INT NOT NULL DEFAULT 0,
  spin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.wheel_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_spin_history ENABLE ROW LEVEL SECURITY;

-- Segments: everyone can read active, admins can manage
CREATE POLICY "Anyone can read active wheel segments" ON public.wheel_segments FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage wheel segments" ON public.wheel_segments FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Settings: everyone can read, admins can manage
CREATE POLICY "Anyone can read wheel settings" ON public.wheel_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage wheel settings" ON public.wheel_settings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Spin history: users see their own, admins see all
CREATE POLICY "Users can read own spin history" ON public.wheel_spin_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own spin history" ON public.wheel_spin_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can read all spin history" ON public.wheel_spin_history FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- Insert default settings
INSERT INTO public.wheel_settings (title, title_en, description, description_en, free_spins_per_day, spin_cost_xp)
VALUES ('عجلة الحظ', 'Wheel of Fortune', 'جرب حظك واربح جوائز رائعة!', 'Try your luck and win amazing prizes!', 1, 50);

-- Insert default segments
INSERT INTO public.wheel_segments (label, label_en, reward_type, reward_value, color, probability, display_order) VALUES
('10 XP', '10 XP', 'xp', 10, '#D4AF37', 25, 1),
('25 XP', '25 XP', 'xp', 25, '#C0392B', 20, 2),
('50 XP', '50 XP', 'xp', 50, '#2ECC71', 15, 3),
('100 XP', '100 XP', 'xp', 100, '#3498DB', 10, 4),
('حظ أفضل', 'Better Luck', 'nothing', 0, '#7F8C8D', 20, 5),
('200 XP', '200 XP', 'xp', 200, '#9B59B6', 5, 6),
('500 XP', '500 XP', 'xp', 500, '#F39C12', 3, 7),
('الجائزة الكبرى', 'Jackpot', 'xp', 1000, '#E74C3C', 2, 8);
