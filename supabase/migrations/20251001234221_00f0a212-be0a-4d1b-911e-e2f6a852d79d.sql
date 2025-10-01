-- إضافة حقل verified للبروفايلات
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- إنشاء جدول المتابعات
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- إضافة فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

-- تفعيل RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للمتابعات
CREATE POLICY "Users can view all follows"
ON public.user_follows
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can follow others"
ON public.user_follows
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON public.user_follows
FOR DELETE
TO authenticated
USING (auth.uid() = follower_id);

-- إضافة أعمدة لعدد المتابعين والمتابعين في البروفايل
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- دالة لتحديث عدد المتابعين
CREATE OR REPLACE FUNCTION public.update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- زيادة عدد المتابعين للحساب المتابَع
    UPDATE public.profiles 
    SET followers_count = followers_count + 1 
    WHERE user_id = NEW.following_id;
    
    -- زيادة عدد المتابعين للحساب المتابِع
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- تقليل عدد المتابعين للحساب المتابَع
    UPDATE public.profiles 
    SET followers_count = GREATEST(0, followers_count - 1)
    WHERE user_id = OLD.following_id;
    
    -- تقليل عدد المتابعين للحساب المتابِع
    UPDATE public.profiles 
    SET following_count = GREATEST(0, following_count - 1)
    WHERE user_id = OLD.follower_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger لتحديث العداد تلقائياً
CREATE TRIGGER update_followers_count_trigger
AFTER INSERT OR DELETE ON public.user_follows
FOR EACH ROW
EXECUTE FUNCTION public.update_followers_count();

-- دالة للإدارة لاعتماد الحسابات
CREATE OR REPLACE FUNCTION public.verify_user_profile(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- التحقق من صلاحيات الإدارة
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- اعتماد الحساب
  UPDATE public.profiles 
  SET 
    is_verified = true,
    verified_at = now(),
    verified_by = auth.uid()
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- دالة لإلغاء اعتماد الحسابات
CREATE OR REPLACE FUNCTION public.unverify_user_profile(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- التحقق من صلاحيات الإدارة
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- إلغاء اعتماد الحساب
  UPDATE public.profiles 
  SET 
    is_verified = false,
    verified_at = NULL,
    verified_by = NULL
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;