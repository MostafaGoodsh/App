-- تحديث عنوان "money house pool" إلى "مجمع السيولة"
UPDATE public.roadmap_cards
SET 
  title = 'مجمع السيولة',
  title_en = 'Liquidity Pool',
  description = 'نظام متقدم لإدارة السيولة والمكافآت',
  description_en = 'Advanced system for liquidity and rewards management',
  updated_at = now()
WHERE slug = 'money-house-pool';