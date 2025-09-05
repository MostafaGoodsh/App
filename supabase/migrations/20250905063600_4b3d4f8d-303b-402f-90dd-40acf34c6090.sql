-- Fix avatars bucket storage policies
-- First delete existing policies for avatars bucket
DELETE FROM storage.policies WHERE bucket_id = 'avatars';

-- Create proper RLS policies for avatars bucket
-- Policy for SELECT: Allow users to view their own avatars (public bucket)
CREATE POLICY "Users can view avatars" ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Policy for INSERT: Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IS NOT NULL
);

-- Policy for UPDATE: Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IS NOT NULL
);

-- Policy for DELETE: Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND auth.uid() IS NOT NULL
);