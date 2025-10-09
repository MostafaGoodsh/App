-- Create user_todo_items table for personal to-do lists
CREATE TABLE public.user_todo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_todo_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own todo items"
  ON public.user_todo_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todo items"
  ON public.user_todo_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todo items"
  ON public.user_todo_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todo items"
  ON public.user_todo_items FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_todo_items_updated_at
  BEFORE UPDATE ON public.user_todo_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add column to track one-time tasks completion
ALTER TABLE public.user_daily_task_completions
ADD COLUMN IF NOT EXISTS is_one_time_task BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX idx_user_todo_items_user_id ON public.user_todo_items(user_id);
CREATE INDEX idx_user_todo_items_completed ON public.user_todo_items(user_id, is_completed);