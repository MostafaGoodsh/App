-- Fix page 1: PDF page 3 in Warsh Madinah is سورة الفاتحة
UPDATE public.quran_pages SET surah_name = 'سورة الفاتحة', arabic_text = 'صفحة 1 - سورة الفاتحة' WHERE page_number = 1;

-- Fix page 2: PDF page 4 is still سورة البقرة, that's correct
UPDATE public.quran_pages SET arabic_text = 'صفحة 2 - سورة البقرة' WHERE page_number = 2;