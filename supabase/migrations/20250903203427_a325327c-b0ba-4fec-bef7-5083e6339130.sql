-- Make the identity-documents bucket public for admin access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'identity-documents';

-- Create RLS policies for identity-documents bucket to allow admin access
CREATE POLICY "Admins can view identity documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'identity-documents' AND is_admin(auth.uid()));

CREATE POLICY "Users can upload their identity documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'identity-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their identity documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'identity-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy for public access to identity documents (for admin viewing)
CREATE POLICY "Public read access for identity documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'identity-documents');