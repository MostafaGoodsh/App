-- Secure wheel policies and add admin-managed crypto payment addresses

-- Public payment addresses table for crypto checkout
CREATE TABLE IF NOT EXISTS public.crypto_payment_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_key TEXT NOT NULL UNIQUE,
  network_name TEXT NOT NULL,
  supported_assets TEXT,
  address TEXT NOT NULL,
  memo_tag TEXT,
  warnings TEXT,
  warnings_en TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crypto_payment_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active crypto payment addresses"
ON public.crypto_payment_addresses
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Admins can manage crypto payment addresses"
ON public.crypto_payment_addresses
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_crypto_payment_addresses_active_order
ON public.crypto_payment_addresses (is_active, display_order);

-- Fix overly permissive / missing wheel policies
DROP POLICY IF EXISTS "Admins can manage outer segments" ON public.wheel_outer_segments;
DROP POLICY IF EXISTS "Anyone can read active outer segments" ON public.wheel_outer_segments;
DROP POLICY IF EXISTS "Admins can manage upgrade segments" ON public.wheel_upgrade_segments;
DROP POLICY IF EXISTS "Anyone can read active upgrade segments" ON public.wheel_upgrade_segments;

CREATE POLICY "Admins can manage outer segments"
ON public.wheel_outer_segments
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can read active outer segments"
ON public.wheel_outer_segments
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Admins can manage upgrade segments"
ON public.wheel_upgrade_segments
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can read active upgrade segments"
ON public.wheel_upgrade_segments
FOR SELECT
TO public
USING (is_active = true);

-- Seed a few common networks if table is empty
INSERT INTO public.crypto_payment_addresses (
  network_key,
  network_name,
  supported_assets,
  address,
  warnings,
  warnings_en,
  display_order,
  is_active
)
SELECT *
FROM (
  VALUES
    ('solana', 'Solana', 'SOL, USDT (SPL)', 'REPLACE_WITH_SOLANA_ADDRESS', 'أرسل فقط الأصول المدعومة على نفس الشبكة. أي تحويل على شبكة خاطئة قد يضيع نهائياً. تحقق من العنوان جيداً قبل الإرسال.', 'Send only supported assets on the same network. Transfers on the wrong network may be permanently lost. Double-check the address before sending.', 1, true),
    ('ethereum', 'Ethereum', 'ETH, USDT (ERC20)', 'REPLACE_WITH_ETHEREUM_ADDRESS', 'أرسل فقط ETH أو ERC20 إلى هذا العنوان. لا ترسل من شبكة غير متوافقة.', 'Send only ETH or ERC20 assets to this address. Do not send from an incompatible network.', 2, false),
    ('ton', 'TON', 'TON, Jettons', 'REPLACE_WITH_TON_ADDRESS', 'قد تتطلب بعض المحافظ Memo/Comment عند التحويل. راجع التعليمات قبل الإرسال.', 'Some wallets may require a Memo/Comment for transfer. Review the instructions before sending.', 3, false)
) AS seed(network_key, network_name, supported_assets, address, warnings, warnings_en, display_order, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.crypto_payment_addresses
);