-- Create app content management table
CREATE TABLE public.app_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key text NOT NULL UNIQUE,
  content_type text NOT NULL DEFAULT 'text',
  text_content text,
  image_url text,
  alt_text text,
  position_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active content" 
ON public.app_content 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all content" 
ON public.app_content 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_app_content_updated_at
BEFORE UPDATE ON public.app_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default content
INSERT INTO public.app_content (content_key, content_type, text_content) VALUES
('hero_title', 'text', 'أهلاً بك في منصة الهوية الرقمية'),
('hero_subtitle', 'text', 'احصل على وصول مبكر لمنصة الهوية الرقمية الأكثر أماناً وسهولة في الاستخدام'),
('hero_cta', 'text', 'احصل على وصول مبكر'),
('app_name', 'text', 'الهوية الرقمية'),
('learning_title', 'text', 'مركز التعلم'),
('learning_subtitle', 'text', 'اكتشف محتوى تعليمي متنوع وتفاعل مع المجتمع');