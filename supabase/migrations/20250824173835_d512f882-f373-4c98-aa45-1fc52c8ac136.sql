-- Update the identity-documents bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'identity-documents';

-- Create storage policies for public access to identity documents (admin only)
CREATE POLICY "Admins can view identity documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'identity-documents' AND 
  is_admin(auth.uid())
);

-- Allow admins to insert identity documents
CREATE POLICY "Admins can upload identity documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'identity-documents' AND 
  is_admin(auth.uid())
);

-- Allow users to upload their own identity documents
CREATE POLICY "Users can upload their own identity documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'identity-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own identity documents
CREATE POLICY "Users can view their own identity documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'identity-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);