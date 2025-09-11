-- إنشاء جدول لتتبع تحويلات النقاط إلى tokens
CREATE TABLE public.point_to_token_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  points_amount INTEGER NOT NULL,
  token_amount NUMERIC NOT NULL,
  conversion_rate NUMERIC NOT NULL DEFAULT 1.0,
  token_mint_address TEXT,
  transaction_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_points CHECK (points_amount > 0),
  CONSTRAINT valid_tokens CHECK (token_amount > 0),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- تمكين RLS
ALTER TABLE public.point_to_token_conversions ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can view their own conversions" 
ON public.point_to_token_conversions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversions" 
ON public.point_to_token_conversions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update conversion status" 
ON public.point_to_token_conversions 
FOR UPDATE 
USING (true);

-- إنشاء جدول لإعدادات التحويل
CREATE TABLE public.conversion_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  points_to_token_rate NUMERIC NOT NULL DEFAULT 100.0,
  minimum_conversion_points INTEGER NOT NULL DEFAULT 100,
  maximum_conversion_points INTEGER NOT NULL DEFAULT 10000,
  daily_conversion_limit INTEGER NOT NULL DEFAULT 1000,
  token_name TEXT NOT NULL DEFAULT 'DevNet Reward Token',
  token_symbol TEXT NOT NULL DEFAULT 'DRT',
  token_decimals INTEGER NOT NULL DEFAULT 9,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين RLS للإعدادات
ALTER TABLE public.conversion_settings ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للإعدادات
CREATE POLICY "Anyone can view active conversion settings" 
ON public.conversion_settings 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage conversion settings" 
ON public.conversion_settings 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- إدراج إعدادات افتراضية
INSERT INTO public.conversion_settings (
  points_to_token_rate,
  minimum_conversion_points,
  maximum_conversion_points,
  daily_conversion_limit,
  token_name,
  token_symbol
) VALUES (
  100.0,  -- 100 نقطة = 1 token
  50,     -- حد أدنى 50 نقطة
  5000,   -- حد أقصى 5000 نقطة
  2000,   -- حد يومي 2000 نقطة
  'MsRa DevNet Token',
  'MSRA'
);

-- إنشاء جدول لتتبع النقاط المتاحة للمستخدمين
CREATE TABLE public.user_points_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  available_points INTEGER NOT NULL DEFAULT 0,
  converted_points INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_totals CHECK (total_points >= 0),
  CONSTRAINT valid_available CHECK (available_points >= 0),
  CONSTRAINT valid_converted CHECK (converted_points >= 0),
  CONSTRAINT points_balance CHECK (total_points = available_points + converted_points)
);

-- تمكين RLS
ALTER TABLE public.user_points_balance ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can view their own points balance" 
ON public.user_points_balance 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points balance" 
ON public.user_points_balance 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update points balance" 
ON public.user_points_balance 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can view all points balances" 
ON public.user_points_balance 
FOR SELECT 
USING (is_admin(auth.uid()));

-- دالة لحساب النقاط المتاحة للمستخدم
CREATE OR REPLACE FUNCTION public.calculate_user_points(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  daily_task_points INTEGER := 0;
  personality_points INTEGER := 0;
  media_points INTEGER := 0;
  total_points INTEGER := 0;
BEGIN
  -- حساب نقاط المهام اليومية
  SELECT COALESCE(SUM(points_earned), 0)
  INTO daily_task_points
  FROM public.user_daily_task_completions
  WHERE user_id = p_user_id;
  
  -- حساب نقاط مهام الشخصية
  SELECT COALESCE(SUM(points_earned), 0)
  INTO personality_points
  FROM public.user_personality_completions
  WHERE user_id = p_user_id;
  
  -- حساب نقاط المحتوى الإعلامي
  SELECT COALESCE(SUM(points_earned), 0)
  INTO media_points
  FROM public.user_media_completions
  WHERE user_id = p_user_id;
  
  total_points := daily_task_points + personality_points + media_points;
  
  RETURN total_points;
END;
$$;

-- دالة لتحديث رصيد النقاط
CREATE OR REPLACE FUNCTION public.update_user_points_balance(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calculated_points INTEGER;
  converted_points INTEGER := 0;
  available_points INTEGER;
BEGIN
  -- حساب إجمالي النقاط المكتسبة
  calculated_points := public.calculate_user_points(p_user_id);
  
  -- حساب النقاط المحولة
  SELECT COALESCE(SUM(points_amount), 0)
  INTO converted_points
  FROM public.point_to_token_conversions
  WHERE user_id = p_user_id AND status = 'completed';
  
  available_points := calculated_points - converted_points;
  
  -- تحديث أو إدراج رصيد النقاط
  INSERT INTO public.user_points_balance (
    user_id, total_points, available_points, converted_points
  ) VALUES (
    p_user_id, calculated_points, available_points, converted_points
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = EXCLUDED.total_points,
    available_points = EXCLUDED.available_points,
    converted_points = EXCLUDED.converted_points,
    last_updated = now();
  
  RETURN jsonb_build_object(
    'total_points', calculated_points,
    'available_points', available_points,
    'converted_points', converted_points
  );
END;
$$;

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_conversion_settings_updated_at
  BEFORE UPDATE ON public.conversion_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();