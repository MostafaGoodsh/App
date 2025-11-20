-- إصلاح search_path للـ functions الأمنية
ALTER FUNCTION cleanup_old_live_streams() SET search_path = public, pg_temp;
ALTER FUNCTION trigger_cleanup_old_streams() SET search_path = public, pg_temp;