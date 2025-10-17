-- إصلاح دالة الإشعارات لاستخدام created_by بدلاً من author_id
CREATE OR REPLACE FUNCTION public.notify_user_on_content_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.approval_status = 'approved' AND OLD.approval_status != 'approved' THEN
    PERFORM public.create_notification(NEW.created_by, 'تمت الموافقة على المحتوى', NEW.title, 'content_approved', false, NEW.id, 'content', '/learning');
  ELSIF NEW.approval_status = 'rejected' AND OLD.approval_status != 'rejected' THEN
    PERFORM public.create_notification(NEW.created_by, 'تم رفض المحتوى', NEW.title, 'content_rejected', false, NEW.id, 'content', '/learning');
  END IF;
  RETURN NEW;
END;
$function$;