-- Update position orders to fix duplicates and add missing hero content
UPDATE app_content SET position_order = -10 WHERE content_key = 'hero_subtitle_origin';
UPDATE app_content SET position_order = -9 WHERE content_key = 'hero_subtitle';
UPDATE app_content SET position_order = -8 WHERE content_key = 'hero_middle_subtitle';
UPDATE app_content SET position_order = -7 WHERE content_key = 'hero_tagline';
UPDATE app_content SET position_order = -6 WHERE content_key = 'hero_subtitle_fate';

-- Insert missing hero content
INSERT INTO app_content (content_key, content_type, text_content, position_order, is_active) VALUES 
('hero_subtitle_origin', 'text', 'ORIGIN', -10, true),
('hero_subtitle', 'text', 'محفظة العملات الرقمية الآمنة', -9, true),
('hero_middle_subtitle', 'text', 'الأصل و المصير', -8, true),
('hero_tagline', 'text', 'From Egypt With Love', -7, true),
('hero_subtitle_fate', 'text', 'FATE', -6, true)
ON CONFLICT (content_key) DO UPDATE SET
  text_content = EXCLUDED.text_content,
  position_order = EXCLUDED.position_order,
  is_active = EXCLUDED.is_active;

-- Fix duplicate position orders for existing content
UPDATE app_content SET position_order = 1 WHERE content_key = 'hero_cta';
UPDATE app_content SET position_order = 2 WHERE content_key = 'app_name';
UPDATE app_content SET position_order = 3 WHERE content_key = 'hero_middle_title';
UPDATE app_content SET position_order = 4 WHERE content_key = 'hero_background';

-- Add missing card content
INSERT INTO app_content (content_key, content_type, text_content, position_order, is_active) VALUES 
('wallet_card_title', 'text', 'المحفظة | Wallet', 30, true),
('wallet_card_description', 'text', 'محفظة رقمية آمنة ومتقدمة لحفظ عملاتك المشفرة', 31, true),
('wallet_card_image', 'image', null, 32, true),
('identity_card_title', 'text', 'توثيق الهوية | Identity', 33, true),
('identity_card_description', 'text', 'تحقق من هويتك للحصول على مزايا إضافية وأمان أكبر', 34, true),
('identity_card_image', 'image', null, 35, true),
('learning_card_title', 'text', 'التعلم | Learning', 36, true),
('learning_card_description', 'text', 'مواد تعليمية شاملة لفهم عالم العملات المشفرة', 37, true),
('learning_card_image', 'image', null, 38, true)
ON CONFLICT (content_key) DO UPDATE SET
  text_content = EXCLUDED.text_content,
  position_order = EXCLUDED.position_order,
  is_active = EXCLUDED.is_active;