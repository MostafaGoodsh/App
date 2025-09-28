-- إنشاء bucket للصور إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public) 
VALUES ('callout-images', 'callout-images', true)
ON CONFLICT (id) DO NOTHING;

-- إنشاء سياسات لرفع الصور
DROP POLICY IF EXISTS "Authenticated users can upload callout images" ON storage.objects;
CREATE POLICY "Authenticated users can upload callout images"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'callout-images' AND 
  auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Anyone can view callout images" ON storage.objects;
CREATE POLICY "Anyone can view callout images"
ON storage.objects FOR SELECT 
USING (bucket_id = 'callout-images');

DROP POLICY IF EXISTS "Authenticated users can delete their callout images" ON storage.objects;
CREATE POLICY "Authenticated users can delete their callout images"
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'callout-images' AND 
  auth.uid() IS NOT NULL
);

-- تحديث النص الافتراضي في callout_card_content
UPDATE callout_card_content 
SET description = 'العقيدة و الأخلاق هي نقطة تميزنا و تفردنا ، لذلك انشأنا هذا القسم خصيصا لارسال دعوات استدعاء شرفي لكل انسان مؤثر حول العالم و كل من يتبني و يخدم عقيدتنا و أهدافنا ،،، سعدنا بوضعك في قائمة الاستدعاء الشرفيه و يثرينا قبولك.'
WHERE is_active = true;

-- تحديث النص الافتراضي في active_callouts
UPDATE active_callouts 
SET callout_text = 'العقيدة و الأخلاق هي نقطة تميزنا و تفردنا ، لذلك انشأنا هذا القسم خصيصا لارسال دعوات استدعاء شرفي لكل انسان مؤثر حول العالم و كل من يتبني و يخدم عقيدتنا و أهدافنا ،،، سعدنا بوضعك في قائمة الاستدعاء الشرفيه و يثرينا قبولك.';