-- إنشاء جدول المستخدمين الخاص بأنوبيس
CREATE TABLE IF NOT EXISTS public.anubis_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  subscription_type TEXT DEFAULT 'free_trial',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
);

-- إنشاء جدول الجلسات الخاص بأنوبيس
CREATE TABLE IF NOT EXISTS public.anubis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anubis_user_id UUID NOT NULL REFERENCES public.anubis_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_anubis_sessions_token ON public.anubis_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_anubis_sessions_user ON public.anubis_sessions(anubis_user_id);
CREATE INDEX IF NOT EXISTS idx_anubis_sessions_expires ON public.anubis_sessions(expires_at);

-- تفعيل RLS
ALTER TABLE public.anubis_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anubis_sessions ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول - المستخدمون يمكنهم قراءة بياناتهم فقط
CREATE POLICY "Users can read own data"
  ON public.anubis_users
  FOR SELECT
  USING (id IN (
    SELECT anubis_user_id FROM public.anubis_sessions 
    WHERE session_token = current_setting('request.headers', true)::json->>'x-anubis-session'
    AND expires_at > now()
  ));

-- المستخدمون يمكنهم تحديث بياناتهم
CREATE POLICY "Users can update own data"
  ON public.anubis_users
  FOR UPDATE
  USING (id IN (
    SELECT anubis_user_id FROM public.anubis_sessions 
    WHERE session_token = current_setting('request.headers', true)::json->>'x-anubis-session'
    AND expires_at > now()
  ));

-- سياسات الجلسات
CREATE POLICY "Users can read own sessions"
  ON public.anubis_sessions
  FOR SELECT
  USING (session_token = current_setting('request.headers', true)::json->>'x-anubis-session');

-- سياسة للإدارة
CREATE POLICY "Admins can view all anubis users"
  ON public.anubis_users
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- دالة للتحقق من الجلسة
CREATE OR REPLACE FUNCTION public.verify_anubis_session(p_session_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session RECORD;
  v_user RECORD;
BEGIN
  -- التحقق من الجلسة
  SELECT * INTO v_session
  FROM public.anubis_sessions
  WHERE session_token = p_session_token
    AND expires_at > now();
  
  IF v_session IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid or expired session'
    );
  END IF;
  
  -- الحصول على بيانات المستخدم
  SELECT id, email, full_name, subscription_type, status, end_date
  INTO v_user
  FROM public.anubis_users
  WHERE id = v_session.anubis_user_id;
  
  -- تحديث آخر تسجيل دخول
  UPDATE public.anubis_users
  SET last_login = now()
  WHERE id = v_user.id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'user', row_to_json(v_user)
  );
END;
$$;

-- دالة لتنظيف الجلسات المنتهية
CREATE OR REPLACE FUNCTION public.cleanup_expired_anubis_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.anubis_sessions
  WHERE expires_at < now();
END;
$$;