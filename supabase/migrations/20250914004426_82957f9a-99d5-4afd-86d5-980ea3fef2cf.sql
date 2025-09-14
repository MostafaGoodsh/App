-- إضافة دور أدمن للمستخدم الحالي (يجب تسجيل الدخول أولاً)
-- سأضيف دالة تقوم بإنشاء دور أدمن للمستخدم الأول الذي يسجل الدخول

-- إنشاء trigger لجعل أول مستخدم يسجل أدمن تلقائياً
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا لم يكن هناك أي أدمن، اجعل هذا المستخدم أدمن
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ربط الـ trigger بجدول المستخدمين في auth schema
DROP TRIGGER IF EXISTS on_auth_user_created_make_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_make_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.make_first_user_admin();

-- إضافة دالة لإعطاء دور أدمن لمستخدم معين
CREATE OR REPLACE FUNCTION public.grant_admin_role(user_email text)
RETURNS boolean AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- البحث عن المستخدم بالإيميل
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- إضافة دور الأدمن
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;