-- Create media content table for daily tasks
CREATE TABLE public.daily_media_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'article', 'image')),
  media_url TEXT,
  article_content TEXT,
  points_reward INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personality development tasks table
CREATE TABLE public.personality_development_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points_reward INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user media content completions
CREATE TABLE public.user_media_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_id UUID NOT NULL REFERENCES public.daily_media_content(id),
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user personality task completions
CREATE TABLE public.user_personality_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES public.personality_development_tasks(id),
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_media_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_development_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_media_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_personality_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_media_content
CREATE POLICY "Anyone can view active media content" 
ON public.daily_media_content 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage media content" 
ON public.daily_media_content 
FOR ALL 
USING (is_admin(auth.uid())) 
WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for personality_development_tasks
CREATE POLICY "Anyone can view active personality tasks" 
ON public.personality_development_tasks 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage personality tasks" 
ON public.personality_development_tasks 
FOR ALL 
USING (is_admin(auth.uid())) 
WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for user_media_completions
CREATE POLICY "Users can view their own media completions" 
ON public.user_media_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media completions" 
ON public.user_media_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all media completions" 
ON public.user_media_completions 
FOR SELECT 
USING (is_admin(auth.uid()));

-- RLS Policies for user_personality_completions
CREATE POLICY "Users can view their own personality completions" 
ON public.user_personality_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personality completions" 
ON public.user_personality_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all personality completions" 
ON public.user_personality_completions 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_daily_media_content_active ON public.daily_media_content(is_active, display_order);
CREATE INDEX idx_personality_development_tasks_active ON public.personality_development_tasks(is_active, display_order);
CREATE INDEX idx_user_media_completions_user_date ON public.user_media_completions(user_id, completed_date);
CREATE INDEX idx_user_personality_completions_user_date ON public.user_personality_completions(user_id, completed_date);