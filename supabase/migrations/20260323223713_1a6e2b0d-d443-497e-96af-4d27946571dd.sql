
-- جدول إعدادات كروت المحافظ
CREATE TABLE public.wallet_card_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  background_image TEXT,
  background_color TEXT,
  background_gradient TEXT,
  text_color TEXT,
  font_family TEXT DEFAULT 'Cairo',
  font_size TEXT DEFAULT 'medium',
  font_weight TEXT DEFAULT 'normal',
  title_font_size TEXT DEFAULT 'large',
  title_text_align TEXT DEFAULT 'right',
  description_text_align TEXT DEFAULT 'right',
  icon_url TEXT,
  overlay_opacity NUMERIC DEFAULT 0.6,
  border_color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_card_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wallet card settings" ON public.wallet_card_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage wallet card settings" ON public.wallet_card_settings
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- إدراج الإعدادات الافتراضية
INSERT INTO public.wallet_card_settings (card_key, title, title_en, display_order) VALUES
  ('solana', 'محفظة سولانا', 'Solana Wallet', 1),
  ('pi', 'محفظة باي', 'Pi Wallet', 2),
  ('ton', 'محفظة تون', 'TON Wallet', 3);
