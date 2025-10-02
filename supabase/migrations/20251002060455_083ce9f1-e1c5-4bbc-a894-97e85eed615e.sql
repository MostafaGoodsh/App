-- Update check constraint to allow 'quran' section type
ALTER TABLE public.task_section_introductions 
DROP CONSTRAINT task_section_introductions_section_type_check;

ALTER TABLE public.task_section_introductions 
ADD CONSTRAINT task_section_introductions_section_type_check 
CHECK (section_type = ANY (ARRAY['general'::text, 'daily_tasks'::text, 'media_content'::text, 'personality_tasks'::text, 'quran'::text]));

-- Insert default Quran introduction
INSERT INTO public.task_section_introductions (section_type, title, title_en, content, content_en, text_direction, is_active)
VALUES (
  'quran',
  'قراءة القرآن الكريم',
  'Read the Holy Quran',
  'اقرأ صفحات من القرآن الكريم واحصل على النقاط. استمتع بالقراءة مع الترجمة الإنجليزية لفهم أعمق للمعاني.',
  'Read pages from the Holy Quran and earn points. Enjoy reading with English translation for deeper understanding.',
  'rtl',
  true
)
ON CONFLICT (section_type) DO NOTHING;