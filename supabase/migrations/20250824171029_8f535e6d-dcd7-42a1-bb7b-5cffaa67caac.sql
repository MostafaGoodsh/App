-- Update the sample Ms-Ra mining card content with a proper title
UPDATE app_content 
SET text_content = 'العملة الرقمية - Ms-Ra'
WHERE content_key = 'msra_mining_card_main' AND content_type = 'msra_mining_card';