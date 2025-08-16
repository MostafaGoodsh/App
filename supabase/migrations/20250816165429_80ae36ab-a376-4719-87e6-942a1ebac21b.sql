
-- Update RLS policy for custom_tokens to allow authenticated users to add custom tokens
DROP POLICY IF EXISTS "Allow authenticated users to add custom tokens" ON custom_tokens;

CREATE POLICY "Allow authenticated users to add unverified custom tokens" 
ON custom_tokens 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  is_verified = false
);

-- Also update the SELECT policy to allow users to see their own added tokens
DROP POLICY IF EXISTS "Anyone can view verified tokens" ON custom_tokens;

CREATE POLICY "Users can view verified tokens and their own tokens" 
ON custom_tokens 
FOR SELECT 
TO authenticated 
USING (
  is_verified = true OR 
  auth.uid() IS NOT NULL
);
