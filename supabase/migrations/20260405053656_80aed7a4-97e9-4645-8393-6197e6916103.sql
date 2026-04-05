
ALTER TABLE public.home_page_cards
  ADD COLUMN IF NOT EXISTS card_size text NOT NULL DEFAULT 'large',
  ADD COLUMN IF NOT EXISTS card_shape text NOT NULL DEFAULT 'rounded',
  ADD COLUMN IF NOT EXISTS card_animation text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS min_height text NULL,
  ADD COLUMN IF NOT EXISTS card_opacity numeric NULL DEFAULT 1;
