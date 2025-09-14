-- إضافة سياسات الأمان لمجلد reels-videos
-- السماح للمستخدمين المصرح لهم برفع فيديوهات الريلز

-- إنشاء سياسات للوصول إلى ملفات الريلز
CREATE POLICY "Allow authenticated users to upload reel videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'reels-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to view reel videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'reels-videos');

CREATE POLICY "Allow authenticated users to update reel videos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'reels-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete reel videos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'reels-videos' 
  AND auth.role() = 'authenticated'
);