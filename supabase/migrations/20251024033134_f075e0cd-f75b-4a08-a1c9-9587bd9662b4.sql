-- Create Anubis Vault storage bucket for secure document storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'anubis-vault',
  'anubis-vault',
  false, -- Private bucket
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Users can only upload to their own folder
CREATE POLICY "Users can upload to their own folder in anubis-vault"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'anubis-vault' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can only view their own files
CREATE POLICY "Users can view their own files in anubis-vault"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'anubis-vault' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can only update their own files
CREATE POLICY "Users can update their own files in anubis-vault"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'anubis-vault' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can only delete their own files
CREATE POLICY "Users can delete their own files in anubis-vault"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'anubis-vault' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);