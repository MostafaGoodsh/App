-- Update the identity-documents bucket to be public so images can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'identity-documents';