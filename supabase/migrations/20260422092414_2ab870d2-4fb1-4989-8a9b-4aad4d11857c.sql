
-- 1. محتوى صفحة البلوكتشين (قابل للتعديل من الأدمن)
CREATE TABLE public.blockchain_page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  content TEXT,
  content_en TEXT,
  image_url TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blockchain_page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active blockchain content"
ON public.blockchain_page_content FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage blockchain content"
ON public.blockchain_page_content FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 2. أنواع المساهمات
CREATE TABLE public.blockchain_contribution_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  icon TEXT DEFAULT '⚡',
  color TEXT DEFAULT '#FFD700',
  required_points INTEGER DEFAULT 0,
  benefits TEXT,
  benefits_en TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blockchain_contribution_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active contribution types"
ON public.blockchain_contribution_types FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage contribution types"
ON public.blockchain_contribution_types FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 3. المهام البسيطة
CREATE TABLE public.blockchain_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  task_type TEXT NOT NULL DEFAULT 'daily',
  contribution_type_key TEXT,
  points_reward INTEGER DEFAULT 1,
  frequency TEXT DEFAULT 'daily',
  icon TEXT DEFAULT '✓',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blockchain_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active blockchain tasks"
ON public.blockchain_tasks FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage blockchain tasks"
ON public.blockchain_tasks FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 4. سجل إنجاز المهام
CREATE TABLE public.blockchain_task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES public.blockchain_tasks(id) ON DELETE CASCADE,
  points_earned INTEGER DEFAULT 0,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_id, completion_date)
);

ALTER TABLE public.blockchain_task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions"
ON public.blockchain_task_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completions"
ON public.blockchain_task_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all completions"
ON public.blockchain_task_completions FOR SELECT
USING (is_admin(auth.uid()));

-- 5. المساهمون النشطون
CREATE TABLE public.blockchain_contributors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  contribution_type_key TEXT NOT NULL DEFAULT 'observer',
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blockchain_contributors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contributor record"
ON public.blockchain_contributors FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view contributors stats"
ON public.blockchain_contributors FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can manage contributors"
ON public.blockchain_contributors FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- إضافة عمود الدور المطلوب لجدول الطلبات
ALTER TABLE public.blockchain_contributor_applications
ADD COLUMN IF NOT EXISTS contribution_role TEXT DEFAULT 'observer';

-- Triggers للتحديث التلقائي
CREATE TRIGGER update_blockchain_page_content_updated_at
BEFORE UPDATE ON public.blockchain_page_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blockchain_contribution_types_updated_at
BEFORE UPDATE ON public.blockchain_contribution_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blockchain_tasks_updated_at
BEFORE UPDATE ON public.blockchain_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blockchain_contributors_updated_at
BEFORE UPDATE ON public.blockchain_contributors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- دالة لتحديث نقاط المساهم تلقائياً عند إنجاز مهمة
CREATE OR REPLACE FUNCTION public.update_contributor_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.blockchain_contributors (user_id, total_points, last_activity_date, current_streak)
  VALUES (NEW.user_id, NEW.points_earned, NEW.completion_date, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = blockchain_contributors.total_points + NEW.points_earned,
    last_activity_date = NEW.completion_date,
    current_streak = CASE
      WHEN blockchain_contributors.last_activity_date = NEW.completion_date - INTERVAL '1 day' 
        THEN blockchain_contributors.current_streak + 1
      WHEN blockchain_contributors.last_activity_date = NEW.completion_date 
        THEN blockchain_contributors.current_streak
      ELSE 1
    END,
    updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_contributor_points
AFTER INSERT ON public.blockchain_task_completions
FOR EACH ROW EXECUTE FUNCTION public.update_contributor_points();

-- بيانات افتراضية: أنواع المساهمات الأربعة
INSERT INTO public.blockchain_contribution_types (type_key, name, name_en, description, description_en, icon, color, required_points, benefits, benefits_en, display_order) VALUES
('observer', 'مراقب', 'Observer', 'تابع تطور الشبكة وكن جزءاً من المجتمع دون مهام إلزامية', 'Follow network development and be part of the community without mandatory tasks', '👁️', '#6B7280', 0, 'وصول لأخبار الشبكة • إشعارات التحديثات', 'Network news access • Update notifications', 1),
('routine', 'مساهم روتيني', 'Routine Contributor', 'قم بمهام يومية بسيطة (دقائق فقط) وساهم في تأمين الشبكة', 'Perform simple daily tasks (just minutes) and help secure the network', '⚡', '#FFD700', 100, 'نقاط مساهمة • حصة مستقبلية في الشبكة • شارة مميزة', 'Contribution points • Future network share • Special badge', 2),
('node_operator', 'مدير عقدة', 'Node Operator', 'إدارة عقدة نشطة في الشبكة مع متطلبات تقنية متوسطة', 'Manage an active node in the network with moderate technical requirements', '🖥️', '#10B981', 500, 'مكافآت أعلى • أولوية في القرارات • دخل من رسوم الشبكة', 'Higher rewards • Voting priority • Network fee income', 3),
('validator', 'مُحقّق', 'Validator', 'تحقق من المعاملات وأمّن الشبكة بأعلى مستوى من المسؤولية', 'Validate transactions and secure the network at the highest level', '🛡️', '#A855F7', 2000, 'أعلى المكافآت • سلطة قرار • شريك مؤسس في الشبكة', 'Highest rewards • Decision authority • Founding partner', 4);

-- بيانات افتراضية: مهام بسيطة
INSERT INTO public.blockchain_tasks (task_key, title, title_en, description, description_en, task_type, contribution_type_key, points_reward, frequency, icon, display_order) VALUES
('daily_heartbeat', 'تأكيد النشاط اليومي', 'Daily Heartbeat', 'سجل دخولك اليومي لتأكيد أن عقدتك حية ونشطة في الشبكة', 'Log in daily to confirm your node is alive and active in the network', 'check_in', 'routine', 5, 'daily', '💓', 1),
('verify_transaction', 'التحقق من معاملة', 'Verify Transaction', 'راجع وأكّد صحة معاملة بسيطة بضغطة زر', 'Review and confirm the validity of a simple transaction with one click', 'validation', 'routine', 10, 'daily', '✅', 2),
('attest_data', 'شهادة بيانات', 'Data Attestation', 'أكّد صحة معلومة عامة في الشبكة (مثل سعر، تاريخ، إحصائية)', 'Confirm public information in the network (price, date, statistic)', 'attestation', 'routine', 8, 'daily', '📝', 3),
('soft_stake', 'حجز رصيد رمزي', 'Soft Stake', 'احجز جزءاً صغيراً من رصيدك ($MS-RA) لإثبات الجدية والالتزام', 'Lock a small portion of your balance ($MS-RA) to prove commitment', 'staking', 'node_operator', 50, 'monthly', '💎', 4),
('invite_verified', 'دعوة عضو موثق', 'Invite Verified Member', 'ادعُ صديقاً موثقاً للانضمام للشبكة وكافأ معه', 'Invite a verified friend to join the network and earn together', 'referral', 'routine', 20, 'unlimited', '🤝', 5);

-- بيانات افتراضية: محتوى الصفحة
INSERT INTO public.blockchain_page_content (section_key, title, title_en, description, description_en, content, content_en, icon, display_order) VALUES
('hero', 'كن لبنة في بناء شبكتنا', 'Be a Building Block of Our Network', 'شبكة بلوكتشين قوية لا تُبنى بأجهزة ضخمة فقط، بل بمشاركتك أنت ومجتمعنا', 'A strong blockchain network is not built only by huge machines, but by your participation and our community', 'كل دقيقة تقضيها معنا = لبنة في بناء مستقبل لامركزي يملكه المستخدمون، لا الشركات', 'Every minute you spend with us = a brick in building a decentralized future owned by users, not corporations', '🏛️', 1),
('how_it_works', 'كيف تعمل الفكرة؟', 'How Does It Work?', 'بدلاً من الاعتماد على أجهزة باهظة الثمن، نستخدم قوة المجتمع', 'Instead of relying on expensive equipment, we use the power of the community', 'كل مستخدم نشط = عقدة في الشبكة. كلما زاد عدد المستخدمين النشطين، زادت قوة وأمان الشبكة. أنت تقوم بمهام بسيطة (دقائق يومياً) ومقابل ذلك تحصل على نقاط مساهمة وحصة مستقبلية في الشبكة.', 'Each active user = a node in the network. The more active users, the stronger and more secure the network. You perform simple tasks (minutes daily) and in return get contribution points and a future share in the network.', '⚙️', 2),
('example_pi', 'مثال ملهم: Pi Network', 'Inspiring Example: Pi Network', 'شبكة بـ 50+ مليون مستخدم بنوها بضغطة زر يومية', 'A network of 50M+ users built with one daily click', 'Pi Network أثبتت أن البلوكتشين يمكن بناؤها بمشاركة شعبية. مستخدمون عاديون من جميع أنحاء العالم، يضغطون زراً واحداً كل 24 ساعة، أنشأوا شبكة من أكبر شبكات البلوكتشين في العالم. نحن نطبق نفس المبدأ ولكن بطريقتنا الخاصة.', 'Pi Network proved that blockchain can be built through popular participation. Ordinary users from around the world, pressing one button every 24 hours, created one of the largest blockchain networks. We apply the same principle in our own way.', '🌟', 3),
('your_role', 'ما هو دورك؟', 'What Is Your Role?', 'اختر مستوى المشاركة الذي يناسبك', 'Choose the participation level that suits you', 'لدينا 4 أنواع من المساهمين: المراقب (يتابع فقط)، المساهم الروتيني (مهام يومية بسيطة)، مدير العقدة (مسؤولية أكبر)، والمُحقّق (أعلى مستوى). كل مستوى له مكافآته ومتطلباته.', 'We have 4 types of contributors: Observer (just follows), Routine Contributor (simple daily tasks), Node Operator (more responsibility), and Validator (highest level). Each level has its rewards and requirements.', '🎯', 4),
('rewards', 'المكافآت والحوافز', 'Rewards & Incentives', 'مساهمتك اليوم = حصتك في المستقبل', 'Your contribution today = your share in the future', 'كل نقطة مساهمة تكتسبها اليوم تُترجم إلى:\n• حصة من رموز الشبكة عند الإطلاق الرسمي\n• مكافآت شهرية من رسوم الشبكة\n• شارات تميز ومكانة في المجتمع\n• أولوية في القرارات المستقبلية', 'Every contribution point you earn today translates to:\n• Share of network tokens at official launch\n• Monthly rewards from network fees\n• Distinguished badges and community status\n• Priority in future decisions', '🏆', 5);
