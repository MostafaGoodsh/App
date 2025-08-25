-- Fix the content_key for hero_subtitle_fate
UPDATE app_content 
SET content_key = 'hero_subtitle_fate'
WHERE content_key = '08:00' AND text_content = 'FATE';

-- Update all hero content to be active for testing
UPDATE app_content 
SET is_active = true 
WHERE content_key IN (
  'hero_subtitle_origin', 
  'hero_subtitle', 
  'hero_middle_subtitle', 
  'hero_subtitle_fate'
);