-- تحديث مستويات التعدين إلى 3 مستويات فقط: أساسي وفضي وذهبي

-- حذف المستويات الحالية
DELETE FROM mining_levels;

-- إضافة المستويات الثلاثة الجديدة
INSERT INTO mining_levels (level_number, level_name, required_account_strength, mining_rate_per_hour, upgrade_cost) VALUES
  (1, 'أساسي', 0, 1.0000, 0.00),
  (2, 'فضي', 1000, 5.0000, 500.00),
  (3, 'ذهبي', 5000, 15.0000, 2500.00);

-- إضافة محتوى جديد لصفحة RWA
INSERT INTO app_content (content_key, content_type, text_content, position_order, is_active) 
VALUES 
  ('cultural_assets_title', 'text', 'التراث الثقافي', 44, true),
  ('cultural_assets_content', 'text', 'أصول تراثية وثقافية مصرية مرموزة', 45, true),
  ('commercial_title', 'text', 'التجاري', 46, true),
  ('commercial_content', 'text', 'المشاريع التجارية والصناعية', 47, true),
  ('rwa_main_title', 'text', 'ما هو MSR-RWA؟', 48, true),
  ('rwa_intro', 'text', 'MSR-RWA يتيح لك الاستثمار في الأصول الحقيقية المصرية من خلال التكنولوجيا البلوك تشين، مما يوفر فرص استثمارية آمنة ومربحة.', 49, true)
ON CONFLICT (content_key) 
DO UPDATE SET 
  text_content = EXCLUDED.text_content,
  position_order = EXCLUDED.position_order,
  is_active = EXCLUDED.is_active;