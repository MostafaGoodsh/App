CREATE POLICY "Auth update wheel images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'wheel-images')
WITH CHECK (bucket_id = 'wheel-images');