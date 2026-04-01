INSERT INTO public.internal_tokens (symbol, name, description, decimals, is_active, is_base_currency, exchange_rate_usd)
SELECT 'EGP', 'جنيه مصري', 'Egyptian Pound - الجنيه المصري', 2, true, false, 0.02
WHERE NOT EXISTS (SELECT 1 FROM public.internal_tokens WHERE symbol = 'EGP');