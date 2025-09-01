-- تحديث محتوى الأزرار وكارت التعدين
UPDATE app_content SET 
  text_content = 'آخر التحديثات | Updates',
  content_key = 'hero_cta_2',
  is_active = true,
  position_order = 11
WHERE content_key = 'hero_cta_2';

-- إدراج أو تحديث الأزرار الجديدة
INSERT INTO app_content (content_key, content_type, text_content, position_order, is_active) 
VALUES 
  ('hero_cta_3', 'hero_button', 'MSR stable coin', 12, true),
  ('hero_cta_4', 'hero_button', 'MSR-RWA real world assets', 13, true),
  ('hero_cta_5', 'hero_button', 'Call out', 14, true)
ON CONFLICT (content_key) 
DO UPDATE SET 
  text_content = EXCLUDED.text_content,
  position_order = EXCLUDED.position_order,
  is_active = EXCLUDED.is_active;

-- تحديث كارت التعدين - إزالة "تعدين مس را" وتحسين العنوان
UPDATE app_content SET 
  text_content = '$MsRa Mining'
WHERE content_key = 'mining' AND content_type = 'msra_mining_card';

-- تحديث عنوان كارت التعدين الآخر
UPDATE app_content SET 
  text_content = 'Mining Dashboard'
WHERE content_key = 'msra_mining_card_title';