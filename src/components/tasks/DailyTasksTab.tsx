import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Coins } from "lucide-react";

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

interface DailyTasksTabProps {
  tasks: DailyTask[];
  completedTasks: string[];
  onCompleteTask: (taskId: string) => Promise<boolean>;
  loading?: boolean;
}

const DailyTasksTab = ({ 
  tasks, 
  completedTasks, 
  onCompleteTask, 
  loading = false 
}: DailyTasksTabProps) => {
  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'login': return '🔐';
      case 'profile': return '👤';
      case 'mining': return '⛏️';
      case 'learning': return '📚';
      default: return '📝';
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    await onCompleteTask(taskId);
  };

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
                  <span className="text-sm">{getTaskTypeIcon(task.task_type)}</span>
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
                  onClick={() => handleCompleteTask(task.id)}
                  disabled={loading}
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
          <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>لا توجد مهام يومية متاحة حالياً</p>
        </div>
      )}
    </div>
  );
};

export default DailyTasksTab;