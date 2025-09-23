-- إضافة حقول جديدة لنظام الموافقة واللغة والمحاذاة
ALTER TABLE public.learning_content 
ADD COLUMN approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN language text DEFAULT 'ar' CHECK (language IN ('ar', 'en', 'both')),
ADD COLUMN text_direction text DEFAULT 'rtl' CHECK (text_direction IN ('rtl', 'ltr', 'auto')),
ADD COLUMN author_name text,
ADD COLUMN submission_notes text,
ADD COLUMN admin_notes text,
ADD COLUMN approved_by uuid REFERENCES auth.users(id),
ADD COLUMN approved_at timestamp with time zone,
ADD COLUMN rejected_at timestamp with time zone;

-- تحديث المحتوى الموجود ليكون معتمد افتراضياً (محتوى الإدارة)
UPDATE public.learning_content 
SET approval_status = 'approved', 
    language = 'ar',
    text_direction = 'rtl'
WHERE approval_status IS NULL;