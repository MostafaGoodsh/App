-- Fix notify_admins_on_content_pending trigger to use created_by instead of author_id
CREATE OR REPLACE FUNCTION public.notify_admins_on_content_pending()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_name TEXT;
BEGIN
  SELECT full_name INTO v_user_name FROM public.profiles WHERE user_id = NEW.created_by;
  PERFORM public.notify_all_admins(
    'محتوى جديد يحتاج موافقة', 
    'من ' || COALESCE(v_user_name, 'مستخدم'), 
    'admin_content_request', NEW.id, 'content', '/admin/content-approval'
  );
  RETURN NEW;
END;
$function$;