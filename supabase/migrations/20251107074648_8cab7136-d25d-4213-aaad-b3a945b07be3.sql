-- تفعيل RLS على جداول المصادقة الثنائية
ALTER TABLE public.anubis_2fa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anubis_2fa_codes ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لجدول anubis_2fa_settings
CREATE POLICY "Users can view own 2FA settings"
ON public.anubis_2fa_settings
FOR SELECT
USING (
  anubis_user_id IN (
    SELECT anubis_user_id
    FROM public.anubis_sessions
    WHERE session_token = ((current_setting('request.headers', true))::json ->> 'x-anubis-session')
      AND expires_at > now()
  )
);

CREATE POLICY "Users can update own 2FA settings"
ON public.anubis_2fa_settings
FOR UPDATE
USING (
  anubis_user_id IN (
    SELECT anubis_user_id
    FROM public.anubis_sessions
    WHERE session_token = ((current_setting('request.headers', true))::json ->> 'x-anubis-session')
      AND expires_at > now()
  )
);

CREATE POLICY "Users can insert own 2FA settings"
ON public.anubis_2fa_settings
FOR INSERT
WITH CHECK (
  anubis_user_id IN (
    SELECT anubis_user_id
    FROM public.anubis_sessions
    WHERE session_token = ((current_setting('request.headers', true))::json ->> 'x-anubis-session')
      AND expires_at > now()
  )
);

-- سياسات RLS لجدول anubis_2fa_codes
CREATE POLICY "Users can view own 2FA codes"
ON public.anubis_2fa_codes
FOR SELECT
USING (
  anubis_user_id IN (
    SELECT anubis_user_id
    FROM public.anubis_sessions
    WHERE session_token = ((current_setting('request.headers', true))::json ->> 'x-anubis-session')
      AND expires_at > now()
  )
);

CREATE POLICY "System can insert 2FA codes"
ON public.anubis_2fa_codes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update 2FA codes"
ON public.anubis_2fa_codes
FOR UPDATE
USING (true);

-- تحديث الوظيفة لتنظيف الرموز المنتهية
DROP FUNCTION IF EXISTS public.cleanup_expired_2fa_codes();

CREATE OR REPLACE FUNCTION public.cleanup_expired_2fa_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.anubis_2fa_codes
  WHERE expires_at < now() OR used_at IS NOT NULL;
END;
$$;