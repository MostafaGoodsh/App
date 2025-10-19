-- Fix RLS policies for avatars storage bucket to allow admin uploads
-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can upload to roadmap folders" ON storage.objects;
DROP POLICY IF EXISTS "Public can view roadmap images" ON storage.objects;

-- Allow admins to upload to roadmap-icons and roadmap-covers folders
CREATE POLICY "Admins can upload to roadmap folders"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] IN ('roadmap-icons', 'roadmap-covers')
  AND (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

-- Allow public to view roadmap images
CREATE POLICY "Public can view roadmap images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] IN ('roadmap-icons', 'roadmap-covers')
);