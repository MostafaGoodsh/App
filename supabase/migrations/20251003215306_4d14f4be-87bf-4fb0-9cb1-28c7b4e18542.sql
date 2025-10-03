-- إنشاء جدول الإشعارات
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'info', 'success', 'warning', 'error',
    'kyc_approved', 'kyc_rejected', 'kyc_pending',
    'withdrawal_approved', 'withdrawal_rejected', 'withdrawal_pending',
    'content_approved', 'content_rejected',
    'new_update', 'new_feature', 'system',
    'admin_kyc_request', 'admin_withdrawal_request', 'admin_content_request'
  )),
  is_read BOOLEAN DEFAULT FALSE,
  is_admin_notification BOOLEAN DEFAULT FALSE,
  related_id UUID NULL,
  related_type TEXT NULL,
  action_url TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE NULL
);

-- إنشاء فهارس للأداء
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_admin ON public.notifications(is_admin_notification) WHERE is_admin_notification = true;

-- تفعيل RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للمستخدمين
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id AND is_admin_notification = false);

CREATE POLICY "Users can mark their notifications as read"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id AND is_admin_notification = false)
WITH CHECK (auth.uid() = user_id AND is_admin_notification = false);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id AND is_admin_notification = false);

-- سياسات RLS للمدراء
CREATE POLICY "Admins can view admin notifications"
ON public.notifications FOR SELECT
USING (is_admin(auth.uid()) AND is_admin_notification = true);

CREATE POLICY "Admins can manage admin notifications"
ON public.notifications FOR ALL
USING (is_admin(auth.uid()) AND is_admin_notification = true);

-- سياسة لإنشاء الإشعارات
CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- دالة لإنشاء إشعار
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_is_admin BOOLEAN DEFAULT FALSE,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, title, message, type, is_admin_notification,
    related_id, related_type, action_url
  ) VALUES (
    p_user_id, p_title, p_message, p_type, p_is_admin,
    p_related_id, p_related_type, p_action_url
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- دالة لإرسال إشعارات لجميع المدراء
CREATE OR REPLACE FUNCTION public.notify_all_admins(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_record RECORD;
  v_count INTEGER := 0;
BEGIN
  -- إرسال إشعار لكل مدير
  FOR v_admin_record IN 
    SELECT DISTINCT user_id 
    FROM public.user_roles 
    WHERE role = 'admin'
  LOOP
    PERFORM public.create_notification(
      v_admin_record.user_id,
      p_title,
      p_message,
      p_type,
      true,
      p_related_id,
      p_related_type,
      p_action_url
    );
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- Trigger لإشعار المدراء عند طلب KYC جديد
CREATE OR REPLACE FUNCTION public.notify_admins_on_kyc_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  SELECT full_name INTO v_user_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;
  
  PERFORM public.notify_all_admins(
    'طلب توثيق هوية جديد | New KYC Request',
    'طلب توثيق هوية جديد من ' || COALESCE(v_user_name, 'مستخدم') || ' | New KYC verification request',
    'admin_kyc_request',
    NEW.id,
    'kyc',
    '/admin/kyc'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_kyc_request_created
  AFTER INSERT ON public.identity_verification
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admins_on_kyc_request();

-- Trigger لإشعار المستخدم عند الموافقة/الرفض على KYC
CREATE OR REPLACE FUNCTION public.notify_user_on_kyc_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'تم الموافقة على توثيق الهوية | KYC Approved',
      'تم الموافقة على طلب توثيق هويتك بنجاح | Your identity verification has been approved',
      'kyc_approved',
      false,
      NEW.id,
      'kyc',
      '/identity'
    );
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'تم رفض توثيق الهوية | KYC Rejected',
      'تم رفض طلب توثيق هويتك. ' || COALESCE(NEW.verification_notes, 'يرجى المحاولة مرة أخرى') || ' | Your identity verification was rejected',
      'kyc_rejected',
      false,
      NEW.id,
      'kyc',
      '/identity'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_kyc_status_updated
  AFTER UPDATE ON public.identity_verification
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_user_on_kyc_status();

-- Trigger لإشعار المدراء عند طلب سحب جديد
CREATE OR REPLACE FUNCTION public.notify_admins_on_withdrawal_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  SELECT full_name INTO v_user_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;
  
  PERFORM public.notify_all_admins(
    'طلب سحب جديد | New Withdrawal Request',
    'طلب سحب جديد من ' || COALESCE(v_user_name, 'مستخدم') || ' بقيمة ' || NEW.internal_amount || ' | New withdrawal request',
    'admin_withdrawal_request',
    NEW.id,
    'withdrawal',
    '/admin/withdrawals'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_withdrawal_request_created
  AFTER INSERT ON public.withdrawal_requests
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admins_on_withdrawal_request();

-- Trigger لإشعار المستخدم عند معالجة طلب السحب
CREATE OR REPLACE FUNCTION public.notify_user_on_withdrawal_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'تم إتمام عملية السحب | Withdrawal Completed',
      'تم إتمام طلب السحب بنجاح | Your withdrawal request has been completed',
      'withdrawal_approved',
      false,
      NEW.id,
      'withdrawal',
      '/wallet'
    );
  ELSIF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'فشل عملية السحب | Withdrawal Failed',
      'فشل طلب السحب. يرجى المحاولة مرة أخرى | Your withdrawal request has failed',
      'withdrawal_rejected',
      false,
      NEW.id,
      'withdrawal',
      '/wallet'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_withdrawal_status_updated
  AFTER UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_user_on_withdrawal_status();

-- Trigger لإشعار المدراء عند محتوى جديد يحتاج موافقة
CREATE OR REPLACE FUNCTION public.notify_admins_on_content_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  SELECT full_name INTO v_user_name
  FROM public.profiles
  WHERE user_id = NEW.author_id;
  
  PERFORM public.notify_all_admins(
    'محتوى جديد يحتاج موافقة | New Content Pending',
    'محتوى جديد من ' || COALESCE(v_user_name, 'مستخدم') || ': ' || LEFT(NEW.title, 50) || ' | New content needs approval',
    'admin_content_request',
    NEW.id,
    'content',
    '/admin/content-approval'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_content_pending_created
  AFTER INSERT ON public.learning_content
  FOR EACH ROW
  WHEN (NEW.approval_status = 'pending')
  EXECUTE FUNCTION public.notify_admins_on_content_pending();

-- Trigger لإشعار المستخدم عند الموافقة/الرفض على المحتوى
CREATE OR REPLACE FUNCTION public.notify_user_on_content_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.approval_status = 'approved' AND OLD.approval_status != 'approved' THEN
    PERFORM public.create_notification(
      NEW.author_id,
      'تمت الموافقة على المحتوى | Content Approved',
      'تمت الموافقة على محتواك: ' || NEW.title || ' | Your content has been approved',
      'content_approved',
      false,
      NEW.id,
      'content',
      '/learning'
    );
  ELSIF NEW.approval_status = 'rejected' AND OLD.approval_status != 'rejected' THEN
    PERFORM public.create_notification(
      NEW.author_id,
      'تم رفض المحتوى | Content Rejected',
      'تم رفض محتواك: ' || NEW.title || '. ' || COALESCE(NEW.admin_notes, '') || ' | Your content was rejected',
      'content_rejected',
      false,
      NEW.id,
      'content',
      '/learning'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_content_status_updated
  AFTER UPDATE ON public.learning_content
  FOR EACH ROW
  WHEN (OLD.approval_status IS DISTINCT FROM NEW.approval_status)
  EXECUTE FUNCTION public.notify_user_on_content_status();

-- دالة لعد الإشعارات غير المقروءة
CREATE OR REPLACE FUNCTION public.count_unread_notifications(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.notifications
  WHERE user_id = p_user_id 
    AND is_read = false
    AND is_admin_notification = false;
  
  RETURN v_count;
END;
$$;

-- دالة لعد إشعارات المدراء غير المقروءة
CREATE OR REPLACE FUNCTION public.count_admin_unread_notifications(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF NOT is_admin(p_user_id) THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.notifications
  WHERE user_id = p_user_id 
    AND is_read = false
    AND is_admin_notification = true;
  
  RETURN v_count;
END;
$$;

-- دالة لتحديد جميع الإشعارات كمقروءة
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id UUID, p_is_admin BOOLEAN DEFAULT FALSE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE user_id = p_user_id 
    AND is_read = false
    AND is_admin_notification = p_is_admin;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- تفعيل Realtime للإشعارات
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;