
CREATE TABLE public.wheel_upgrade_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  label_en TEXT,
  reward_type TEXT NOT NULL DEFAULT 'mining_boost',
  reward_value NUMERIC NOT NULL DEFAULT 1,
  reward_description TEXT,
  color TEXT NOT NULL DEFAULT '#D4AF37',
  probability NUMERIC NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wheel_upgrade_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active upgrade segments" ON public.wheel_upgrade_segments
  FOR SELECT USING (true);

INSERT INTO public.wheel_upgrade_segments (label, label_en, reward_type, reward_value, color, probability, display_order) VALUES
  ('ترقية تعدين', 'Mining Upgrade', 'mining_upgrade', 1, '#D4AF37', 1, 1),
  ('+10% معدل', '+10% Rate', 'rate_boost', 10, '#1a1a2e', 2, 2),
  ('+5 قوة', '+5 Strength', 'strength_boost', 5, '#B8860B', 1.5, 3),
  ('ترقية مجانية', 'Free Upgrade', 'free_upgrade', 1, '#2d2d44', 0.5, 4),
  ('+20% XP', '+20% XP', 'xp_boost', 20, '#DAA520', 1, 5),
  ('نقاط مضاعفة', 'Double Points', 'double_points', 2, '#0d0d1a', 0.8, 6),
  ('ترقية سريعة', 'Quick Upgrade', 'quick_upgrade', 1, '#C5A028', 0.7, 7),
  ('+50 قوة', '+50 Strength', 'strength_boost', 50, '#1f1f35', 0.3, 8);
