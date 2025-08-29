-- إضافة محتوى افتراضي للتطبيق
INSERT INTO app_content (content_key, content_type, text_content, image_url, alt_text, position_order, is_active) VALUES 
-- محتوى الصفحة الرئيسية
('app_name', 'text', 'Crypto-MSR', NULL, NULL, 1, true),
('hero_subtitle', 'text', 'محفظة العملات الرقمية الآمنة', NULL, NULL, 2, true),
('page_description', 'text', 'منصة بسيطة للعملات الرقمية مع محفظة آمنة وتوثيق الهوية | Simple crypto platform with secure wallet and identity verification', NULL, NULL, 3, true),

-- أزرار الصفحة الرئيسية
('hero_cta', 'hero_button', 'انضم الآن | Join Now', NULL, NULL, 10, true),
('hero_cta_2', 'hero_button', 'قريباً | Coming Soon', NULL, NULL, 11, true),
('hero_cta_3', 'hero_button', 'قريباً | Coming Soon', NULL, NULL, 12, true),
('hero_cta_4', 'hero_button', 'قريباً | Coming Soon', NULL, NULL, 13, true),

-- صور وبطاقات الواجهة
('hero_background', 'image', NULL, '/lovable-uploads/7c40a16a-fee6-43dd-8d4e-c418b98c2022.png', 'هرم مصري عند الغروب - خلفية أسود وذهبي', 20, true),

('wallet_card_title', 'text', 'محفظة العملات الرقمية', NULL, NULL, 30, true),
('wallet_card_description', 'text', 'إدارة عملاتك الرقمية بأمان وسهولة مع محفظة متعددة العملات', NULL, NULL, 31, true),
('wallet_card_image', 'image', NULL, '/lovable-uploads/placeholder.png', 'صورة محفظة العملات الرقمية', 32, true),

('identity_card_title', 'text', 'توثيق الهوية', NULL, NULL, 40, true),
('identity_card_description', 'text', 'تحقق من هويتك للحصول على مستوى أمان أعلى والوصول للمزيد من الخدمات', NULL, NULL, 41, true),
('identity_card_image', 'image', NULL, '/lovable-uploads/placeholder.png', 'صورة توثيق الهوية', 42, true),

('learning_card_title', 'text', 'تعلم العملات الرقمية', NULL, NULL, 50, true),
('learning_card_description', 'text', 'اكتشف عالم العملات الرقمية من خلال مواد تعليمية شاملة ومبسطة', NULL, NULL, 51, true),
('learning_card_image', 'image', NULL, '/lovable-uploads/placeholder.png', 'صورة التعلم', 52, true),

-- كارت التعدين Ms-Ra
('msra_mining_card_title', 'msra_mining_card', 'تعدين Ms-Ra', '/lovable-uploads/placeholder.png', 'خلفية كارت تعدين Ms-Ra', 60, true)

ON CONFLICT (content_key) DO UPDATE SET
  text_content = EXCLUDED.text_content,
  image_url = EXCLUDED.image_url,
  alt_text = EXCLUDED.alt_text,
  content_type = EXCLUDED.content_type,
  position_order = EXCLUDED.position_order,
  is_active = EXCLUDED.is_active;