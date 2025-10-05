-- Create payment transactions table for local Egyptian payment methods
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'EGP',
  payment_method TEXT NOT NULL, -- vodafone_cash, orange_cash, etisalat_cash, fawry, card
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, refunded
  
  -- Provider details
  provider TEXT NOT NULL, -- paymob, fawry, etc
  provider_transaction_id TEXT,
  provider_reference TEXT,
  provider_response JSONB,
  
  -- User details
  phone_number TEXT,
  payment_details JSONB, -- Additional payment details (wallet number, etc)
  
  -- Internal token details
  internal_token_id UUID REFERENCES public.internal_tokens(id),
  tokens_credited NUMERIC DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Metadata
  user_agent TEXT,
  ip_address INET,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own payment transactions"
ON public.payment_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own transactions
CREATE POLICY "Users can create their own payment transactions"
ON public.payment_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all payment transactions"
ON public.payment_transactions
FOR ALL
USING (is_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_provider_ref ON public.payment_transactions(provider_transaction_id);

-- Add trigger for updated_at
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();