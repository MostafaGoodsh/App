-- إنشاء جدول لحفظ مقدمات أقسام المهام
CREATE TABLE public.task_section_introductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_type TEXT NOT NULL UNIQUE CHECK (section_type IN ('general', 'daily_tasks', 'media_content', 'personality_tasks')),
  title TEXT NOT NULL,
  title_en TEXT,
  content TEXT NOT NULL,
  content_en TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  text_direction TEXT NOT NULL DEFAULT 'rtl',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء trigger لتحديث updated_at تلقائياً
CREATE TRIGGER update_task_section_introductions_updated_at
  BEFORE UPDATE ON public.task_section_introductions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- إنشاء RLS policies
ALTER TABLE public.task_section_introductions ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بمشاهدة المقدمات النشطة
CREATE POLICY "Anyone can view active introductions"
ON public.task_section_introductions
FOR SELECT
USING (is_active = true);

-- السماح للإدارة بإدارة المقدمات
CREATE POLICY "Admins can manage introductions"
ON public.task_section_introductions
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- إدراج مقدمات افتراضية
INSERT INTO public.task_section_introductions (section_type, title, content) VALUES
('general', 'مرحباً بك في المهام اليومية', 'أكمل مهامك اليومية للحصول على النقاط والمكافآت'),
('daily_tasks', 'المهام العامة', 'هذه مجموعة من المهام العامة التي يمكنك إكمالها يومياً'),
('media_content', 'محتوى الوسائط', 'اطلع على أحدث المحتوى التعليمي والإعلامي'),
('personality_tasks', 'مهام تطوير الشخصية', 'مهام مصممة لمساعدتك على تطوير شخصيتك ومهاراتك');