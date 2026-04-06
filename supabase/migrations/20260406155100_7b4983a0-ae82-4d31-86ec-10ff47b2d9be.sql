-- Fix the slug
UPDATE home_page_cards 
SET slug = 'earn'
WHERE id = 'fc8cec7b-14e2-4a96-8aaf-83597bffe01a';

-- Add 'wheel' to allowed card types
ALTER TABLE home_page_cards DROP CONSTRAINT valid_card_type;
ALTER TABLE home_page_cards ADD CONSTRAINT valid_card_type CHECK (card_type IN ('standard', 'learning', 'reels', 'updates', 'tasks', 'callout', 'identity', 'wallet', 'anubis', 'custom', 'live_stream', 'wheel'));