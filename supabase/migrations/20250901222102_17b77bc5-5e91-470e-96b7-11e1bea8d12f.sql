-- تحديث مستويات التعدين إلى 3 مستويات فقط: أساسي وفضي وذهبي

-- إضافة المستويات الثلاثة الجديدة أولاً
INSERT INTO mining_levels (level_number, level_name, required_account_strength, mining_rate_per_hour, upgrade_cost) VALUES
  (10, 'أساسي', 0, 1.0000, 0.00),
  (11, 'فضي', 1000, 5.0000, 500.00),
  (12, 'ذهبي', 5000, 15.0000, 2500.00);

-- تحديث ملفات المستخدمين لاستخدام المستويات الجديدة
UPDATE user_mining_profiles 
SET current_level = CASE 
  WHEN current_level <= 1 THEN 10  -- أساسي
  WHEN current_level <= 4 THEN 11  -- فضي
  ELSE 12                          -- ذهبي
END;

-- حذف المستويات القديمة
DELETE FROM mining_levels WHERE level_number IN (1,2,3,4,5,6,7);

-- تحديث أرقام المستويات الجديدة للأرقام النهائية
UPDATE mining_levels SET level_number = 1 WHERE level_number = 10;
UPDATE mining_levels SET level_number = 2 WHERE level_number = 11;
UPDATE mining_levels SET level_number = 3 WHERE level_number = 12;

-- تحديث ملفات المستخدمين للأرقام النهائية
UPDATE user_mining_profiles 
SET current_level = CASE 
  WHEN current_level = 10 THEN 1
  WHEN current_level = 11 THEN 2
  WHEN current_level = 12 THEN 3
  ELSE current_level
END;

-- إضافة محتوى جديد لصفحة RWA
INSERT INTO app_content (content_key, content_type, text_content, position_order, is_active) 
VALUES 
  ('cultural_assets_title', 'text', 'التراث الثقافي', 44, true),
  ('cultural_assets_content', 'text', 'أصول تراثية وثقافية مرموزة', 45, true),
  ('commercial_title', 'text', 'التجاري', 46, true),
  ('commercial_content', 'text', 'المشاريع التجارية والصناعية', 47, true),
  ('rwa_main_title', 'text', 'ما هو MSR-RWA؟', 48, true),
  ('rwa_intro', 'text', 'MSR-RWA يتيح لك الاستثمار في الأصول الحقيقية المصرية من خلال التكنولوجيا البلوك تشين، مما يوفر فرص استثمارية آمنة ومربحة.', 49, true)
ON CONFLICT (content_key) 
DO UPDATE SET 
  text_content = EXCLUDED.text_content,
  position_order = EXCLUDED.position_order,
  is_active = EXCLUDED.is_active;