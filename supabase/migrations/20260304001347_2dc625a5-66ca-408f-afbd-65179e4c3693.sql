
ALTER TABLE public.roadmap_cards ADD COLUMN is_coming_soon boolean DEFAULT false;
ALTER TABLE public.home_page_cards ADD COLUMN is_coming_soon boolean DEFAULT false;
