-- إنشاء دالة لإشعار المدراء عند تسجيل مستخدم جديد
CREATE OR REPLACE FUNCTION public.notify_admins_on_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
  v_user_email TEXT;
BEGIN
  -- الحصول على اسم وبريد المستخدم
  v_user_name := COALESCE(NEW.full_name, 'مستخدم جديد');
  v_user_email := COALESCE(NEW.email, '');
  
  -- إرسال إشعار لجميع المدراء
  PERFORM public.notify_all_admins(
    'مستخدم جديد سجل في المنصة | New User Registration',
    'المستخدم: ' || v_user_name || CASE WHEN v_user_email != '' THEN ' (' || v_user_email || ')' ELSE '' END,
    'admin_new_user',
    NEW.id,
    'user',
    '/admin/users'
  );
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger لتفعيل الإشعار عند إنشاء profile جديد
DROP TRIGGER IF EXISTS on_new_user_profile_created ON public.profiles;
CREATE TRIGGER on_new_user_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_on_new_user();