
CREATE TABLE public.wheel_outer_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  label_en TEXT,
  reward_value NUMERIC NOT NULL DEFAULT 1,
  color TEXT NOT NULL DEFAULT '#D4AF37',
  probability NUMERIC NOT NULL DEFAULT 10,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wheel_outer_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active outer segments" ON public.wheel_outer_segments FOR SELECT USING (true);
CREATE POLICY "Admins can manage outer segments" ON public.wheel_outer_segments FOR ALL USING (true);

-- Seed with the current hardcoded values
INSERT INTO public.wheel_outer_segments (label, label_en, reward_value, color, display_order) VALUES
  ('1 $MS-RA', '1 $MS-RA', 1, '#D4AF37', 1),
  ('2 $MS-RA', '2 $MS-RA', 2, '#1a1a2e', 2),
  ('5 $MS-RA', '5 $MS-RA', 5, '#B8860B', 3),
  ('0.5 $MS-RA', '0.5 $MS-RA', 0.5, '#2d2d44', 4),
  ('10 $MS-RA', '10 $MS-RA', 10, '#DAA520', 5),
  ('3 $MS-RA', '3 $MS-RA', 3, '#0d0d1a', 6),
  ('0.1 $MS-RA', '0.1 $MS-RA', 0.1, '#C5A028', 7),
  ('7 $MS-RA', '7 $MS-RA', 7, '#1f1f35', 8);
