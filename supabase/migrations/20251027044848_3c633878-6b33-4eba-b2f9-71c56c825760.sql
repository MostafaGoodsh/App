-- إضافة عملات اشتراك Anubis
INSERT INTO public.internal_tokens (symbol, name, description, exchange_rate_usd, is_active, icon_url)
VALUES 
  ('ANUBIS_BASIC_30D', 'Anubis Basic - 30 Days', 'اشتراك أساسي في الخزانة الرقمية لمدة 30 يوم', 1, true, '🔐'),
  ('ANUBIS_PREMIUM_90D', 'Anubis Premium - 90 Days', 'اشتراك بريميوم في الخزانة الرقمية لمدة 90 يوم', 1, true, '👑'),
  ('ANUBIS_LIFETIME_36500D', 'Anubis Lifetime', 'اشتراك مدى الحياة في الخزانة الرقمية', 1, true, '♾️')
ON CONFLICT (symbol) DO NOTHING;
