INSERT INTO ui_card_settings (card_key, card_label, card_label_en, page_name, display_order, is_active)
VALUES 
  ('header_main', 'الهيدر الرئيسي', 'Main Header', 'global', 0, true),
  ('profile_info', 'معلومات الملف الشخصي', 'Profile Info', 'profile', 30, true),
  ('profile_xp', 'نقاط الخبرة', 'XP Points', 'profile', 31, true),
  ('profile_wallets', 'المحافظ المربوطة', 'Connected Wallets', 'profile', 32, true),
  ('profile_surveys', 'الاستبيانات المكتملة', 'Completed Surveys', 'profile', 33, true),
  ('learning_post_crypto', 'بوست التعلم - مالي', 'Learning Post - Crypto', 'learning', 40, true),
  ('learning_post_general', 'بوست التعلم - عام', 'Learning Post - General', 'learning', 41, true),
  ('learning_post_divine', 'بوست التعلم - ديني', 'Learning Post - Divine', 'learning', 42, true)
ON CONFLICT (card_key) DO NOTHING;