ALTER TABLE public.home_page_cards DROP CONSTRAINT valid_card_type;
ALTER TABLE public.home_page_cards ADD CONSTRAINT valid_card_type CHECK (card_type IN ('standard', 'learning', 'reels', 'updates', 'tasks', 'callout', 'identity', 'wallet', 'anubis', 'custom', 'live_stream'));

INSERT INTO home_page_cards (title, title_en, description, description_en, slug, card_type, display_order, is_active, is_coming_soon, route_path, background_image)
VALUES ('Live | البث المباشر', 'Live Stream', 'للأعضاء المعتمدين والمؤثرين', 'For verified members and influencers', 'live-stream', 'live_stream', 9, true, false, '/live-stream', '/lovable-uploads/egyptian-cat-wings-live.jpg');