-- Create function to handle avatar uploads securely
CREATE OR REPLACE FUNCTION public.upload_avatar(
  file_name TEXT,
  file_data BYTEA,
  content_type TEXT DEFAULT 'image/jpeg'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  user_folder TEXT;
  file_path TEXT;
  upload_result JSONB;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Create user-specific folder path
  user_folder := auth.uid()::text;
  file_path := user_folder || '/' || file_name;
  
  -- Upload file to storage (this bypasses RLS as it's a security definer function)
  INSERT INTO storage.objects (bucket_id, name, owner, metadata)
  VALUES (
    'avatars',
    file_path,
    auth.uid(),
    jsonb_build_object(
      'size', length(file_data),
      'mimetype', content_type,
      'cacheControl', '3600'
    )
  );
  
  -- Return success response with public URL
  RETURN jsonb_build_object(
    'success', true,
    'path', file_path,
    'url', 'https://wnwfnziozwarlihrnjex.supabase.co/storage/v1/object/public/avatars/' || file_path
  );
  
EXCEPTION 
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;