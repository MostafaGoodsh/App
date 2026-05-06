-- 1. Create blockchain_user_keys table
CREATE TABLE public.blockchain_user_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  firefly_key TEXT,
  firefly_identity TEXT,
  eth_address TEXT,
  namespace TEXT NOT NULL DEFAULT 'XcX',
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_blockchain_user_keys_user_id ON public.blockchain_user_keys(user_id);
CREATE INDEX idx_blockchain_user_keys_status ON public.blockchain_user_keys(status);

ALTER TABLE public.blockchain_user_keys ENABLE ROW LEVEL SECURITY;

-- Users can view their own key
CREATE POLICY "Users can view their own blockchain key"
ON public.blockchain_user_keys
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all keys
CREATE POLICY "Admins can view all blockchain keys"
ON public.blockchain_user_keys
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Admins can update/delete keys
CREATE POLICY "Admins can update blockchain keys"
ON public.blockchain_user_keys
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete blockchain keys"
ON public.blockchain_user_keys
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Note: INSERT is done via edge function with service role; no INSERT policy needed for client.

-- Trigger for updated_at
CREATE TRIGGER trg_blockchain_user_keys_updated_at
BEFORE UPDATE ON public.blockchain_user_keys
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add firefly columns to internal_tokens
ALTER TABLE public.internal_tokens
  ADD COLUMN IF NOT EXISTS firefly_pool_id TEXT,
  ADD COLUMN IF NOT EXISTS firefly_pool_status TEXT DEFAULT 'not_created',
  ADD COLUMN IF NOT EXISTS firefly_namespace TEXT DEFAULT 'XcX';