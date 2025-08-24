-- Add Solana address field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN solana_address text;

-- Create index for better performance
CREATE INDEX idx_profiles_solana_address ON public.profiles(solana_address) WHERE solana_address IS NOT NULL;