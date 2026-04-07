
-- Virtual Cards table
CREATE TABLE public.virtual_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_type TEXT NOT NULL DEFAULT 'visa' CHECK (card_type IN ('visa', 'mastercard')),
  card_number_last4 TEXT NOT NULL DEFAULT lpad((random() * 9999)::int::text, 4, '0'),
  card_holder_name TEXT,
  expiry_month INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM (now() + interval '3 years'))::int,
  expiry_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM (now() + interval '3 years'))::int,
  cvv_hash TEXT NOT NULL DEFAULT lpad((random() * 999)::int::text, 3, '0'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'expired', 'cancelled')),
  card_color TEXT DEFAULT 'gold',
  daily_limit NUMERIC DEFAULT 5000,
  monthly_limit NUMERIC DEFAULT 50000,
  total_spent NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  balance NUMERIC DEFAULT 0,
  is_contactless_enabled BOOLEAN DEFAULT true,
  is_online_enabled BOOLEAN DEFAULT true,
  is_international_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Virtual Card Transactions table
CREATE TABLE public.virtual_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.virtual_cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('topup', 'purchase', 'refund', 'withdrawal', 'fee')),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  merchant_name TEXT,
  merchant_category TEXT,
  description TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  source_type TEXT CHECK (source_type IN ('internal_wallet', 'crypto', 'bank', 'card')),
  source_token_symbol TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_virtual_cards_user ON public.virtual_cards(user_id);
CREATE INDEX idx_virtual_card_txns_card ON public.virtual_card_transactions(card_id);
CREATE INDEX idx_virtual_card_txns_user ON public.virtual_card_transactions(user_id);

-- RLS
ALTER TABLE public.virtual_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_card_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view/manage their own cards
CREATE POLICY "Users can view own cards" ON public.virtual_cards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own cards" ON public.virtual_cards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cards" ON public.virtual_cards FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Users can view their own transactions
CREATE POLICY "Users can view own card transactions" ON public.virtual_card_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own card transactions" ON public.virtual_card_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all cards" ON public.virtual_cards FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all cards" ON public.virtual_cards FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can view all card transactions" ON public.virtual_card_transactions FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_virtual_cards_updated_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER set_virtual_cards_updated_at BEFORE UPDATE ON public.virtual_cards
FOR EACH ROW EXECUTE FUNCTION public.update_virtual_cards_updated_at();

-- Function to top up card from internal wallet
CREATE OR REPLACE FUNCTION public.topup_virtual_card(p_card_id uuid, p_amount numeric, p_token_symbol text DEFAULT 'XP')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  v_user_id UUID;
  v_card RECORD;
  v_token RECORD;
  v_balance NUMERIC;
  v_usd_amount NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Authentication required'); END IF;

  SELECT * INTO v_card FROM public.virtual_cards WHERE id = p_card_id AND user_id = v_user_id AND status = 'active';
  IF v_card IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Card not found or inactive'); END IF;

  SELECT * INTO v_token FROM public.internal_tokens WHERE symbol = p_token_symbol AND is_active = true;
  IF v_token IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Token not found'); END IF;

  SELECT COALESCE(balance, 0) INTO v_balance FROM public.internal_wallet_balances WHERE user_id = v_user_id AND token_id = v_token.id;
  IF v_balance < p_amount THEN RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance'); END IF;

  v_usd_amount := ROUND(p_amount * v_token.exchange_rate_usd, 2);

  UPDATE public.internal_wallet_balances SET balance = balance - p_amount, updated_at = now() WHERE user_id = v_user_id AND token_id = v_token.id;
  UPDATE public.virtual_cards SET balance = balance + v_usd_amount, updated_at = now() WHERE id = p_card_id;

  INSERT INTO public.virtual_card_transactions (card_id, user_id, transaction_type, amount, currency, description, status, source_type, source_token_symbol)
  VALUES (p_card_id, v_user_id, 'topup', v_usd_amount, 'USD', 'شحن من ' || v_token.name, 'completed', 'internal_wallet', p_token_symbol);

  RETURN jsonb_build_object('success', true, 'credited_usd', v_usd_amount, 'debited_tokens', p_amount, 'new_balance', v_card.balance + v_usd_amount);
END; $$;

-- Insert home page card for virtual card
INSERT INTO public.home_page_cards (
  slug, title, title_en, description, description_en, card_type, card_size, card_shape, card_animation, 
  route_path, is_active, display_order, background_gradient, text_color
) VALUES (
  'virtual-card', 'البطاقة الافتراضية', 'Virtual Card', 
  'كارت فيزا افتراضي للدفع بالكريبتو والفلوس العادية', 'Virtual Visa card for crypto and fiat payments',
  'standard', 'medium', 'rounded', 'fade-in',
  '/virtual-card', true, 3, 
  'linear-gradient(135deg, #D4AF37 0%, #1a1a2e 50%, #D4AF37 100%)', '#D4AF37'
);
