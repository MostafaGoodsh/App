-- تحديث سياسات RLS للمحتوى التعليمي
DROP POLICY IF EXISTS "Anyone can view published content" ON public.learning_content;
DROP POLICY IF EXISTS "Authenticated users can create content" ON public.learning_content;
DROP POLICY IF EXISTS "Authors can update their own content" ON public.learning_content;
DROP POLICY IF EXISTS "Authors can delete their own content" ON public.learning_content;

-- سياسة لعرض المحتوى المعتمد فقط للجميع
CREATE POLICY "Anyone can view approved content" 
ON public.learning_content 
FOR SELECT 
USING (approval_status = 'approved');

-- سياسة للمستخدمين المصادق عليهم لإنشاء محتوى (في انتظار الموافقة)
CREATE POLICY "Authenticated users can create content for approval" 
ON public.learning_content 
FOR INSERT 
WITH CHECK (auth.uid() = created_by AND approval_status = 'pending');

-- سياسة للمؤلفين لعرض محتواهم الخاص
CREATE POLICY "Authors can view their own content" 
ON public.learning_content 
FOR SELECT 
USING (auth.uid() = created_by);

-- سياسة للمؤلفين لتحديث محتواهم المعلق فقط
CREATE POLICY "Authors can update their pending content" 
ON public.learning_content 
FOR UPDATE 
USING (auth.uid() = created_by AND approval_status = 'pending');

-- سياسة للإدارة لإدارة جميع المحتويات
CREATE POLICY "Admins can manage all content" 
ON public.learning_content 
FOR ALL 
USING (is_admin(auth.uid()));

-- إنشاء دالة لموافقة المحتوى
CREATE OR REPLACE FUNCTION public.approve_content(
  p_content_id uuid,
  p_admin_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- التحقق من صلاحيات الإدارة
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- تحديث حالة المحتوى إلى معتمد
  UPDATE public.learning_content 
  SET 
    approval_status = 'approved',
    approved_by = auth.uid(),
    approved_at = now(),
    admin_notes = p_admin_notes,
    is_published = true
  WHERE id = p_content_id;
  
  RETURN FOUND;
END;
$$;

-- إنشاء دالة لرفض المحتوى
CREATE OR REPLACE FUNCTION public.reject_content(
  p_content_id uuid,
  p_admin_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- التحقق من صلاحيات الإدارة
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- تحديث حالة المحتوى إلى مرفوض
  UPDATE public.learning_content 
  SET 
    approval_status = 'rejected',
    rejected_at = now(),
    admin_notes = p_admin_notes,
    is_published = false
  WHERE id = p_content_id;
  
  RETURN FOUND;
END;
$$;