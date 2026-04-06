ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name_en text,
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS job_title_en text;