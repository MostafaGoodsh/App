import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Coins, User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PersonalityTask {
  id: string;
  title: string;
  description: string | null;
  points_reward: number;
  display_order: number;
}

const PersonalityTab = () => {
  const { user } = useAuth();
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

    try {
      const { error } = await supabase
        .from('user_personality_completions')
        .insert({
          user_id: user.id,
          task_id: taskId,
          points_earned: pointsReward
        });

      if (error) throw error;

      setCompletedTasks(prev => [...prev, taskId]);
      toast.success(`تم إكمال المهمة! حصلت على ${pointsReward} نقطة`);
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('حدث خطأ أثناء إكمال المهمة');
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
    <div className="space-y-3">
      {tasks.map((task) => {
        const isCompleted = completedTasks.includes(task.id);
        
        return (
          <div 
            key={task.id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
              isCompleted 
                ? 'bg-green-50 border-green-200' 
                : 'bg-card border-border hover:border-primary/20'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />
                  <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h4>
                </div>
                
                {task.description && (
                  <p className={`text-sm ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <Coins className="h-4 w-4" />
                <span>{task.points_reward}</span>
              </div>
              
              {!isCompleted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => completeTask(task.id, task.points_reward)}
                  className="text-xs"
                >
                  إكمال
                </Button>
              )}
              
              {isCompleted && (
                <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>لا توجد مهام تطوير شخصية متاحة حالياً</p>
        </div>
      )}
    </div>
  );
};

export default PersonalityTab;