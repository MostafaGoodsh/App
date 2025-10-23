-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  internal_token_id UUID NOT NULL REFERENCES public.internal_tokens(id),
  internal_amount DECIMAL(20, 9) NOT NULL CHECK (internal_amount > 0),
  target_token TEXT NOT NULL,
  target_address TEXT NOT NULL,
  target_amount DECIMAL(20, 9) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  transaction_hash TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_target_address CHECK (length(target_address) > 10)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON public.withdrawal_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own withdrawal requests
CREATE POLICY "Users can view their own withdrawal requests"
ON public.withdrawal_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own withdrawal requests
CREATE POLICY "Users can create withdrawal requests"
ON public.withdrawal_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can update all withdrawal requests (for edge function)
CREATE POLICY "Service role can update withdrawal requests"
ON public.withdrawal_requests
FOR UPDATE
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_withdrawal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    NEW.processed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_withdrawal_processed_at
BEFORE UPDATE ON public.withdrawal_requests
FOR EACH ROW
WHEN (NEW.status != OLD.status AND NEW.status IN ('completed', 'failed'))
EXECUTE FUNCTION public.update_withdrawal_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.withdrawal_requests IS 'Stores user withdrawal requests from internal tokens to external blockchain addresses';
COMMENT ON COLUMN public.withdrawal_requests.internal_token_id IS 'Reference to the internal token being withdrawn';
COMMENT ON COLUMN public.withdrawal_requests.internal_amount IS 'Amount to withdraw from internal wallet';
COMMENT ON COLUMN public.withdrawal_requests.target_token IS 'Target cryptocurrency symbol (SOL, BTC, ETH, etc.)';
COMMENT ON COLUMN public.withdrawal_requests.target_address IS 'Blockchain address to send the withdrawal';
COMMENT ON COLUMN public.withdrawal_requests.target_amount IS 'Calculated amount in target cryptocurrency';
COMMENT ON COLUMN public.withdrawal_requests.transaction_hash IS 'Blockchain transaction hash after successful withdrawal';
COMMENT ON COLUMN public.withdrawal_requests.status IS 'Current status of the withdrawal request';