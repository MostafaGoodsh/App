-- Fix missing notifications count function
-- This function was referenced in code but missing from database

CREATE OR REPLACE FUNCTION public.count_unread_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count INTEGER;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.notifications
  WHERE user_id = v_user_id 
    AND is_read = false
    AND is_admin_notification = false;
  
  RETURN COALESCE(v_count, 0);
END;
$function$;