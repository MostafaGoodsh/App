-- Create callout card content table for managing the main card content
CREATE TABLE public.callout_card_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Call out | استدعاء شرفي',
  description TEXT NOT NULL DEFAULT 'العقيدة و الأخلاق هي نقطة تميزنا و تفردنا',
  fixed_image_url TEXT DEFAULT '/lovable-uploads/109a2672-ce6d-4b3b-9e14-10a92facf011.png',
  contact_button_text TEXT DEFAULT 'تواصل مع الشخصية',
  contact_link TEXT DEFAULT '#',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.callout_card_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage callout card content" 
ON public.callout_card_content 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active callout card content" 
ON public.callout_card_content 
FOR SELECT 
USING (is_active = true);

-- Insert default content
INSERT INTO public.callout_card_content (
  title, 
  description, 
  fixed_image_url,
  contact_button_text,
  contact_link
) VALUES (
  'Call out | استدعاء شرفي',
  'العقيدة و الأخلاق هي نقطة تميزنا و تفردنا ، لذلك انشأنا هذا القسم خصيصا لارسال دعوات استدعاء شرفي لكل انسان مؤثر حول العالم و كل من يتبني و يخدم عقيدتنا و أهدافنا ،،، سعدنا بوضعك في قائمة الاستدعاء الشرفيه و يثرينا قبولك.',
  '/lovable-uploads/109a2672-ce6d-4b3b-9e14-10a92facf011.png',
  'تواصل مع الشخصية المكرمة',
  '#'
);

-- Add contact_link column to callout_personalities table
ALTER TABLE public.callout_personalities 
ADD COLUMN contact_link TEXT DEFAULT '#',
ADD COLUMN contact_button_text TEXT DEFAULT 'تواصل معي';

-- Create trigger for updated_at
CREATE TRIGGER update_callout_card_content_updated_at
BEFORE UPDATE ON public.callout_card_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();