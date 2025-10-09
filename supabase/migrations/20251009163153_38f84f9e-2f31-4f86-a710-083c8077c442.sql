-- تحديث صورة خلفية كارت الاستدعاء
UPDATE public.callout_card_content
SET fixed_image_url = '/lovable-uploads/egyptian-goddess-wings-gold.jpg'
WHERE is_active = true;

-- تحديث صورة خلفية كارت الريلز
UPDATE public.reels_card_content
SET background_image_url = '/lovable-uploads/abu-simbel-statues.jpg'
WHERE is_active = true;