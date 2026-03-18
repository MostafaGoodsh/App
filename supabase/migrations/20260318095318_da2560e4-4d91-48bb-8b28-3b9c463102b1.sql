-- Finalize crypto payment addresses table behavior

UPDATE public.crypto_payment_addresses
SET is_active = false
WHERE address LIKE 'REPLACE_WITH_%';

CREATE OR REPLACE FUNCTION public.set_crypto_payment_addresses_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_crypto_payment_addresses_updated_at ON public.crypto_payment_addresses;

CREATE TRIGGER set_crypto_payment_addresses_updated_at
BEFORE UPDATE ON public.crypto_payment_addresses
FOR EACH ROW
EXECUTE FUNCTION public.set_crypto_payment_addresses_updated_at();