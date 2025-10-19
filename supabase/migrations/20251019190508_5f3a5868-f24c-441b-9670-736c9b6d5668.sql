-- تنشيط محتوى كارت الخزانة الرقمية
UPDATE app_content 
SET is_active = true 
WHERE content_key = 'wallet_card_main_description';