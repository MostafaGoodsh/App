-- Fix notifications.type check constraint violations for withdrawals by using allowed types

CREATE OR REPLACE FUNCTION public.notify_admins_on_withdrawal_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  SELECT full_name INTO v_user_name FROM public.profiles WHERE user_id = NEW.user_id;

  -- 'admin_withdrawal_request' is not allowed by notifications_type_check; use a permitted type.
  PERFORM public.notify_all_admins(
    'طلب سحب جديد',
    'طلب من ' || COALESCE(v_user_name, 'مستخدم'),
    'system',
    NEW.id,
    'withdrawal',
    '/admin/withdrawals'
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_user_on_withdrawal_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- 'withdrawal_approved' / 'withdrawal_rejected' are not allowed by notifications_type_check; map to permitted types.
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'تم إتمام السحب',
      'تم إتمام طلبك',
      'success',
      false,
      NEW.id,
      'withdrawal',
      '/wallet'
    );
  ELSIF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'فشل السحب',
      'فشل طلبك',
      'warning',
      false,
      NEW.id,
      'withdrawal',
      '/wallet'
    );
  END IF;

  RETURN NEW;
END;
$$;