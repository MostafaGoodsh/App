-- Insert missing card content for the main page
INSERT INTO app_content (content_key, content_type, text_content, image_url, alt_text, position_order, is_active, created_by) VALUES
-- Card images
('wallet_card_image', 'image', NULL, '/lovable-uploads/73294275-1418-4174-b109-0f587abab976.png', 'صورة محفظة العملات الرقمية', 10, true, (SELECT auth.uid())),
('identity_card_image', 'image', NULL, '/lovable-uploads/109a2672-ce6d-4b3b-9e14-10a92facf011.png', 'صورة توثيق الهوية', 11, true, (SELECT auth.uid())),
('learning_card_image', 'image', NULL, '/lovable-uploads/8563c8f8-a309-40a5-a7d0-fca02071546e.png', 'صورة مركز التعلم', 12, true, (SELECT auth.uid())),

-- Card titles
('wallet_card_title', 'text', 'المحفظة الرقمية', NULL, NULL, 13, true, (SELECT auth.uid())),
('identity_card_title', 'text', 'توثيق الهوية', NULL, NULL, 14, true, (SELECT auth.uid())),
('learning_card_title', 'text', 'مركز التعلم', NULL, NULL, 15, true, (SELECT auth.uid())),

-- Card descriptions  
('wallet_card_description', 'text', 'محفظة آمنة ومتقدمة لحفظ وإدارة عملاتك الرقمية مع أحدث تقنيات الأمان', NULL, NULL, 16, true, (SELECT auth.uid())),
('identity_card_description', 'text', 'توثيق هويتك بسهولة وأمان للحصول على جميع مزايا المنصة', NULL, NULL, 17, true, (SELECT auth.uid())),
('learning_card_description', 'text', 'تعلم كل ما تحتاج معرفته عن العملات الرقمية والتقنيات المالية الحديثة', NULL, NULL, 18, true, (SELECT auth.uid())),

-- Hero background and CTA buttons
('hero_background', 'image', NULL, '/lovable-uploads/7c40a16a-fee6-43dd-8d4e-c418b98c2022.png', 'هرم مصري عند الغروب - خلفية أسود وذهبي', 19, true, (SELECT auth.uid())),
('hero_cta', 'hero_button', 'انضم الآن | Join Now', NULL, NULL, 20, true, (SELECT auth.uid())),
('hero_cta_2', 'hero_button', 'قريباً | Coming Soon', NULL, NULL, 21, true, (SELECT auth.uid())),
('hero_cta_3', 'hero_button', 'قريباً | Coming Soon', NULL, NULL, 22, true, (SELECT auth.uid())),
('hero_cta_4', 'hero_button', 'قريباً | Coming Soon', NULL, NULL, 23, true, (SELECT auth.uid()))

ON CONFLICT (content_key) 
DO UPDATE SET 
  content_type = EXCLUDED.content_type,
  text_content = EXCLUDED.text_content,
  image_url = EXCLUDED.image_url,
  alt_text = EXCLUDED.alt_text,
  is_active = EXCLUDED.is_active,
  updated_at = now();