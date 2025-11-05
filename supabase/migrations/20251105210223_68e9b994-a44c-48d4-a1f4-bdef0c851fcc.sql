-- إضافة policy للسماح بالتسجيل للمستخدمين الجدد
-- نحتاج policy للـ INSERT على anubis_users للسماح بالتسجيل
DROP POLICY IF EXISTS "Allow public registration" ON public.anubis_users;

CREATE POLICY "Allow public registration" ON public.anubis_users
  FOR INSERT 
  WITH CHECK (true);

-- إضافة policy للـ INSERT على anubis_sessions
DROP POLICY IF EXISTS "Allow session creation" ON public.anubis_sessions;

CREATE POLICY "Allow session creation" ON public.anubis_sessions
  FOR INSERT 
  WITH CHECK (true);