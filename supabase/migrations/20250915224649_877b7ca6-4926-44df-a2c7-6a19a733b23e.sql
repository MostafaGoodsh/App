-- إنشاء نظام المحفظة الهجين

-- 1. جدول العملات الداخلية المتاحة
CREATE TABLE public.internal_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  decimals INTEGER NOT NULL DEFAULT 9,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_base_currency BOOLEAN NOT NULL DEFAULT false,
  exchange_rate_usd NUMERIC(18,9) NOT NULL DEFAULT 0.001,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. جدول أرصدة المستخدمين الداخلية
CREATE TABLE public.internal_wallet_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token_id UUID NOT NULL REFERENCES public.internal_tokens(id),
  balance NUMERIC(18,9) NOT NULL DEFAULT 0,
  locked_balance NUMERIC(18,9) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, token_id)
);

-- 3. جدول معاملات التبديل الداخلية
CREATE TABLE public.internal_swaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_token_id UUID NOT NULL REFERENCES public.internal_tokens(id),
  to_token_id UUID NOT NULL REFERENCES public.internal_tokens(id),
  from_amount NUMERIC(18,9) NOT NULL,
  to_amount NUMERIC(18,9) NOT NULL,
  exchange_rate NUMERIC(18,9) NOT NULL,
  fee_amount NUMERIC(18,9) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. جدول طلبات السحب الحقيقي
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  internal_token_id UUID NOT NULL REFERENCES public.internal_tokens(id),
  internal_amount NUMERIC(18,9) NOT NULL,
  target_token TEXT NOT NULL, -- USDC, SOL, etc
  target_amount NUMERIC(18,9) NOT NULL,
  target_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_hash TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إدراج العملات الداخلية الافتراضية
INSERT INTO public.internal_tokens (symbol, name, description, is_base_currency, exchange_rate_usd) VALUES
('POINTS', 'نقاط المكافآت', 'نقاط تُكتسب من المهام والأنشطة', true, 0.001),
('GOLD', 'عملة ذهبية', 'عملة نادرة تُكتسب من إنجازات خاصة', false, 0.01),
('REWARDS', 'رموز المكافآت', 'رموز تُستخدم للحصول على مميزات', false, 0.005),
('GEMS', 'أحجار كريمة', 'أحجار نادرة للمعاملات المميزة', false, 0.02);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_internal_wallet_balances_user_id ON public.internal_wallet_balances(user_id);
CREATE INDEX idx_internal_swaps_user_id ON public.internal_swaps(user_id);
CREATE INDEX idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- تمكين RLS
ALTER TABLE public.internal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_wallet_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للعملات الداخلية
CREATE POLICY "Anyone can view active tokens" ON public.internal_tokens
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tokens" ON public.internal_tokens
  FOR ALL USING (is_admin(auth.uid()));

-- سياسات RLS للأرصدة
CREATE POLICY "Users can view their own balances" ON public.internal_wallet_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balances" ON public.internal_wallet_balances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update balances" ON public.internal_wallet_balances
  FOR UPDATE USING (true);

-- سياسات RLS للتبديل
CREATE POLICY "Users can view their own swaps" ON public.internal_swaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create swaps" ON public.internal_swaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- سياسات RLS لطلبات السحب
CREATE POLICY "Users can manage their withdrawal requests" ON public.withdrawal_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawal requests" ON public.withdrawal_requests
  FOR SELECT USING (is_admin(auth.uid()));

-- دالة لإنشاء أرصدة ابتدائية للمستخدمين الجدد
CREATE OR REPLACE FUNCTION public.create_initial_internal_balances(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إضافة رصيد ابتدائي لكل عملة نشطة
  INSERT INTO public.internal_wallet_balances (user_id, token_id, balance)
  SELECT 
    p_user_id,
    id,
    CASE 
      WHEN symbol = 'POINTS' THEN 1000  -- 1000 نقطة ابتدائية
      WHEN symbol = 'GOLD' THEN 100     -- 100 عملة ذهبية
      WHEN symbol = 'REWARDS' THEN 250  -- 250 رمز مكافأة
      WHEN symbol = 'GEMS' THEN 50      -- 50 حجر كريم
      ELSE 0
    END
  FROM public.internal_tokens
  WHERE is_active = true
  ON CONFLICT (user_id, token_id) DO NOTHING;
END;
$$;

-- دالة التبديل الداخلي
CREATE OR REPLACE FUNCTION public.internal_token_swap(
  p_from_token_symbol TEXT,
  p_to_token_symbol TEXT,
  p_from_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_from_token RECORD;
  v_to_token RECORD;
  v_user_balance NUMERIC;
  v_exchange_rate NUMERIC;
  v_to_amount NUMERIC;
  v_fee_amount NUMERIC := 0;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  -- الحصول على بيانات العملات
  SELECT * INTO v_from_token FROM public.internal_tokens WHERE symbol = p_from_token_symbol AND is_active = true;
  SELECT * INTO v_to_token FROM public.internal_tokens WHERE symbol = p_to_token_symbol AND is_active = true;
  
  IF v_from_token IS NULL OR v_to_token IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Token not found');
  END IF;

  -- التحقق من الرصيد
  SELECT COALESCE(balance, 0) INTO v_user_balance
  FROM public.internal_wallet_balances
  WHERE user_id = v_user_id AND token_id = v_from_token.id;
  
  IF v_user_balance < p_from_amount OR p_from_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- حساب معدل التبديل
  v_exchange_rate := v_from_token.exchange_rate_usd / v_to_token.exchange_rate_usd;
  v_to_amount := p_from_amount * v_exchange_rate;

  -- تحديث الأرصدة
  UPDATE public.internal_wallet_balances 
  SET balance = balance - p_from_amount, updated_at = now()
  WHERE user_id = v_user_id AND token_id = v_from_token.id;
  
  INSERT INTO public.internal_wallet_balances (user_id, token_id, balance)
  VALUES (v_user_id, v_to_token.id, v_to_amount)
  ON CONFLICT (user_id, token_id) 
  DO UPDATE SET balance = internal_wallet_balances.balance + EXCLUDED.balance, updated_at = now();

  -- تسجيل المعاملة
  INSERT INTO public.internal_swaps (
    user_id, from_token_id, to_token_id, from_amount, to_amount, exchange_rate, fee_amount
  ) VALUES (
    v_user_id, v_from_token.id, v_to_token.id, p_from_amount, v_to_amount, v_exchange_rate, v_fee_amount
  );

  RETURN jsonb_build_object(
    'success', true,
    'from_amount', p_from_amount,
    'to_amount', v_to_amount,
    'exchange_rate', v_exchange_rate,
    'from_token', v_from_token.symbol,
    'to_token', v_to_token.symbol
  );
END;
$$;

-- ترايجر لإنشاء أرصدة ابتدائية للمستخدمين الجدد
CREATE OR REPLACE FUNCTION public.handle_new_user_internal_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إنشاء أرصدة ابتدائية بعد تأخير قصير
  PERFORM public.create_initial_internal_balances(NEW.user_id);
  RETURN NEW;
END;
$$;

-- ربط الترايجر بجدول الملفات الشخصية
CREATE TRIGGER on_new_user_create_internal_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_internal_wallet();

-- دالة لإنشاء أرصدة للمستخدمين الحاليين
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM public.profiles LOOP
    PERFORM public.create_initial_internal_balances(user_record.user_id);
  END LOOP;
END $$;