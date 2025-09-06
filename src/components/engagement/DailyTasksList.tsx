import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Coins, Clock } from "lucide-react";

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

interface DailyTasksListProps {
  tasks: DailyTask[];
  completedTasks: string[];
  onCompleteTask: (taskId: string) => Promise<boolean>;
  onUncompleteTask: (taskId: string) => Promise<boolean>;
  loading?: boolean;
}

const DailyTasksList = ({ 
  tasks, 
  completedTasks, 
  onCompleteTask, 
  onUncompleteTask,
  loading = false 
}: DailyTasksListProps) => {
  const getTaskTypeColor = (type: string) => {
    return 'bg-background border border-border text-foreground';
  };

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

  const handleUncompleteTask = async (taskId: string) => {
    await onUncompleteTask(taskId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          المهام اليومية
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => {
            const isCompleted = completedTasks.includes(task.id);
            
            return (
              <div 
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer hover:scale-[1.01] ${
                  isCompleted 
                    ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/20' 
                    : 'bg-background border-border hover:border-primary/50 hover:shadow-md'
                }`}
                onClick={() => isCompleted ? handleUncompleteTask(task.id) : handleCompleteTask(task.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-primary animate-scale-in" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{getTaskTypeIcon(task.task_type)}</span>
                      <h4 className={`font-medium transition-colors ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getTaskTypeColor(task.task_type)}`}
                      >
                        {task.task_type}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className={`text-sm transition-colors ${isCompleted ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1 text-sm transition-colors ${
                    isCompleted ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    <Coins className="h-4 w-4" />
                    <span>{task.points_reward}</span>
                  </div>
                  
                  {isCompleted && (
                    <Badge variant="default" className="bg-primary text-primary-foreground pointer-events-none">
                      مكتملة ✓
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مهام يومية متاحة حالياً</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyTasksList;