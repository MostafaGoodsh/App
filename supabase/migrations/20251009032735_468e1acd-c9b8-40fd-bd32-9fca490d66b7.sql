-- Update the complete_daily_task function to handle one-time tasks
CREATE OR REPLACE FUNCTION public.complete_daily_task(p_task_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_task RECORD;
  v_already_completed BOOLEAN;
  v_is_one_time BOOLEAN := false;
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
  
  -- Check if this is a one-time task
  IF v_task.task_key = 'profile_update' THEN
    v_is_one_time := true;
    
    -- Check if already completed as one-time task
    SELECT EXISTS(
      SELECT 1 FROM public.user_daily_task_completions
      WHERE user_id = v_user_id 
        AND task_id = p_task_id 
        AND is_one_time_task = true
    ) INTO v_already_completed;
    
    IF v_already_completed THEN
      RETURN json_build_object('success', false, 'error', 'This task has already been completed permanently');
    END IF;
  ELSE
    -- Check if already completed today for regular tasks
    SELECT EXISTS(
      SELECT 1 FROM public.user_daily_task_completions
      WHERE user_id = v_user_id 
        AND task_id = p_task_id 
        AND completed_date = CURRENT_DATE
    ) INTO v_already_completed;
    
    IF v_already_completed THEN
      RETURN json_build_object('success', false, 'error', 'Task already completed today');
    END IF;
  END IF;
  
  -- Complete the task
  INSERT INTO public.user_daily_task_completions (
    user_id, task_id, points_earned, is_one_time_task
  ) VALUES (
    v_user_id, p_task_id, v_task.points_reward, v_is_one_time
  );
  
  RETURN json_build_object(
    'success', true, 
    'points_earned', v_task.points_reward,
    'task_title', v_task.title,
    'is_one_time', v_is_one_time
  );
END;
$function$;