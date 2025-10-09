-- إضافة عملة $MsRa للتعدين
INSERT INTO public.internal_tokens (symbol, name, description, exchange_rate_usd, is_active, is_base_currency)
VALUES ('MSRA', 'Ms-Ra Token', 'عملة التعدين - Origin & Fate', 0.01, true, false)
ON CONFLICT (symbol) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = true;