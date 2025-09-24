-- تحديث نصوص الأزرار لتكون بالإنجليزي أولاً من اليسار
UPDATE app_content 
SET text_content = 'Join Now | انضم الآن'
WHERE content_key = 'hero_cta' AND is_active = true;

UPDATE app_content 
SET text_content = 'Updates | آخر التحديثات'
WHERE content_key = 'hero_cta_2' AND is_active = true;

UPDATE app_content 
SET text_content = 'Call out | إستدعاء شرفي'
WHERE content_key = 'hero_cta_5' AND is_active = true;