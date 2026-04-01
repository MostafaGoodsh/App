-- Update all quran_pages image URLs to use Internet Archive Warsh Mushaf
UPDATE public.quran_pages 
SET arabic_image_url = 'https://archive.org/download/Quran-warsh-from-nafi/page/n' || page_number || '.jpg'
WHERE true;