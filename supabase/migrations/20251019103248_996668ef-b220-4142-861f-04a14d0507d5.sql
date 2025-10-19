-- Add missing columns to roadmap_cards table for page content management
ALTER TABLE public.roadmap_cards 
ADD COLUMN IF NOT EXISTS page_title TEXT,
ADD COLUMN IF NOT EXISTS page_title_en TEXT,
ADD COLUMN IF NOT EXISTS page_content TEXT,
ADD COLUMN IF NOT EXISTS page_content_en TEXT,
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS page_cover_image TEXT,
ADD COLUMN IF NOT EXISTS page_background TEXT,
ADD COLUMN IF NOT EXISTS page_text_color TEXT,
ADD COLUMN IF NOT EXISTS sections JSONB;