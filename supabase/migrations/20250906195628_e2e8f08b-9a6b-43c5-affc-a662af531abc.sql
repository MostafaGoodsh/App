-- Add text_direction column to daily_media_content table
ALTER TABLE public.daily_media_content 
ADD COLUMN text_direction text DEFAULT 'rtl';

-- Add text_direction column to personality_development_tasks table  
ALTER TABLE public.personality_development_tasks 
ADD COLUMN text_direction text DEFAULT 'rtl';

-- Add text_direction column to daily_tasks table
ALTER TABLE public.daily_tasks 
ADD COLUMN text_direction text DEFAULT 'rtl';