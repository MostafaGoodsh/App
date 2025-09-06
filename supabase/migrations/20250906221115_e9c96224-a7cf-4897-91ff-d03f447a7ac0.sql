-- Create RLS policies for learning-media bucket to allow authenticated users to upload and access files

-- Policy for SELECT (viewing files)
CREATE POLICY "Users can view media files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'learning-media');

-- Policy for INSERT (uploading files)
CREATE POLICY "Authenticated users can upload media files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'learning-media' 
    AND auth.uid() IS NOT NULL
  );

-- Policy for UPDATE (updating file metadata)
CREATE POLICY "Users can update their own media files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'learning-media' 
    AND auth.uid() = owner
  );

-- Policy for DELETE (deleting files)
CREATE POLICY "Users can delete their own media files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'learning-media' 
    AND auth.uid() = owner
  );