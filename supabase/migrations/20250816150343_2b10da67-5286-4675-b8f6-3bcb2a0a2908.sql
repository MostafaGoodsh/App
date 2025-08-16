-- حذف الـ triggers أولاً
DROP TRIGGER IF EXISTS learning_likes_count_trigger ON public.learning_likes;
DROP TRIGGER IF EXISTS learning_comments_count_trigger ON public.learning_comments;

-- ثم حذف الـ functions
DROP FUNCTION IF EXISTS update_likes_count();
DROP FUNCTION IF EXISTS update_comments_count();

-- إعادة إنشاء الـ functions مع search_path آمن
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.learning_content 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.learning_content 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.learning_content 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.learning_content 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- إعادة إنشاء الـ triggers
CREATE TRIGGER learning_likes_count_trigger
  AFTER INSERT OR DELETE ON public.learning_likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

CREATE TRIGGER learning_comments_count_trigger
  AFTER INSERT OR DELETE ON public.learning_comments
  FOR EACH ROW EXECUTE FUNCTION update_comments_count();