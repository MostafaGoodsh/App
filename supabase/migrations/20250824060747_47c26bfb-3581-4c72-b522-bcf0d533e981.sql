-- Create storage bucket for identity documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('identity-documents', 'identity-documents', false);

-- Create policy for users to upload their own documents
CREATE POLICY "Users can upload their own identity documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'identity-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to view their own documents
CREATE POLICY "Users can view their own identity documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'identity-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for admins to view all identity documents
CREATE POLICY "Admins can view all identity documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'identity-documents' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);