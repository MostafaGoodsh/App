-- Create reels_card_content table for managing the ReelsCard title and description
CREATE TABLE public.reels_card_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'الفيديوهات القصيرة',
  description TEXT NOT NULL DEFAULT 'شاهد مجموعة مختارة من الفيديوهات التعليمية القصيرة حول منصة مصر والعملات الرقمية',
  background_image_url TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.reels_card_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active reels card content" 
ON public.reels_card_content 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage reels card content" 
ON public.reels_card_content 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_reels_card_content_updated_at
BEFORE UPDATE ON public.reels_card_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content
INSERT INTO public.reels_card_content (title, description) 
VALUES ('الفيديوهات القصيرة', 'شاهد مجموعة مختارة من الفيديوهات التعليمية القصيرة حول منصة مصر والعملات الرقمية');