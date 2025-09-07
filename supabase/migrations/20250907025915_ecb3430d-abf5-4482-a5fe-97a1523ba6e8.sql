-- إضافة دور إداري للمستخدم الحالي (يجب تغيير user_id بمعرف المستخدم الفعلي)
-- يمكن للمستخدم الحصول على user_id من صفحة المستخدمين في supabase

-- أولاً دعنا نتحقق من وجود أي مستخدمين إداريين
SELECT 
  ur.user_id,
  ur.role,
  p.email,
  p.full_name
FROM user_roles ur
LEFT JOIN profiles p ON p.user_id = ur.user_id
WHERE ur.role = 'admin';

-- إذا كنت تريد إضافة دور إداري لمستخدم معين، استخدم هذا الأمر:
-- يجب استبدال 'your-user-uuid-here' بمعرف المستخدم الفعلي
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('your-user-uuid-here', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;