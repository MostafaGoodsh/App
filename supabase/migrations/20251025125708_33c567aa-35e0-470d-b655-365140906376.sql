-- Create anubis-vault bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('anubis-vault', 'anubis-vault', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own files in anubis-vault" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload files to their own folder in anubis-vault" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files in anubis-vault" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files in anubis-vault" ON storage.objects;

-- Create policy for viewing own files
CREATE POLICY "Users can view their own files in anubis-vault"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'anubis-vault' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for uploading files
CREATE POLICY "Users can upload files to their own folder in anubis-vault"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'anubis-vault' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for updating own files
CREATE POLICY "Users can update their own files in anubis-vault"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'anubis-vault' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for deleting own files
CREATE POLICY "Users can delete their own files in anubis-vault"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'anubis-vault' AND
  auth.uid()::text = (storage.foldername(name))[1]
);