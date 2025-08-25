-- إدراج محتوى التطبيق الافتراضي
INSERT INTO app_content (content_key, content_type, text_content, position_order, is_active) VALUES
-- نصوص الصفحة الرئيسية
('hero_title', 'text', 'منصة مصر للعملات المشفرة', 1, true),
('hero_subtitle', 'text', 'اكتشف مستقبل التمويل الرقمي مع منصة مصر المتقدمة للعملات المشفرة', 2, true),
('features_title', 'text', 'ميزات المنصة', 3, true),
('wallet_feature_title', 'text', 'محفظة آمنة', 4, true),
('wallet_feature_desc', 'text', 'محفظة رقمية آمنة ومتقدمة لحفظ عملاتك المشفرة', 5, true),
('learning_feature_title', 'text', 'التعلم والتطوير', 6, true),
('learning_feature_desc', 'text', 'مواد تعليمية شاملة لفهم عالم العملات المشفرة', 7, true),
('mining_feature_title', 'text', 'التعدين الذكي', 8, true),
('mining_feature_desc', 'text', 'نظام تعدين متطور يساعدك على كسب العملات الرقمية', 9, true),

-- نصوص الشريط الجانبي
('sidebar_main_navigation', 'text', 'التنقل الرئيسي', 10, true),
('sidebar_early_access', 'text', 'الوصول المبكر', 11, true),
('sidebar_admin_panel', 'text', 'لوحة التحكم', 12, true),
('sidebar_home', 'text', 'الرئيسية', 13, true),
('sidebar_learning', 'text', 'التعلم', 14, true),
('sidebar_wallet', 'text', 'المحفظة', 15, true),
('sidebar_mining', 'text', 'التعدين', 16, true),
('sidebar_identity', 'text', 'الهوية', 17, true),
('sidebar_surveys', 'text', 'الاستبيانات', 18, true),
('sidebar_join_now', 'text', 'انضم الآن', 19, true),
('sidebar_login', 'text', 'تسجيل الدخول', 20, true),
('sidebar_logout', 'text', 'تسجيل الخروج', 21, true),

-- نصوص لوحة الإدارة
('admin_users_management', 'text', 'إدارة المستخدمين', 22, true),
('admin_kyc_management', 'text', 'إدارة الهوية', 23, true),
('admin_surveys_management', 'text', 'إدارة الاستبيانات', 24, true),
('admin_learning_management', 'text', 'إدارة التعلم', 25, true),
('admin_content_management', 'text', 'إدارة محتوى التطبيق', 26, true),

-- نصوص صفحة المحفظة
('wallet_page_title', 'text', 'محفظتك الرقمية', 27, true),
('wallet_balance', 'text', 'الرصيد', 28, true),
('wallet_transactions', 'text', 'المعاملات', 29, true),

-- نصوص صفحة التعدين
('mining_page_title', 'text', 'لوحة التعدين', 30, true),
('mining_current_rate', 'text', 'معدل التعدين الحالي', 31, true),
('mining_total_mined', 'text', 'إجمالي المُعدّن', 32, true),

-- نصوص عامة
('app_name', 'text', 'Crypto-MSR', 33, true),
('app_platform_name', 'text', 'منصة مصر', 34, true),
('loading_text', 'text', 'جاري التحميل...', 35, true),
('save_text', 'text', 'حفظ', 36, true),
('cancel_text', 'text', 'إلغاء', 37, true),
('edit_text', 'text', 'تعديل', 38, true),
('delete_text', 'text', 'حذف', 39, true),
('add_text', 'text', 'إضافة', 40, true),

-- كارت التعدين Ms-Ra
('msra_mining_card_title', 'msra_mining_card', 'تعدين Ms-Ra', 50, true)
ON CONFLICT (content_key) DO UPDATE SET
  text_content = EXCLUDED.text_content,
  updated_at = now();