-- Create todo_list_introduction table for managing the introduction text
CREATE TABLE IF NOT EXISTS public.todo_list_introduction (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT 'قائمة مهامي',
  title_en text,
  content text NOT NULL DEFAULT 'نظم مهامك اليومية وحقق أهدافك',
  content_en text,
  text_direction text NOT NULL DEFAULT 'rtl',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.todo_list_introduction ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view active introduction
CREATE POLICY "Anyone can view active todo introduction"
  ON public.todo_list_introduction
  FOR SELECT
  USING (is_active = true);

-- Admins can manage todo introduction
CREATE POLICY "Admins can manage todo introduction"
  ON public.todo_list_introduction
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_todo_list_introduction_updated_at
  BEFORE UPDATE ON public.todo_list_introduction
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default introduction
INSERT INTO public.todo_list_introduction (title, content, is_active)
VALUES ('قائمة مهامي', 'نظم مهامك اليومية وحقق أهدافك', true);