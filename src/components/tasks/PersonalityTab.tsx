import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Coins, User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface PersonalityTask {
  id: string;
  title: string;
  title_en?: string;
  description: string | null;
  description_en?: string | null;
  points_reward: number;
  display_order: number;
}

const PersonalityTab = () => {
  const { user } = useAuth();
  const { language, t, dir } = useLanguage();
  const isArabic = language === "ar" || language === "both";
  const [tasks, setTasks] = useState<PersonalityTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPersonalityTasks();
      fetchCompletedTasks();
    }
  }, [user]);

  const fetchPersonalityTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('personality_development_tasks')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching personality tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_personality_completions')
        .select('task_id')
        .eq('user_id', user.id)
        .eq('completed_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      setCompletedTasks(data?.map(completion => completion.task_id) || []);
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
    }
  };

  const completeTask = async (taskId: string, pointsReward: number) => {
    if (!user) return;

    const isCompleted = completedTasks.includes(taskId);
    
    if (isCompleted) {
      try {
        setCompletedTasks(prev => prev.filter(id => id !== taskId));
        
        const { error } = await supabase
          .from('user_personality_completions')
          .delete()
          .eq('user_id', user.id)
          .eq('task_id', taskId)
          .eq('completed_date', new Date().toISOString().split('T')[0]);

        if (error) throw error;

        toast.success(t('تم إلغاء إكمال المهمة'));
      } catch (error) {
        console.error('Error uncompleting task:', error);
        setCompletedTasks(prev => [...prev, taskId]);
        toast.error(t('حدث خطأ أثناء إلغاء إكمال المهمة'));
      }
    } else {
      try {
        setCompletedTasks(prev => [...prev, taskId]);
        
        const { error } = await supabase
          .from('user_personality_completions')
          .insert({
            user_id: user.id,
            task_id: taskId,
            points_earned: pointsReward
          });

        if (error) throw error;

        toast.success(`${t('تم إكمال المهمة!')} +${pointsReward} ${t('نقطة')}`);
      } catch (error) {
        console.error('Error completing task:', error);
        setCompletedTasks(prev => prev.filter(id => id !== taskId));
        toast.error(t('حدث خطأ أثناء إكمال المهمة'));
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3" dir={dir}>
      {tasks.map((task) => {
        const isCompleted = completedTasks.includes(task.id);
        const displayTitle = (!isArabic && task.title_en) ? task.title_en : task.title;
        const displayDesc = (!isArabic && task.description_en) ? task.description_en : task.description;
        
        return (
          <div 
            key={task.id}
            onClick={() => completeTask(task.id, task.points_reward)}
            className="flex items-center justify-between p-4 rounded-lg border bg-background border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 flex-1">
              {isCompleted ? (
                <CheckCircle2 className="h-6 w-6 text-primary animate-scale-in" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
              )}
              
              <div className="flex-1">
                <h4 className="font-medium text-foreground">
                  {displayTitle}
                </h4>
                
                {displayDesc && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {displayDesc}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Coins className="h-4 w-4" />
                <span>{task.points_reward}</span>
              </div>
              
              {isCompleted && (
                <span className="text-primary text-lg font-bold">✓</span>
              )}
            </div>
          </div>
        );
      })}
      
      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t("لا توجد مهام تطوير الشخصية متاحة حالياً")}</p>
        </div>
      )}
    </div>
  );
};

export default PersonalityTab;
