-- Add more content entries for better UI management
INSERT INTO app_content (content_key, content_type, text_content, position_order, is_active) VALUES
-- Hero section additional texts
('hero_subtitle_origin', 'text', 'ORIGIN', 10, true),
('hero_subtitle_fate', 'text', 'FATE', 11, true),
('hero_middle_title', 'text', 'Origin & Fate', 12, true),
('hero_middle_subtitle', 'text', 'الأصل و المصير', 13, true),
('hero_tagline', 'text', 'From Egypt With Love', 14, true),

-- Page meta description
('page_description', 'text', 'منصة بسيطة للعملات الرقمية مع محفظة آمنة وتوثيق الهوية | Simple crypto platform with secure wallet and identity verification', 15, true),

-- Hero background image
('hero_background', 'image', '', '/lovable-uploads/7c40a16a-fee6-43dd-8d4e-c418b98c2022.png', 'هرم مصري عند الغروب - خلفية أسود وذهبي', 20, true),

-- Card section titles and descriptions
('wallet_card_title', 'text', 'المحفظة | Wallet', 30, true),
('wallet_card_description', 'text', 'تجربة سلسة بتصميم أسود وذهبي مع لمسات لازوردية.', 31, true),
('wallet_card_image', 'image', '', '/lovable-uploads/8563c8f8-a309-40a5-a7d0-fca02071546e.png', 'قناع ذهبي مصري - سمة ذهبية مطفأة', 32, true),

('identity_card_title', 'text', 'توثيق الهوية | Identity', 40, true),
('identity_card_description', 'text', 'تجربة سلسة بتصميم أسود وذهبي مع لمسات لازوردية.', 41, true),
('identity_card_image', 'image', '', '/lovable-uploads/45e37627-8629-45b2-ae38-13d37fbeb015.png', 'عنخ ذهبي - هوية ووصول', 42, true),

('learning_card_title', 'text', 'التعلم | Learning', 50, true),
('learning_card_description', 'text', 'تجربة سلسة بتصميم أسود وذهبي مع لمسات لازوردية.', 51, true),
('learning_card_image', 'image', '', '/lovable-uploads/e450db26-52c1-4840-9ce2-f2a921c190a3.png', 'عين داخل مثلث بأجنحة - منصة تعليمية', 52, true);

-- Fix the image_url column for existing image entries
UPDATE app_content SET image_url = '/lovable-uploads/7c40a16a-fee6-43dd-8d4e-c418b98c2022.png' WHERE content_key = 'hero_background';
UPDATE app_content SET image_url = '/lovable-uploads/8563c8f8-a309-40a5-a7d0-fca02071546e.png' WHERE content_key = 'wallet_card_image';
UPDATE app_content SET image_url = '/lovable-uploads/45e37627-8629-45b2-ae38-13d37fbeb015.png' WHERE content_key = 'identity_card_image';
UPDATE app_content SET image_url = '/lovable-uploads/e450db26-52c1-4840-9ce2-f2a921c190a3.png' WHERE content_key = 'learning_card_image';