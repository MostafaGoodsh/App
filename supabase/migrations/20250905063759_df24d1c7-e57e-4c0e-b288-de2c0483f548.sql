-- Create proper RLS policies for avatars storage bucket
-- Policy for SELECT: Allow anyone to view avatars (public bucket)
INSERT INTO storage.policies (bucket_id, name, definition, check_definition)
VALUES (
  'avatars',
  'Public avatar access',
  'bucket_id = ''avatars''',
  NULL
);

-- Policy for INSERT: Allow authenticated users to upload to their own folder  
INSERT INTO storage.policies (bucket_id, name, definition, check_definition)
VALUES (
  'avatars',
  'Users can upload their own avatar',
  NULL,
  'bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1] AND auth.uid() IS NOT NULL'
);

-- Policy for UPDATE: Allow users to update their own avatar
INSERT INTO storage.policies (bucket_id, name, definition, check_definition) 
VALUES (
  'avatars',
  'Users can update their own avatar',
  'bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1] AND auth.uid() IS NOT NULL',
  NULL
);

-- Policy for DELETE: Allow users to delete their own avatar
INSERT INTO storage.policies (bucket_id, name, definition, check_definition)
VALUES (
  'avatars', 
  'Users can delete their own avatar',
  'bucket_id = ''avatars'' AND auth.uid()::text = (storage.foldername(name))[1] AND auth.uid() IS NOT NULL',
  NULL
);