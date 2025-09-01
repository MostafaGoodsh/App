-- Create table for honor call out personalities
CREATE TABLE public.callout_personalities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'public_figure',
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.callout_personalities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active personalities" 
ON public.callout_personalities 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage personalities" 
ON public.callout_personalities 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_callout_personalities_updated_at
BEFORE UPDATE ON public.callout_personalities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.callout_personalities (name, title, description, category, is_featured, display_order) VALUES
('د. أحمد زويل', 'عالم الكيمياء الحائز على نوبل', 'رائد في علم الكيمياء وحاصل على جائزة نوبل، نموذج للتميز العلمي والأخلاقي', 'scientist', true, 1),
('طه حسين', 'عميد الأدب العربي', 'مفكر وأديب مصري عظيم، ساهم في نهضة التعليم والثقافة العربية', 'intellectual', true, 2),
('أم كلثوم', 'كوكب الشرق', 'مطربة عربية أسطورية، رمز للفن الأصيل والقيم العربية الأصيلة', 'artist', true, 3);