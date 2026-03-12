-- Step 1: Delete the empty/cover pages
DELETE FROM public.quran_pages WHERE page_number IN (0, 1, 2);

-- Step 2: Shift to negative temp values to avoid unique constraint conflicts
UPDATE public.quran_pages SET page_number = -(page_number - 2) WHERE page_number > 2;

-- Step 3: Convert back to positive 
UPDATE public.quran_pages SET page_number = -page_number WHERE page_number < 0;