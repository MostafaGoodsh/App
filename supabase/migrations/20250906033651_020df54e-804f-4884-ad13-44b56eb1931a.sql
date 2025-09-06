-- إضافة أعمدة اللغة الإنجليزية للجداول الثلاثة
ALTER TABLE public.daily_media_content 
ADD COLUMN title_en TEXT,
ADD COLUMN description_en TEXT;

ALTER TABLE public.personality_development_tasks 
ADD COLUMN title_en TEXT,
ADD COLUMN description_en TEXT;

ALTER TABLE public.daily_tasks 
ADD COLUMN title_en TEXT,
ADD COLUMN description_en TEXT;