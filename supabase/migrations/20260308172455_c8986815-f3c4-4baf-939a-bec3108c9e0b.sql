
-- =============================================
-- 1. جدول مجمعات السيولة الرئيسي
-- =============================================
CREATE TABLE public.liquidity_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  pool_type TEXT NOT NULL DEFAULT 'general' CHECK (pool_type IN ('general', 'stablecoin', 'token_pair')),
  description TEXT,
  description_en TEXT,
  icon_url TEXT,
  
  -- إحصائيات المجمع
  total_value_locked NUMERIC NOT NULL DEFAULT 0,
  total_volume_24h NUMERIC NOT NULL DEFAULT 0,
  apy_percentage NUMERIC NOT NULL DEFAULT 0,
  providers_count INTEGER NOT NULL DEFAULT 0,
  
  -- إعدادات
  min_deposit NUMERIC NOT NULL DEFAULT 0,
  max_deposit NUMERIC,
  fee_percentage NUMERIC NOT NULL DEFAULT 0.3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- أزواج التداول (للمجمعات المخصصة)
  token_a_symbol TEXT,
  token_b_symbol TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 2. جدول مراكز المستخدمين في المجمعات
-- =============================================
CREATE TABLE public.liquidity_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pool_id UUID REFERENCES public.liquidity_pools(id) ON DELETE CASCADE NOT NULL,
  
  -- بيانات المركز
  deposited_amount NUMERIC NOT NULL DEFAULT 0,
  lp_tokens NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  earned_rewards NUMERIC NOT NULL DEFAULT 0,
  
  -- Staking
  is_staked BOOLEAN NOT NULL DEFAULT false,
  staking_plan_id UUID,
  staked_at TIMESTAMPTZ,
  stake_unlock_at TIMESTAMPTZ,
  
  -- Auto-compound
  auto_compound_enabled BOOLEAN NOT NULL DEFAULT false,
  
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'locked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 3. جدول معاملات السيولة
-- =============================================
CREATE TABLE public.liquidity_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id UUID REFERENCES public.liquidity_pools(id) ON DELETE CASCADE NOT NULL,
  position_id UUID REFERENCES public.liquidity_positions(id) ON DELETE SET NULL,
  
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'deposit', 'withdraw', 'stake', 'unstake', 
    'reward', 'auto_compound', 'auto_route', 
    'charity_out', 'platform_deposit', 'limit_order'
  )),
  
  amount NUMERIC NOT NULL,
  fee_amount NUMERIC NOT NULL DEFAULT 0,
  
  -- للتحويل التلقائي
  source_type TEXT, -- 'purchase', 'game', 'activity', 'recharge'
  source_reference TEXT,
  
  -- Limit Orders
  trigger_price NUMERIC,
  limit_status TEXT CHECK (limit_status IN ('pending', 'executed', 'cancelled')),
  
  -- Slippage & Price Impact
  slippage_tolerance NUMERIC,
  price_impact NUMERIC,
  
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 4. إعدادات التحويل التلقائي للمجمع
-- =============================================
CREATE TABLE public.pool_auto_routing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES public.liquidity_pools(id) ON DELETE CASCADE NOT NULL,
  
  source_type TEXT NOT NULL CHECK (source_type IN ('purchase', 'game', 'activity', 'recharge', 'fee', 'all')),
  routing_percentage NUMERIC NOT NULL DEFAULT 5 CHECK (routing_percentage >= 0 AND routing_percentage <= 100),
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 5. برامج المساعدات والتبرعات
-- =============================================
CREATE TABLE public.pool_charity_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES public.liquidity_pools(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  icon_url TEXT,
  
  allocation_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  total_distributed NUMERIC NOT NULL DEFAULT 0,
  beneficiaries_count INTEGER NOT NULL DEFAULT 0,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 6. خطط الـ Staking
-- =============================================
CREATE TABLE public.pool_staking_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES public.liquidity_pools(id) ON DELETE CASCADE NOT NULL,
  
  name TEXT NOT NULL,
  name_en TEXT,
  duration_days INTEGER NOT NULL,
  apy_bonus NUMERIC NOT NULL DEFAULT 0,
  min_amount NUMERIC NOT NULL DEFAULT 0,
  max_amount NUMERIC,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- RLS Policies
-- =============================================
ALTER TABLE public.liquidity_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_auto_routing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_charity_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_staking_plans ENABLE ROW LEVEL SECURITY;

-- المجمعات: الكل يقرأ، الأدمن يعدل
CREATE POLICY "Anyone can view active pools" ON public.liquidity_pools FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage pools" ON public.liquidity_pools FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- المراكز: المستخدم يرى مراكزه فقط
CREATE POLICY "Users view own positions" ON public.liquidity_positions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users create positions" ON public.liquidity_positions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own positions" ON public.liquidity_positions FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage all positions" ON public.liquidity_positions FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- المعاملات: المستخدم يرى معاملاته
CREATE POLICY "Users view own transactions" ON public.liquidity_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users create transactions" ON public.liquidity_transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Admins manage all transactions" ON public.liquidity_transactions FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- التحويل التلقائي: الكل يقرأ، الأدمن يعدل
CREATE POLICY "Anyone can view routing" ON public.pool_auto_routing FOR SELECT USING (true);
CREATE POLICY "Admins manage routing" ON public.pool_auto_routing FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- التبرعات: الكل يقرأ، الأدمن يعدل
CREATE POLICY "Anyone can view charity programs" ON public.pool_charity_programs FOR SELECT USING (true);
CREATE POLICY "Admins manage charity" ON public.pool_charity_programs FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- خطط Staking: الكل يقرأ، الأدمن يعدل
CREATE POLICY "Anyone can view staking plans" ON public.pool_staking_plans FOR SELECT USING (true);
CREATE POLICY "Admins manage staking plans" ON public.pool_staking_plans FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- =============================================
-- بيانات ابتدائية: المجمع العام + مجمع العملة المستقرة
-- =============================================
INSERT INTO public.liquidity_pools (name, name_en, slug, pool_type, description, description_en, apy_percentage, fee_percentage) VALUES
('المجمع العام', 'General Pool', 'general-pool', 'general', 'المجمع الرئيسي للمنصة - يجمع السيولة من كل الأنشطة', 'Main platform pool - collects liquidity from all activities', 12.5, 0.3),
('مجمع العملة المستقرة', 'Stablecoin Pool', 'stablecoin-pool', 'stablecoin', 'مجمع مخصص للعملة المستقرة لتوفير استقرار السعر', 'Dedicated stablecoin pool for price stability', 8.0, 0.1);

-- خطط Staking ابتدائية
INSERT INTO public.pool_staking_plans (pool_id, name, name_en, duration_days, apy_bonus, min_amount) VALUES
((SELECT id FROM public.liquidity_pools WHERE slug = 'general-pool'), 'مرن', 'Flexible', 0, 0, 10),
((SELECT id FROM public.liquidity_pools WHERE slug = 'general-pool'), '30 يوم', '30 Days', 30, 5, 100),
((SELECT id FROM public.liquidity_pools WHERE slug = 'general-pool'), '90 يوم', '90 Days', 90, 12, 500),
((SELECT id FROM public.liquidity_pools WHERE slug = 'general-pool'), '180 يوم', '180 Days', 180, 20, 1000);

-- إعدادات التحويل التلقائي
INSERT INTO public.pool_auto_routing (pool_id, source_type, routing_percentage, description) VALUES
((SELECT id FROM public.liquidity_pools WHERE slug = 'general-pool'), 'purchase', 5, 'نسبة من كل عملية شراء'),
((SELECT id FROM public.liquidity_pools WHERE slug = 'general-pool'), 'game', 3, 'نسبة من أرباح الألعاب'),
((SELECT id FROM public.liquidity_pools WHERE slug = 'general-pool'), 'recharge', 2, 'نسبة من كل شحن رصيد'),
((SELECT id FROM public.liquidity_pools WHERE slug = 'general-pool'), 'fee', 10, 'نسبة من رسوم المنصة');

-- برنامج تبرعات ابتدائي
INSERT INTO public.pool_charity_programs (pool_id, name, name_en, description, description_en, allocation_percentage) VALUES
((SELECT id FROM public.liquidity_pools WHERE slug = 'general-pool'), 'صندوق المساعدات', 'Aid Fund', 'مساعدات للمحتاجين من أرباح المجمع', 'Aid for those in need from pool profits', 5),
((SELECT id FROM public.liquidity_pools WHERE slug = 'general-pool'), 'دعم التعليم', 'Education Support', 'دعم المبادرات التعليمية', 'Support educational initiatives', 3);
