-- Create support messages table
CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  admin_response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view their own support messages"
ON public.support_messages
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own messages
CREATE POLICY "Users can create support messages"
ON public.support_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all messages
CREATE POLICY "Admins can view all support messages"
ON public.support_messages
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can update messages (respond)
CREATE POLICY "Admins can update support messages"
ON public.support_messages
FOR UPDATE
USING (is_admin(auth.uid()));

-- Trigger to update updated_at
CREATE TRIGGER update_support_messages_updated_at
BEFORE UPDATE ON public.support_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to notify admins of new support messages
CREATE OR REPLACE FUNCTION notify_admins_on_new_support_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  SELECT full_name INTO v_user_name FROM public.profiles WHERE user_id = NEW.user_id;
  PERFORM public.notify_all_admins(
    'رسالة دعم جديدة | New Support Message',
    'من ' || COALESCE(v_user_name, 'مستخدم') || ': ' || NEW.subject,
    'admin_support_message',
    NEW.id,
    'support',
    '/admin/support'
  );
  RETURN NEW;
END;
$$;

-- Trigger to notify admins on new support message
CREATE TRIGGER on_new_support_message
AFTER INSERT ON public.support_messages
FOR EACH ROW
EXECUTE FUNCTION notify_admins_on_new_support_message();

-- Function to notify user when admin responds
CREATE OR REPLACE FUNCTION notify_user_on_support_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.admin_response IS NOT NULL AND OLD.admin_response IS NULL THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'رد من الإدارة | Admin Response',
      'تم الرد على رسالتك: ' || NEW.subject,
      'support_response',
      false,
      NEW.id,
      'support',
      '/support'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to notify user on admin response
CREATE TRIGGER on_support_response
AFTER UPDATE ON public.support_messages
FOR EACH ROW
EXECUTE FUNCTION notify_user_on_support_response();