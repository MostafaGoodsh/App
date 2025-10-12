-- إصلاح مشاكل التسجيل والوصول

-- 1. تعديل check constraint في notifications لإضافة admin_new_user
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN (
    'content_approved', 
    'content_rejected', 
    'admin_content_request',
    'admin_new_user',
    'admin_support_message',
    'support_response',
    'system',
    'info',
    'warning',
    'success'
  ));

-- 2. تعديل check constraint على phone format ليسمح بـ null أو empty
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_phone_format;
ALTER TABLE public.profiles ADD CONSTRAINT valid_phone_format 
  CHECK (
    phone IS NULL OR 
    phone = '' OR 
    phone ~ '^\+?[0-9]{10,15}$'
  );

-- 3. التأكد من أن المستخدمين الجدد has_access = false افتراضياً (تم بالفعل)
-- التأكد من أن default value موجود
ALTER TABLE public.profiles ALTER COLUMN has_access SET DEFAULT false;