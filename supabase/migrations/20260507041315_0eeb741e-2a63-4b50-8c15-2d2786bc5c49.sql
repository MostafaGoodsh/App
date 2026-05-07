
-- 1. Access level enum
DO $$ BEGIN
  CREATE TYPE public.access_level AS ENUM ('none', 'early_access', 'kyc_verified', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Sidebar items table
CREATE TABLE IF NOT EXISTS public.sidebar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  title_ru TEXT,
  url TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Circle',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  min_access_level public.access_level NOT NULL DEFAULT 'kyc_verified',
  require_auth BOOLEAN NOT NULL DEFAULT true,
  is_admin_only BOOLEAN NOT NULL DEFAULT false,
  section TEXT NOT NULL DEFAULT 'main',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sidebar_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read visible sidebar items"
ON public.sidebar_items FOR SELECT
USING (is_visible = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins manage sidebar items"
ON public.sidebar_items FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_sidebar_items_updated
BEFORE UPDATE ON public.sidebar_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Function to compute user access level
CREATE OR REPLACE FUNCTION public.get_user_access_level(_user_id UUID)
RETURNS public.access_level
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin BOOLEAN;
  _has_early BOOLEAN;
  _has_kyc BOOLEAN;
BEGIN
  IF _user_id IS NULL THEN RETURN 'none'; END IF;

  SELECT public.has_role(_user_id, 'admin') INTO _is_admin;
  IF _is_admin THEN RETURN 'admin'; END IF;

  SELECT public.check_early_access(_user_id) INTO _has_early;
  IF NOT COALESCE(_has_early, false) THEN RETURN 'none'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.kyc_submissions
    WHERE user_id = _user_id AND status = 'approved'
  ) INTO _has_kyc;

  IF _has_kyc THEN RETURN 'kyc_verified'; ELSE RETURN 'early_access'; END IF;
END;
$$;

-- 4. Seed default sidebar items
INSERT INTO public.sidebar_items (key, title_ar, title_en, title_ru, url, icon_name, display_order, min_access_level, require_auth, section) VALUES
  ('home',          'الرئيسية',        'Home',          'Главная',       '/',              'Home',          10, 'none',         false, 'main'),
  ('profile',       'البروفايل',       'Profile',       'Профиль',       '/profile',       'User',          20, 'early_access', true,  'main'),
  ('surveys',       'الاستبيانات',     'Surveys',       'Опросы',        '/surveys',       'ClipboardList', 30, 'early_access', true,  'main'),
  ('kyc',           'تحقق الهوية',     'Identity',      'Проверка',      '/kyc',           'Shield',        40, 'early_access', true,  'main'),
  ('support',       'رسالة جديدة',    'Support',       'Поддержка',     '/support',       'MessageSquare', 50, 'early_access', true,  'main'),
  ('wallet',        'المحفظة',         'Wallet',        'Кошелек',       '/wallet',        'Wallet',        60, 'kyc_verified', true,  'main'),
  ('learning',      'التعلم',          'Learning',      'Обучение',      '/learning',      'BookOpen',      70, 'kyc_verified', false, 'main'),
  ('live_streams',  'البث المباشر',    'Live',          'Эфир',          '/live-streams',  'Video',         80, 'kyc_verified', false, 'main')
ON CONFLICT (key) DO NOTHING;
