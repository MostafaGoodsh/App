
-- Allow authenticated admins to upload to content-backgrounds
CREATE POLICY "Admins can upload content backgrounds"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'content-backgrounds'
  AND public.is_admin(auth.uid())
);

-- Allow admins to update content backgrounds
CREATE POLICY "Admins can update content backgrounds"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'content-backgrounds'
  AND public.is_admin(auth.uid())
);

-- Allow admins to delete content backgrounds
CREATE POLICY "Admins can delete content backgrounds"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'content-backgrounds'
  AND public.is_admin(auth.uid())
);

-- Allow public read access
CREATE POLICY "Public can read content backgrounds"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'content-backgrounds');
