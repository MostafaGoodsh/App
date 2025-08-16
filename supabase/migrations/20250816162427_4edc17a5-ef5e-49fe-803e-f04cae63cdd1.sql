-- Add support for custom tokens and multi-network wallets

-- Create a table for custom tokens/contracts
CREATE TABLE public.custom_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_address TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimals INTEGER DEFAULT 18,
  network TEXT NOT NULL,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(contract_address, network)
);

-- Enable RLS on custom_tokens
ALTER TABLE public.custom_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_tokens
CREATE POLICY "Anyone can view verified tokens" 
ON public.custom_tokens 
FOR SELECT 
USING (is_verified = true);

CREATE POLICY "Authenticated users can add custom tokens" 
ON public.custom_tokens 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add support for multi-network in wallets table
ALTER TABLE public.wallets 
ADD COLUMN networks TEXT[] DEFAULT ARRAY['bitcoin'],
ADD COLUMN is_multi_network BOOLEAN DEFAULT false,
ADD COLUMN wallet_name TEXT DEFAULT 'المحفظة الرئيسية';

-- Create wallet_tokens table to track tokens in each wallet
CREATE TABLE public.wallet_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL,
  token_id UUID REFERENCES public.custom_tokens(id),
  cryptocurrency TEXT, -- For standard cryptocurrencies
  contract_address TEXT, -- For custom tokens
  network TEXT NOT NULL,
  balance NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT fk_wallet_tokens_wallet_id FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE CASCADE,
  CONSTRAINT check_token_or_crypto CHECK (
    (token_id IS NOT NULL AND cryptocurrency IS NULL) OR 
    (token_id IS NULL AND cryptocurrency IS NOT NULL)
  )
);

-- Enable RLS on wallet_tokens
ALTER TABLE public.wallet_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for wallet_tokens
CREATE POLICY "Users can view their wallet tokens" 
ON public.wallet_tokens 
FOR SELECT 
USING (wallet_id IN (
  SELECT id FROM public.wallets WHERE user_id = auth.uid()
));

CREATE POLICY "Users can manage their wallet tokens" 
ON public.wallet_tokens 
FOR ALL 
USING (wallet_id IN (
  SELECT id FROM public.wallets WHERE user_id = auth.uid()
))
WITH CHECK (wallet_id IN (
  SELECT id FROM public.wallets WHERE user_id = auth.uid()
));

-- Create trigger for updated_at on custom_tokens
CREATE TRIGGER update_custom_tokens_updated_at
BEFORE UPDATE ON public.custom_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_custom_tokens_contract_network ON public.custom_tokens(contract_address, network);
CREATE INDEX idx_custom_tokens_symbol ON public.custom_tokens(symbol);
CREATE INDEX idx_wallet_tokens_wallet_id ON public.wallet_tokens(wallet_id);
CREATE INDEX idx_wallet_tokens_network ON public.wallet_tokens(network);

-- Insert some popular tokens
INSERT INTO public.custom_tokens (contract_address, name, symbol, decimals, network, is_verified) VALUES
('0xdAC17F958D2ee523a2206206994597C13D831ec7', 'Tether USD', 'USDT', 6, 'ethereum', true),
('0xA0b86a33E6441c1C49A7Fa51fD92c9c9f6bd7999', 'USD Coin', 'USDC', 6, 'ethereum', true),
('0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', 'Shiba Inu', 'SHIB', 18, 'ethereum', true),
('0x514910771AF9Ca656af840dff83E8264EcF986CA', 'Chainlink', 'LINK', 18, 'ethereum', true),
('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', 'Uniswap', 'UNI', 18, 'ethereum', true);

-- Comment tables
COMMENT ON TABLE public.custom_tokens IS 'Custom tokens and contracts for multi-network wallets';
COMMENT ON TABLE public.wallet_tokens IS 'Tokens held in each wallet with balances';