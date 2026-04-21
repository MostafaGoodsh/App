INSERT INTO public.home_page_cards (
  slug, title, title_en, description, description_en,
  route_path, card_type, card_size, card_shape, card_animation,
  background_gradient, text_color, is_active, display_order
) VALUES (
  'blockchain',
  'بلوكتشين MSR',
  'MSR Blockchain',
  'ساهم في تأسيس شبكة البلوكتشين الخاصة بالمنصة',
  'Help build the MSR blockchain network',
  '/blockchain',
  'standard', 'medium', 'rounded', 'fade',
  'linear-gradient(135deg, hsl(220 70% 20%), hsl(280 60% 25%))',
  '#ffffff', true, 50
)
ON CONFLICT (slug) DO UPDATE SET
  route_path = EXCLUDED.route_path,
  is_active = true;