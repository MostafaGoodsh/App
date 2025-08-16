-- إضافة دور المدير للمستخدم الحالي
INSERT INTO public.user_roles (user_id, role)
VALUES ('befe253f-c106-4ce9-aaac-8c9d22beda22', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;