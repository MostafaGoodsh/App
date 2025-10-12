-- إنشاء نوع enum للأدوار (مع التحقق من عدم وجوده)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- إنشاء جدول user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- تفعيل RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للجميع بقراءة الأدوار (مطلوبة لدالة is_admin)
CREATE POLICY "Anyone can read roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);

-- سياسة للمدراء فقط لإدارة الأدوار
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- إضافة دور المدير للمستخدم الحالي
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'mostafaabogooda@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;