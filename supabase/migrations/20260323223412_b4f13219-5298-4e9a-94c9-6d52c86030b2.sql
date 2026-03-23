
-- جدول جولات البيع المبكر (Presale Rounds)
CREATE TABLE public.presale_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  token_price NUMERIC NOT NULL DEFAULT 0.01,
  currency TEXT NOT NULL DEFAULT 'USD',
  total_supply NUMERIC NOT NULL DEFAULT 0,
  sold_amount NUMERIC NOT NULL DEFAULT 0,
  min_purchase NUMERIC NOT NULL DEFAULT 1,
  max_purchase NUMERIC,
  stage TEXT NOT NULL DEFAULT 'seed',
  status TEXT NOT NULL DEFAULT 'upcoming',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.presale_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active presale rounds" ON public.presale_rounds
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage presale rounds" ON public.presale_rounds
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- جدول الروابط الرسمية (Official Links)
CREATE TABLE public.official_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  url TEXT NOT NULL,
  icon_name TEXT,
  icon_url TEXT,
  category TEXT DEFAULT 'social',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.official_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active official links" ON public.official_links
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage official links" ON public.official_links
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
