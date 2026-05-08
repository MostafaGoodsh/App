-- Game settings table for Lucky Dice and Lucky Slots admin control
CREATE TABLE IF NOT EXISTS public.game_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  spin_cost_xp INTEGER NOT NULL DEFAULT 10,
  rewards JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view game settings"
  ON public.game_settings FOR SELECT USING (true);

CREATE POLICY "Admins manage game settings"
  ON public.game_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_game_settings_updated_at
  BEFORE UPDATE ON public.game_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed defaults
INSERT INTO public.game_settings (game_key, title, spin_cost_xp, rewards) VALUES
('lucky_dice', 'Lucky Dice', 5, '{"double_six":200,"lucky_seven":50,"any_double":30,"ten_plus":15}'::jsonb),
('lucky_slots', 'Lucky Slots', 10, '{"five_super":1000,"five_mid_super":500,"five_any":300,"five_mid":200,"four_match":100,"three_match":20}'::jsonb)
ON CONFLICT (game_key) DO NOTHING;

-- Quran translations columns
ALTER TABLE public.quran_pages
  ADD COLUMN IF NOT EXISTS translation_en TEXT,
  ADD COLUMN IF NOT EXISTS translation_ru TEXT;