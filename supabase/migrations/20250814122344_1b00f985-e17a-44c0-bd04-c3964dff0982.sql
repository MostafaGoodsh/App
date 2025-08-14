-- Update wallets table to support cryptocurrencies
ALTER TABLE public.wallets 
DROP COLUMN IF EXISTS currency,
ADD COLUMN cryptocurrency TEXT DEFAULT 'BTC',
ADD COLUMN private_key_encrypted TEXT,
ADD COLUMN public_key TEXT,
ADD COLUMN mnemonic_encrypted TEXT;

-- Update wallet_type to support crypto wallets
ALTER TABLE public.wallets 
ALTER COLUMN wallet_type SET DEFAULT 'crypto';

-- Create identity_verification table
CREATE TABLE public.identity_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL DEFAULT 'kyc',
  status TEXT NOT NULL DEFAULT 'pending',
  document_type TEXT,
  document_number TEXT,
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  full_name TEXT,
  date_of_birth DATE,
  nationality TEXT,
  address TEXT,
  phone_number TEXT,
  verification_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on identity_verification
ALTER TABLE public.identity_verification ENABLE ROW LEVEL SECURITY;

-- Create policies for identity_verification
CREATE POLICY "Users can insert their own verification" 
ON public.identity_verification 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own verification" 
ON public.identity_verification 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification" 
ON public.identity_verification 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on identity_verification
CREATE TRIGGER update_identity_verification_updated_at
BEFORE UPDATE ON public.identity_verification
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update transactions table to support crypto
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS transaction_hash TEXT,
ADD COLUMN IF NOT EXISTS network TEXT DEFAULT 'bitcoin',
ADD COLUMN IF NOT EXISTS gas_fee NUMERIC DEFAULT 0;

-- Create crypto_addresses table for multiple addresses per wallet
CREATE TABLE public.crypto_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  cryptocurrency TEXT NOT NULL,
  address TEXT NOT NULL,
  label TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on crypto_addresses
ALTER TABLE public.crypto_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies for crypto_addresses
CREATE POLICY "Users can view addresses from their wallets" 
ON public.crypto_addresses 
FOR SELECT 
USING (
  wallet_id IN (
    SELECT id FROM public.wallets WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert addresses to their wallets" 
ON public.crypto_addresses 
FOR INSERT 
WITH CHECK (
  wallet_id IN (
    SELECT id FROM public.wallets WHERE user_id = auth.uid()
  )
);

-- Add indexes for better performance
CREATE INDEX idx_identity_verification_user_id ON public.identity_verification(user_id);
CREATE INDEX idx_identity_verification_status ON public.identity_verification(status);
CREATE INDEX idx_crypto_addresses_wallet_id ON public.crypto_addresses(wallet_id);
CREATE INDEX idx_crypto_addresses_cryptocurrency ON public.crypto_addresses(cryptocurrency);

-- Add comments for documentation
COMMENT ON TABLE public.identity_verification IS 'Identity verification (KYC) data for users';
COMMENT ON TABLE public.crypto_addresses IS 'Cryptocurrency addresses associated with user wallets';