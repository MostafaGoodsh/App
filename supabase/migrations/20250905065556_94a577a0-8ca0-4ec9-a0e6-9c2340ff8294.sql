-- Create user engagement statistics table
CREATE TABLE public.user_engagement_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  daily_logins INTEGER DEFAULT 0,
  weekly_logins INTEGER DEFAULT 0,
  monthly_logins INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  last_login_date DATE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_content_views INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_mining_hours NUMERIC DEFAULT 0,
  profile_completion_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_engagement_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own engagement stats"
ON public.user_engagement_stats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own engagement stats"
ON public.user_engagement_stats
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own engagement stats"
ON public.user_engagement_stats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all engagement stats"
ON public.user_engagement_stats
FOR SELECT
USING (is_admin(auth.uid()));

-- Create daily tasks table
CREATE TABLE public.daily_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  points_reward INTEGER DEFAULT 10,
  task_type TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_tasks
CREATE POLICY "Anyone can view active daily tasks"
ON public.daily_tasks
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage daily tasks"
ON public.daily_tasks
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create user daily task completions table
CREATE TABLE public.user_daily_task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id, completed_date)
);

-- Enable RLS
ALTER TABLE public.user_daily_task_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task completions
CREATE POLICY "Users can view their own task completions"
ON public.user_daily_task_completions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task completions"
ON public.user_daily_task_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all task completions"
ON public.user_daily_task_completions
FOR SELECT
USING (is_admin(auth.uid()));

-- Create function to update user engagement stats
CREATE OR REPLACE FUNCTION public.update_user_engagement_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats RECORD;
  v_today DATE := CURRENT_DATE;
  v_current_streak INTEGER := 0;
  v_profile_score INTEGER := 0;
BEGIN
  -- Calculate current streak
  SELECT 
    COALESCE(current_streak, 0) + 
    CASE 
      WHEN last_login_date = v_today - INTERVAL '1 day' THEN 1
      WHEN last_login_date = v_today THEN 0
      ELSE 1
    END
  INTO v_current_streak
  FROM public.user_engagement_stats
  WHERE user_id = p_user_id;
  
  -- If no record exists, start with 1
  IF v_current_streak IS NULL THEN
    v_current_streak := 1;
  END IF;
  
  -- Calculate profile completion score
  v_profile_score := public.calculate_account_strength(p_user_id);
  
  -- Insert or update engagement stats
  INSERT INTO public.user_engagement_stats (
    user_id, daily_logins, last_login_date, current_streak, 
    longest_streak, profile_completion_score, total_sessions
  )
  VALUES (
    p_user_id, 1, v_today, v_current_streak, 
    v_current_streak, v_profile_score, 1
  )
  ON CONFLICT (user_id) DO UPDATE SET
    daily_logins = CASE 
      WHEN user_engagement_stats.last_login_date = v_today THEN user_engagement_stats.daily_logins
      ELSE user_engagement_stats.daily_logins + 1
    END,
    last_login_date = v_today,
    current_streak = CASE
      WHEN user_engagement_stats.last_login_date = v_today THEN user_engagement_stats.current_streak
      WHEN user_engagement_stats.last_login_date = v_today - INTERVAL '1 day' THEN user_engagement_stats.current_streak + 1
      ELSE 1
    END,
    longest_streak = GREATEST(
      user_engagement_stats.longest_streak,
      CASE
        WHEN user_engagement_stats.last_login_date = v_today THEN user_engagement_stats.current_streak
        WHEN user_engagement_stats.last_login_date = v_today - INTERVAL '1 day' THEN user_engagement_stats.current_streak + 1
        ELSE 1
      END
    ),
    total_sessions = user_engagement_stats.total_sessions + 1,
    profile_completion_score = v_profile_score,
    updated_at = now();
  
  -- Return updated stats
  SELECT * INTO v_stats
  FROM public.user_engagement_stats
  WHERE user_id = p_user_id;
  
  RETURN row_to_json(v_stats);
END;
$$;

-- Create function to complete daily task
CREATE OR REPLACE FUNCTION public.complete_daily_task(p_task_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_task RECORD;
  v_already_completed BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Authentication required');
  END IF;
  
  -- Get task details
  SELECT * INTO v_task
  FROM public.daily_tasks
  WHERE id = p_task_id AND is_active = true;
  
  IF v_task IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Task not found or inactive');
  END IF;
  
  -- Check if already completed today
  SELECT EXISTS(
    SELECT 1 FROM public.user_daily_task_completions
    WHERE user_id = v_user_id 
      AND task_id = p_task_id 
      AND completed_date = CURRENT_DATE
  ) INTO v_already_completed;
  
  IF v_already_completed THEN
    RETURN json_build_object('success', false, 'error', 'Task already completed today');
  END IF;
  
  -- Complete the task
  INSERT INTO public.user_daily_task_completions (
    user_id, task_id, points_earned
  ) VALUES (
    v_user_id, p_task_id, v_task.points_reward
  );
  
  RETURN json_build_object(
    'success', true, 
    'points_earned', v_task.points_reward,
    'task_title', v_task.title
  );
END;
$$;

-- Insert some default daily tasks
INSERT INTO public.daily_tasks (task_key, title, description, points_reward, task_type, display_order) VALUES
('daily_login', 'تسجيل الدخول اليومي', 'قم بتسجيل الدخول إلى المنصة', 10, 'login', 1),
('profile_update', 'تحديث الملف الشخصي', 'قم بتحديث معلومات ملفك الشخصي', 20, 'profile', 2),
('mining_session', 'جلسة تعدين', 'قم بتشغيل التعدين لمدة ساعة واحدة على الأقل', 30, 'mining', 3),
('content_interaction', 'تفاعل مع المحتوى', 'قم بقراءة أو التفاعل مع المحتوى التعليمي', 15, 'learning', 4);

-- Create trigger for automatic updated_at
CREATE TRIGGER update_user_engagement_stats_updated_at
  BEFORE UPDATE ON public.user_engagement_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_tasks_updated_at
  BEFORE UPDATE ON public.daily_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();