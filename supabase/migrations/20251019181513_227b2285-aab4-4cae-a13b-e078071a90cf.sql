-- التحقق من أن وظيفة approve_content تعمل بشكل صحيح
CREATE OR REPLACE FUNCTION public.approve_content(p_content_id uuid, p_admin_notes text DEFAULT NULL)
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
    is_published = true,
    updated_at = now()
  WHERE id = p_content_id;
  
  -- التحقق من نجاح العملية
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Content not found';
  END IF;
  
  RETURN TRUE;
END;
$$;

-- التحقق من أن وظيفة reject_content تعمل بشكل صحيح
CREATE OR REPLACE FUNCTION public.reject_content(p_content_id uuid, p_admin_notes text DEFAULT NULL)
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
    is_published = false,
    updated_at = now()
  WHERE id = p_content_id;
  
  -- التحقق من نجاح العملية
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Content not found';
  END IF;
  
  RETURN TRUE;
END;
$$;