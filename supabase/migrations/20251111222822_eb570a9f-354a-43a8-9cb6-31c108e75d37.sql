-- إصلاح search_path للدوال (مع حذف التبعيات أولاً)
DROP TRIGGER IF EXISTS update_likes_count_trigger ON public.live_stream_likes;
DROP FUNCTION IF EXISTS update_stream_likes_count();

CREATE OR REPLACE FUNCTION update_stream_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.active_live_streams
    SET likes_count = likes_count + 1
    WHERE id = NEW.stream_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.active_live_streams
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.stream_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- إعادة إنشاء الـ trigger
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON public.live_stream_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_stream_likes_count();

-- إصلاح الدالة الثانية
DROP TRIGGER IF EXISTS update_live_stream_timestamp ON public.active_live_streams;
DROP FUNCTION IF EXISTS update_live_stream_updated_at();

CREATE OR REPLACE FUNCTION update_live_stream_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- إعادة إنشاء الـ trigger
CREATE TRIGGER update_live_stream_timestamp
  BEFORE UPDATE ON public.active_live_streams
  FOR EACH ROW
  EXECUTE FUNCTION update_live_stream_updated_at();