-- إنشاء جدول إعدادات المصادقة الثنائية
CREATE TABLE IF NOT EXISTS public.anubis_2fa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anubis_user_id UUID NOT NULL REFERENCES public.anubis_users(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  method TEXT DEFAULT 'email' CHECK (method IN ('email', 'totp')),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(anubis_user_id)
);

-- إنشاء جدول رموز التحقق الثنائية
CREATE TABLE IF NOT EXISTS public.anubis_2fa_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anubis_user_id UUID NOT NULL REFERENCES public.anubis_users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  used_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء فهرس لتسريع البحث
CREATE INDEX idx_anubis_2fa_codes_user_id ON public.anubis_2fa_codes(anubis_user_id);
CREATE INDEX idx_anubis_2fa_codes_expires_at ON public.anubis_2fa_codes(expires_at);

-- وظيفة لتنظيف الرموز المنتهية
CREATE OR REPLACE FUNCTION public.cleanup_expired_2fa_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.anubis_2fa_codes
  WHERE expires_at < now() OR used_at IS NOT NULL;
END;
$$;

COMMENT ON TABLE public.anubis_2fa_settings IS 'إعدادات المصادقة الثنائية لمستخدمي Anubis';
COMMENT ON TABLE public.anubis_2fa_codes IS 'رموز التحقق الثنائية المؤقتة';