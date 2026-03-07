-- Recreate storage RLS policies for content-backgrounds using direct role lookup
-- to avoid auth context mismatch when calling public.is_admin() from storage policies.

DROP POLICY IF EXISTS "Admins can upload content backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update content backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete content backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Public can read content backgrounds" ON storage.objects;

CREATE POLICY "Admins can upload content backgrounds"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-backgrounds'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can update content backgrounds"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content-backgrounds'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'content-backgrounds'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can delete content backgrounds"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-backgrounds'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

CREATE POLICY "Public can read content backgrounds"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'content-backgrounds');