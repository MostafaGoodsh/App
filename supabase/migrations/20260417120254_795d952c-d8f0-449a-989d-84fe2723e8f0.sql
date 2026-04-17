UPDATE roadmap_cards 
SET widget_config = jsonb_set(widget_config, '{payment_type}', '"liquidity"')
WHERE slug = 'money-house-pool';