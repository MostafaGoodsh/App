-- Create reels content table
CREATE TABLE public.reels_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- duration in seconds
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.reels_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active reels content" 
ON public.reels_content 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage reels content" 
ON public.reels_content 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_reels_content_updated_at
BEFORE UPDATE ON public.reels_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.reels_content (title, title_en, description, description_en, video_url, thumbnail_url, display_order) VALUES
('مرحباً بك في منصة مصر', 'Welcome to Egypt Platform', 'فيديو ترحيبي يعرض المنصة', 'Welcome video showcasing the platform', 'https://example.com/video1.mp4', '/lovable-uploads/egyptian-cat-bg.jpg', 1),
('كيفية استخدام المحفظة', 'How to Use the Wallet', 'شرح استخدام المحفظة الرقمية', 'Tutorial on using the digital wallet', 'https://example.com/video2.mp4', '/lovable-uploads/egyptian-cat-bg.jpg', 2),
('التعدين والمكافآت', 'Mining and Rewards', 'فهم نظام التعدين والمكافآت', 'Understanding the mining and rewards system', 'https://example.com/video3.mp4', '/lovable-uploads/egyptian-cat-bg.jpg', 3);