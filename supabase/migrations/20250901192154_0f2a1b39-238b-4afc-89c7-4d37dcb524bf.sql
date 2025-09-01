-- تحديث كارت التعدين وإضافة المحتوى الجديد للصفحات المنبثقة

-- تحديث عنوان كارت التعدين لإزالة النص العربي
UPDATE app_content SET 
  text_content = '$MsRa Mining'
WHERE content_key = 'msra_mining_card_main' OR content_key = 'mining';

-- إضافة محتوى الصفحات الجديدة
INSERT INTO app_content (content_key, content_type, text_content, position_order, is_active) 
VALUES 
  -- محتوى صفحة التحديثات
  ('updates_title', 'text', 'آخر التحديثات | Latest Updates', 20, true),
  ('updates_description', 'text', 'تابع آخر الأخبار والتحديثات في منصة Crypto-MSR', 21, true),
  ('update_1_title', 'text', 'تحديث المنصة v2.0', 22, true),
  ('update_1_content', 'text', 'تم إطلاق التحديث الجديد للمنصة مع تحسينات في الأداء وواجهة المستخدم الجديدة.', 23, true),
  
  -- محتوى صفحة العملة المستقرة
  ('stable_coin_title', 'text', 'MSR Stable Coin', 30, true),
  ('stable_coin_description', 'text', 'العملة المستقرة المدعومة بالأصول المصرية', 31, true),
  ('stability_title', 'text', 'الاستقرار والثبات', 32, true),
  ('stability_content', 'text', 'عملة مستقرة مدعومة بالأصول الحقيقية في مصر لضمان الثبات والأمان', 33, true),
  
  -- محتوى صفحة الأصول الحقيقية
  ('rwa_title', 'text', 'MSR-RWA Real World Assets', 40, true),
  ('rwa_description', 'text', 'استثمر في الأصول الحقيقية المرموزة من مصر', 41, true),
  ('real_estate_title', 'text', 'العقارات', 42, true),
  ('real_estate_content', 'text', 'استثمر في العقارات المصرية المرموزة', 43, true),
  
  -- محتوى صفحة Call Out
  ('call_out_title', 'text', 'Call Out - انضم للمجتمع', 50, true),
  ('call_out_description', 'text', 'شارك أفكارك ومقترحاتك لتطوير منصة Crypto-MSR', 51, true),
  ('feedback_title', 'text', 'شارك رأيك وأفكارك', 52, true),
  ('feedback_description', 'text', 'نحن نقدر ملاحظاتك ومقترحاتك لتحسين المنصة', 53, true),
  
  -- نصوص عامة
  ('coming_soon_title', 'text', 'قريباً', 60, true),
  ('coming_soon_description', 'text', 'نعمل باستمرار على تطوير المنصة وإضافة ميزات جديدة', 61, true)
ON CONFLICT (content_key) 
DO UPDATE SET 
  text_content = EXCLUDED.text_content,
  position_order = EXCLUDED.position_order,
  is_active = EXCLUDED.is_active;