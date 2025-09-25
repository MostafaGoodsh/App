-- Update the fixed image URL in callout card content to use the new Egyptian goddess image
UPDATE public.callout_card_content 
SET fixed_image_url = '/lovable-uploads/egyptian-goddess-wings.jpg'
WHERE is_active = true;