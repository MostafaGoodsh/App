-- حذف الـ policies القديمة إن وجدت ثم إنشاء جديدة

-- حذف الـ policies القديمة
DROP POLICY IF EXISTS "Anyone can view learning media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload learning media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update learning media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete learning media files" ON storage.objects;

-- السماح للجميع بمشاهدة الملفات
CREATE POLICY "Anyone can view learning media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'learning-media');

-- السماح للـ admins برفع الملفات
CREATE POLICY "Admins can upload learning media files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'learning-media' 
  AND is_admin(auth.uid())
);

-- السماح للـ admins بتحديث الملفات
CREATE POLICY "Admins can update learning media files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'learning-media' 
  AND is_admin(auth.uid())
);

-- السماح للـ admins بحذف الملفات
CREATE POLICY "Admins can delete learning media files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'learning-media' 
  AND is_admin(auth.uid())
);