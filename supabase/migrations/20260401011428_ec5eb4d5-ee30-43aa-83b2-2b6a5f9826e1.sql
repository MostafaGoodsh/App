UPDATE public.quran_pages 
SET arabic_image_url = 'https://archive.org/download/quran-warsh/page/n' || page_number || '.jpg'
WHERE true;