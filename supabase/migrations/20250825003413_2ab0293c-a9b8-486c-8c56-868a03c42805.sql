-- إنشاء جدول لإدارة محتوى التطبيق
CREATE TABLE public.app_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT NOT NULL,
  content_key TEXT NOT NULL,
  content_value TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(section_name, content_key)
);

-- تمكين Row Level Security
ALTER TABLE public.app_content ENABLE ROW LEVEL SECURITY;

-- سياسات للقراءة (جميع المستخدمين)
CREATE POLICY "Anyone can view app content" 
ON public.app_content 
FOR SELECT 
USING (true);

-- سياسات للكتابة (المدراء فقط)
CREATE POLICY "Only admins can insert app content" 
ON public.app_content 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update app content" 
ON public.app_content 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete app content" 
ON public.app_content 
FOR DELETE 
USING (public.is_admin(auth.uid()));

-- إضافة محتوى افتراضي
INSERT INTO public.app_content (section_name, content_key, content_value, content_type, description) VALUES
-- صفحة التعدين
('mining', 'dashboard_title', 'لوحة التعدين', 'text', 'عنوان لوحة التعدين'),
('mining', 'current_level_label', 'المستوى الحالي', 'text', 'تسمية المستوى الحالي'),
('mining', 'mining_rate_label', 'معدل التعدين/ساعة', 'text', 'تسمية معدل التعدين'),
('mining', 'total_mined_label', 'إجمالي المُعدن', 'text', 'تسمية إجمالي المعدن'),
('mining', 'account_strength_label', 'قوة الحساب', 'text', 'تسمية قوة الحساب'),
('mining', 'mining_status_active', 'التعدين نشط', 'text', 'حالة التعدين النشط'),
('mining', 'mining_status_inactive', 'التعدين متوقف', 'text', 'حالة التعدين المتوقف'),
('mining', 'start_mining_button', 'بدء التعدين', 'text', 'نص زر بدء التعدين'),
('mining', 'stop_mining_button', 'إيقاف التعدين', 'text', 'نص زر إيقاف التعدين'),
('mining', 'progress_chart_title', 'تطور التعدين خلال 24 ساعة', 'text', 'عنوان مخطط التطور'),

-- الشريط الجانبي
('sidebar', 'dashboard_label', 'الرئيسية', 'text', 'تسمية الصفحة الرئيسية'),
('sidebar', 'wallet_label', 'المحفظة', 'text', 'تسمية صفحة المحفظة'),
('sidebar', 'mining_label', 'التعدين', 'text', 'تسمية صفحة التعدين'),
('sidebar', 'learning_label', 'التعلم', 'text', 'تسمية صفحة التعلم'),
('sidebar', 'surveys_label', 'الاستطلاعات', 'text', 'تسمية صفحة الاستطلاعات'),
('sidebar', 'identity_label', 'الهوية الرقمية', 'text', 'تسمية صفحة الهوية'),
('sidebar', 'admin_section_label', 'الإدارة', 'text', 'تسمية قسم الإدارة'),

-- صفحة المحفظة
('wallet', 'title', 'محفظة العملات الرقمية', 'text', 'عنوان صفحة المحفظة'),
('wallet', 'connect_wallet_button', 'ربط المحفظة', 'text', 'نص زر ربط المحفظة'),
('wallet', 'balance_label', 'الرصيد', 'text', 'تسمية الرصيد'),

-- صفحة التعلم
('learning', 'title', 'المحتوى التعليمي', 'text', 'عنوان صفحة التعلم'),
('learning', 'search_placeholder', 'البحث في المحتوى...', 'text', 'نص البحث في المحتوى'),

-- صفحة الاستطلاعات
('surveys', 'title', 'الاستطلاعات', 'text', 'عنوان صفحة الاستطلاعات'),
('surveys', 'no_surveys_message', 'لا توجد استطلاعات متاحة حالياً', 'text', 'رسالة عدم وجود استطلاعات'),

-- صفحة الهوية
('identity', 'title', 'التحقق من الهوية', 'text', 'عنوان صفحة الهوية'),
('identity', 'verification_status_label', 'حالة التحقق', 'text', 'تسمية حالة التحقق'),

-- رسائل عامة
('general', 'loading_message', 'جاري التحميل...', 'text', 'رسالة التحميل'),
('general', 'error_message', 'حدث خطأ غير متوقع', 'text', 'رسالة خطأ عامة'),
('general', 'success_message', 'تم بنجاح', 'text', 'رسالة نجاح عامة'),
('general', 'save_button', 'حفظ', 'text', 'نص زر الحفظ'),
('general', 'cancel_button', 'إلغاء', 'text', 'نص زر الإلغاء'),
('general', 'delete_button', 'حذف', 'text', 'نص زر الحذف'),
('general', 'edit_button', 'تعديل', 'text', 'نص زر التعديل');

-- إضافة trigger لتحديث updated_at
CREATE TRIGGER update_app_content_updated_at
BEFORE UPDATE ON public.app_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();