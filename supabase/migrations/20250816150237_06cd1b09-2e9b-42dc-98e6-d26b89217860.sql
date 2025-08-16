-- إنشاء buckets للصور والفيديوهات في التعلم
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('learning-media', 'learning-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']);

-- إنشاء policies للـ bucket
CREATE POLICY "Anyone can view learning media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'learning-media');

CREATE POLICY "Authenticated users can upload learning media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'learning-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own learning media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'learning-media' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own learning media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'learning-media' AND auth.uid() = owner);

-- تحديث جدول learning_content لإضافة الصور والفيديوهات
ALTER TABLE public.learning_content 
ADD COLUMN IF NOT EXISTS media_urls TEXT[],
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- إنشاء جدول للتعليقات
CREATE TABLE IF NOT EXISTS public.learning_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.learning_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  parent_id UUID REFERENCES public.learning_comments(id) ON DELETE CASCADE
);

-- إنشاء جدول للإعجابات
CREATE TABLE IF NOT EXISTS public.learning_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.learning_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_id, user_id)
);

-- تفعيل RLS للجداول الجديدة
ALTER TABLE public.learning_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_likes ENABLE ROW LEVEL SECURITY;

-- سياسات للتعليقات
CREATE POLICY "Anyone can view comments on published content" 
ON public.learning_comments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.learning_content 
  WHERE id = content_id AND is_published = true
));

CREATE POLICY "Authenticated users can add comments" 
ON public.learning_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.learning_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.learning_comments 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" 
ON public.learning_comments 
FOR ALL 
USING (is_admin(auth.uid()));

-- سياسات للإعجابات
CREATE POLICY "Anyone can view likes on published content" 
ON public.learning_likes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.learning_content 
  WHERE id = content_id AND is_published = true
));

CREATE POLICY "Authenticated users can like content" 
ON public.learning_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" 
ON public.learning_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- إنشاء فنكشن لتحديث عداد الإعجابات
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- إنشاء فنكشن لتحديث عداد التعليقات
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- إنشاء triggers
CREATE TRIGGER learning_likes_count_trigger
  AFTER INSERT OR DELETE ON public.learning_likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

CREATE TRIGGER learning_comments_count_trigger
  AFTER INSERT OR DELETE ON public.learning_comments
  FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- إضافة triggers للـ updated_at
CREATE TRIGGER update_learning_comments_updated_at
  BEFORE UPDATE ON public.learning_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();