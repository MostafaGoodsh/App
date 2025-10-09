-- Create table for daily tasks card content
CREATE TABLE IF NOT EXISTS public.daily_tasks_card_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Tasks | المهام',
  description TEXT NOT NULL DEFAULT 'أكمل المهام اليومية واحصل على النقاط وقم ببناء سلسلة حضورك المتتالي',
  background_image_url TEXT DEFAULT '/lovable-uploads/70f695e0-7133-47ea-82e8-7cca2196e7f4.png',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.daily_tasks_card_content ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active daily tasks card content"
ON public.daily_tasks_card_content FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage daily tasks card content"
ON public.daily_tasks_card_content FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Insert default content
INSERT INTO public.daily_tasks_card_content (title, description, background_image_url)
VALUES (
  'Tasks | المهام',
  'أكمل المهام اليومية واحصل على النقاط وقم ببناء سلسلة حضورك المتتالي',
  '/lovable-uploads/70f695e0-7133-47ea-82e8-7cca2196e7f4.png'
)
ON CONFLICT DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_daily_tasks_card_content_updated_at
BEFORE UPDATE ON public.daily_tasks_card_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();