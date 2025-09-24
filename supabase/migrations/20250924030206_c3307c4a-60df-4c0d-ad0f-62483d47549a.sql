-- تحديث عناوين ووصف جميع الكروت لتكون بالإنجليزي أولاً من اليسار

-- تحديث كارت أنوبيس
UPDATE app_content 
SET text_content = 'Digital Vault | الخزانة الرقمية'
WHERE content_key = 'anubis_card_title' AND is_active = true;

UPDATE app_content 
SET text_content = 'The first of its kind in the world (coming soon) | الأولي من نوعها في العالم (قريبا)
Exclusive..From Egypt with love'
WHERE content_key = 'anubis_card_description' AND is_active = true;

-- تحديث كارت الهوية
UPDATE app_content 
SET text_content = 'Identity Verification | توثيق الهوية'
WHERE content_key = 'identity_card_title' AND is_active = true;

UPDATE app_content 
SET text_content = 'Verify your identity easily and securely to access all platform features | توثيق هويتك بسهولة وأمان للحصول على جميع مزايا المنصة'
WHERE content_key = 'identity_card_description' AND is_active = true;

-- تحديث كارت التعلم
UPDATE app_content 
SET text_content = 'Learning Timeline | المنصة'
WHERE content_key = 'learning_card_title' AND is_active = true;

UPDATE app_content 
SET text_content = 'Learn everything you need to know about cryptocurrencies and modern financial technologies | تعلم كل ما تحتاج معرفته عن العملات الرقمية والتقنيات المالية الحديثة'
WHERE content_key = 'learning_card_description' AND is_active = true;

UPDATE app_content 
SET text_content = 'Learn about cryptocurrencies and blockchain | تعلم عن العملات الرقمية والبلوك تشين'
WHERE content_key = 'learning_card_main_description' AND is_active = true;

-- تحديث كارت المحفظة
UPDATE app_content 
SET text_content = 'Digital Wallet | المحفظة'
WHERE content_key = 'wallet_card_title' AND is_active = true;

UPDATE app_content 
SET text_content = 'Secure and advanced wallet for storing and managing your cryptocurrencies with the latest security technologies | محفظة آمنة ومتقدمة لحفظ وإدارة عملاتك الرقمية مع أحدث تقنيات الأمان'
WHERE content_key = 'wallet_card_description' AND is_active = true;

UPDATE app_content 
SET text_content = 'Keep your cryptocurrencies secure | احتفظ بعملاتك الرقمية بأمان'
WHERE content_key = 'wallet_card_main_description' AND is_active = true;

UPDATE app_content 
SET text_content = 'Digital Wallet | المحفظة الرقمية'
WHERE content_key = 'wallet_card_main_title' AND is_active = true;