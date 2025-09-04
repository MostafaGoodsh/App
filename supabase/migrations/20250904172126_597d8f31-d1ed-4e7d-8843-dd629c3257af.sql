-- حذف السياسات القديمة إذا وجدت
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- إنشاء سياسات جديدة وصحيحة للـ avatars bucket
CREATE POLICY "Allow public read access on avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated users to upload avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to update their own avatars" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own avatars" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL 
  AND auth.uid()::text = (storage.foldername(name))[1]
);