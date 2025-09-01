-- إضافة محتوى جديد لتحسين إدارة المحتوى والصفحات
INSERT INTO app_content (content_key, content_type, text_content, position_order, is_active) 
VALUES 
  -- محتوى جديد لصفحة RWA
  ('cultural_assets_title', 'rwa_content', 'التراث الثقافي', 44, true),
  ('cultural_assets_content', 'rwa_content', 'أصول تراثية وثقافية مصرية مرموزة', 45, true),
  ('commercial_title', 'rwa_content', 'التجاري', 46, true),
  ('commercial_content', 'rwa_content', 'المشاريع التجارية والصناعية', 47, true),
  ('rwa_main_title', 'rwa_content', 'ما هو MSR-RWA؟', 48, true),
  ('rwa_intro', 'rwa_content', 'MSR-RWA يتيح لك الاستثمار في الأصول الحقيقية المصرية من خلال التكنولوجيا البلوك تشين، مما يوفر فرص استثمارية آمنة ومربحة.', 49, true),
  ('rwa_status', 'rwa_content', 'المنصة قيد التطوير ويتم العمل على إطلاقها قريباً مع شركاء استراتيجيين', 50, true),
  
  -- تحسين محتوى كروت الصفحة الرئيسية
  ('wallet_card_main_title', 'wallet_card', 'المحفظة الرقمية', 70, true),
  ('wallet_card_main_description', 'wallet_card', 'احتفظ بعملاتك الرقمية بأمان', 71, true),
  ('learning_card_main_title', 'learning_card', 'التعلم والمعرفة', 72, true),
  ('learning_card_main_description', 'learning_card', 'تعلم عن العملات الرقمية والبلوك تشين', 73, true)
ON CONFLICT (content_key) 
DO UPDATE SET 
  content_type = EXCLUDED.content_type,
  text_content = EXCLUDED.text_content,
  position_order = EXCLUDED.position_order,
  is_active = EXCLUDED.is_active;