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
  loading?: boolean;
}

const DailyTasksList = ({ 
  tasks, 
  completedTasks, 
  onCompleteTask, 
  loading = false 
}: DailyTasksListProps) => {
  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-blue-100 text-blue-800';
      case 'profile': return 'bg-green-100 text-green-800';
      case 'mining': return 'bg-orange-100 text-orange-800';
      case 'learning': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  isCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{getTaskTypeIcon(task.task_type)}</span>
                      <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : ''}`}>
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
                      <p className={`text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
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
                    <Badge variant="default" className="bg-green-600 text-white">
                      مكتملة
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
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