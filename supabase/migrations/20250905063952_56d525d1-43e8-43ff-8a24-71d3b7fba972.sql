-- Create a helper function to handle avatar uploads with proper security
CREATE OR REPLACE FUNCTION public.upload_avatar(
  p_file_name TEXT,
  p_file_data BYTEA,
  p_content_type TEXT DEFAULT 'image/jpeg'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_user_id UUID;
  v_file_path TEXT;
  v_result JSON;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Authentication required');
  END IF;
  
  -- Create file path with user ID folder
  v_file_path := v_user_id::text || '/' || p_file_name;
  
  -- The upload will be handled by the client-side supabase storage client
  -- This function is just for validation and path creation
  RETURN json_build_object(
    'success', true, 
    'file_path', v_file_path,
    'user_id', v_user_id
  );
END;
$$;