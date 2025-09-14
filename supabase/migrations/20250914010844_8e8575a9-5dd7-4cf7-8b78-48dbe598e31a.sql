-- إنشاء سياسات الأمان للتخزين لبكت reels-videos

-- السماح للجميع بمشاهدة محتوى الريلز
CREATE POLICY "Anyone can view reels videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'reels-videos');

-- السماح للأدمن برفع الفيديوهات
CREATE POLICY "Admins can upload reels videos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'reels-videos' 
  AND is_admin(auth.uid())
);

-- السماح للأدمن بتحديث الفيديوهات
CREATE POLICY "Admins can update reels videos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'reels-videos' 
  AND is_admin(auth.uid())
);

-- السماح للأدمن بحذف الفيديوهات
CREATE POLICY "Admins can delete reels videos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'reels-videos' 
  AND is_admin(auth.uid())
);