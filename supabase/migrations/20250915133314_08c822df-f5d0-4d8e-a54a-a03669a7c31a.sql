-- Create reels categories table
CREATE TABLE IF NOT EXISTS public.reels_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add category_id to reels_content table
ALTER TABLE public.reels_content 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.reels_categories(id);

-- Enable RLS on reels_categories
ALTER TABLE public.reels_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for reels_categories
CREATE POLICY "Anyone can view active reels categories"
ON public.reels_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage reels categories"
ON public.reels_categories 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Insert some default categories
INSERT INTO public.reels_categories (title, description, icon, display_order) VALUES 
('التعليم', 'فيديوهات تعليمية حول العملات الرقمية', 'GraduationCap', 1),
('الأخبار', 'آخر الأخبار في عالم العملات الرقمية', 'Newspaper', 2),
('التحليل', 'تحليلات فنية ومالية', 'TrendingUp', 3),
('التوعية', 'نصائح وإرشادات مهمة', 'AlertTriangle', 4);

-- Update trigger for reels_categories
CREATE OR REPLACE TRIGGER update_reels_categories_updated_at
  BEFORE UPDATE ON public.reels_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();