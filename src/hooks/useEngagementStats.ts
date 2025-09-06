import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface EngagementStats {
  id: string;
  user_id: string;
  daily_logins: number;
  weekly_logins: number;
  monthly_logins: number;
  total_sessions: number;
  last_login_date: string | null;
  current_streak: number;
  longest_streak: number;
  total_content_views: number;
  total_comments: number;
  total_likes: number;
  total_mining_hours: number;
  profile_completion_score: number;
  created_at: string;
  updated_at: string;
}

interface DailyTask {
  id: string;
  task_key: string;
  title: string;
  description: string | null;
  points_reward: number;
  task_type: string;
  is_active: boolean;
  display_order: number;
}

interface TaskCompletion {
  id: string;
  task_id: string;
  completed_date: string;
  points_earned: number;
}

export const useEngagementStats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch user engagement stats
  const fetchStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_engagement_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching engagement stats:', error);
        return;
      }

      setStats(data);
    } catch (error) {
      console.error('Error fetching engagement stats:', error);
    }
  };

  // Fetch daily tasks
  const fetchDailyTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Error fetching daily tasks:', error);
        return;
      }

      setDailyTasks(data || []);
    } catch (error) {
      console.error('Error fetching daily tasks:', error);
    }
  };

  // Fetch completed tasks for today
  const fetchCompletedTasks = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('user_daily_task_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed_date', today);

      if (error) {
        console.error('Error fetching completed tasks:', error);
        return;
      }

      setCompletedTasks(data || []);
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
    }
  };

  // Update engagement stats (login tracking)
  const updateEngagementStats = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const { data, error } = await supabase.rpc('update_user_engagement_stats', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error updating engagement stats:', error);
        toast({
          title: "خطأ",
          description: "فشل في تحديث إحصائيات التفاعل",
          variant: "destructive",
        });
        return;
      }

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setStats(data as unknown as EngagementStats);
      }
    } catch (error) {
      console.error('Error updating engagement stats:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Complete a daily task
  const completeTask = async (taskId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('complete_daily_task', {
        p_task_id: taskId
      });

      if (error) {
        console.error('Error completing task:', error);
        toast({
          title: "خطأ",
          description: "فشل في إكمال المهمة",
          variant: "destructive",
        });
        return false;
      }

      const result = data as any;
      if (result.success) {
        toast({
          title: "تم بنجاح",
          description: `تم إكمال مهمة "${result.task_title}" وحصلت على ${result.points_earned} نقطة`,
        });
        
        // Refresh completed tasks
        await fetchCompletedTasks();
        await fetchStats(); // Refresh stats as points may have changed
        return true;
      } else {
        toast({
          title: "تنبيه",
          description: result.error || "لا يمكن إكمال هذه المهمة الآن",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  };

  // Uncomplete a daily task
  const uncompleteTask = async (taskId: string) => {
    if (!user) return false;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('user_daily_task_completions')
        .delete()
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .eq('completed_date', today);

      if (error) {
        console.error('Error uncompleting task:', error);
        toast({
          title: "خطأ",
          description: "فشل في إلغاء إكمال المهمة",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "تم بنجاح",
        description: "تم إلغاء إكمال المهمة",
      });
      
      // Refresh completed tasks
      await fetchCompletedTasks();
      await fetchStats(); // Refresh stats as points may have changed
      return true;
    } catch (error) {
      console.error('Error uncompleting task:', error);
      return false;
    }
  };

  // Check if a task is completed today
  const isTaskCompleted = (taskId: string): boolean => {
    return completedTasks.some(completion => completion.task_id === taskId);
  };

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchStats(),
        fetchDailyTasks(),
        fetchCompletedTasks()
      ]).finally(() => {
        setLoading(false);
      });

      // Update engagement stats on mount (login tracking)
      updateEngagementStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    stats,
    dailyTasks,
    completedTasks,
    loading,
    updating,
    completeTask,
    uncompleteTask,
    isTaskCompleted,
    updateEngagementStats,
    refetch: () => Promise.all([fetchStats(), fetchDailyTasks(), fetchCompletedTasks()])
  };
};