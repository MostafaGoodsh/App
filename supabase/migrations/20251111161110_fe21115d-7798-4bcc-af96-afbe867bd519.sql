-- جدول البثوث النشطة
CREATE TABLE IF NOT EXISTS public.active_live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_key TEXT UNIQUE NOT NULL,
  viewer_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول تعليقات البث المباشر
CREATE TABLE IF NOT EXISTS public.live_stream_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES public.active_live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول إعجابات البث المباشر
CREATE TABLE IF NOT EXISTS public.live_stream_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES public.active_live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(stream_id, user_id)
);

-- جدول مشاهدات البث
CREATE TABLE IF NOT EXISTS public.live_stream_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES public.active_live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.active_live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_stream_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_stream_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_stream_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies للبثوث النشطة
CREATE POLICY "الجميع يمكنهم مشاهدة البثوث النشطة"
  ON public.active_live_streams FOR SELECT
  USING (is_active = true);

CREATE POLICY "المستخدمون يمكنهم إنشاء بثوثهم"
  ON public.active_live_streams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم تحديث بثوثهم"
  ON public.active_live_streams FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم حذف بثوثهم"
  ON public.active_live_streams FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies للتعليقات
CREATE POLICY "الجميع يمكنهم قراءة التعليقات"
  ON public.live_stream_comments FOR SELECT
  USING (true);

CREATE POLICY "المستخدمون المسجلون يمكنهم إضافة تعليقات"
  ON public.live_stream_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم حذف تعليقاتهم"
  ON public.live_stream_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies للإعجابات
CREATE POLICY "الجميع يمكنهم قراءة الإعجابات"
  ON public.live_stream_likes FOR SELECT
  USING (true);

CREATE POLICY "المستخدمون يمكنهم إضافة إعجاب"
  ON public.live_stream_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم إزالة إعجابهم"
  ON public.live_stream_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies للمشاهدات
CREATE POLICY "الجميع يمكنهم قراءة المشاهدات"
  ON public.live_stream_views FOR SELECT
  USING (true);

CREATE POLICY "المستخدمون يمكنهم إضافة مشاهدة"
  ON public.live_stream_views FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "المستخدمون يمكنهم تحديث مشاهدتهم"
  ON public.live_stream_views FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Function لتحديث عدد الإعجابات
CREATE OR REPLACE FUNCTION update_stream_likes_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger لتحديث عدد الإعجابات
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON public.live_stream_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_stream_likes_count();

-- Function لتحديث updated_at
CREATE OR REPLACE FUNCTION update_live_stream_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث updated_at
CREATE TRIGGER update_live_stream_timestamp
  BEFORE UPDATE ON public.active_live_streams
  FOR EACH ROW
  EXECUTE FUNCTION update_live_stream_updated_at();

-- Indexes للأداء
CREATE INDEX idx_active_streams_user ON public.active_live_streams(user_id);
CREATE INDEX idx_active_streams_active ON public.active_live_streams(is_active);
CREATE INDEX idx_stream_comments_stream ON public.live_stream_comments(stream_id);
CREATE INDEX idx_stream_likes_stream ON public.live_stream_likes(stream_id);
CREATE INDEX idx_stream_views_stream ON public.live_stream_views(stream_id);