-- إنشاء جدول لمراقبة الإيداعات الواردة
CREATE TABLE IF NOT EXISTS public.pending_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_id UUID NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  cryptocurrency TEXT NOT NULL,
  network TEXT NOT NULL,
  transaction_hash TEXT,
  confirmations INTEGER DEFAULT 0,
  required_confirmations INTEGER DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- فهرسة للاستعلام السريع
CREATE INDEX IF NOT EXISTS idx_pending_deposits_user_id ON public.pending_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_deposits_status ON public.pending_deposits(status);
CREATE INDEX IF NOT EXISTS idx_pending_deposits_wallet_id ON public.pending_deposits(wallet_id);

-- سياسات RLS
ALTER TABLE public.pending_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pending deposits" 
ON public.pending_deposits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert pending deposits" 
ON public.pending_deposits 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update deposit status" 
ON public.pending_deposits 
FOR UPDATE 
USING (true);

-- دالة لتحديث الأرصدة عند تأكيد الإيداع
CREATE OR REPLACE FUNCTION public.process_confirmed_deposit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- إذا تم تأكيد الإيداع
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    -- تحديث رصيد wallet_tokens
    UPDATE public.wallet_tokens 
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE wallet_id = NEW.wallet_id 
      AND (cryptocurrency = NEW.cryptocurrency OR 
           (token_id IN (
             SELECT id FROM public.custom_tokens 
             WHERE symbol = NEW.cryptocurrency AND network = NEW.network
           )));
    
    -- إنشاء سجل معاملة
    INSERT INTO public.transactions (
      user_id,
      wallet_id,
      amount,
      transaction_type,
      description,
      status,
      transaction_hash,
      network,
      gas_fee
    ) VALUES (
      NEW.user_id,
      NEW.wallet_id,
      NEW.amount,
      'receive',
      'إيداع ' || NEW.amount || ' ' || NEW.cryptocurrency || ' من ' || LEFT(NEW.from_address, 10) || '...',
      'completed',
      NEW.transaction_hash,
      NEW.network,
      0
    );
    
    -- تحديد وقت المعالجة
    NEW.processed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- ربط الدالة بالجدول
CREATE TRIGGER process_deposit_confirmation
  BEFORE UPDATE ON public.pending_deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.process_confirmed_deposit();