import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Coins, Clock } from "lucide-react";
import { useEngagementStats } from "@/hooks/useEngagementStats";

const DailyTasksCard = () => {
  const { dailyTasks, completedTasks, completeTask, loading } = useEngagementStats();

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
    await completeTask(taskId);
  };

  const completedTaskIds = completedTasks.map(ct => ct.task_id);

  return (
    <Card className="relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('/lovable-uploads/70f695e0-7133-47ea-82e8-7cca2196e7f4.png')`
        }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/60" />
      
      {/* Content */}
      <div className="relative z-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-foreground">
            <Clock className="h-5 w-5" />
            المهام اليومية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyTasks.slice(0, 4).map((task) => {
              const isCompleted = completedTaskIds.includes(task.id);
              
              return (
                <div 
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-lg border backdrop-blur-sm transition-all ${
                    isCompleted 
                      ? 'bg-green-500/20 border-green-400/30 text-green-100' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-300" />
                    ) : (
                      <Circle className="h-4 w-4 text-white/60" />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{getTaskTypeIcon(task.task_type)}</span>
                        <h4 className={`text-sm font-medium ${isCompleted ? 'line-through opacity-70' : ''}`}>
                          {task.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-orange-300">
                      <Coins className="h-3 w-3" />
                      <span>{task.points_reward}</span>
                    </div>
                    
                    {!isCompleted && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={loading}
                        className="text-xs bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        إكمال
                      </Button>
                    )}
                    
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-green-500/30 text-green-200 border-green-400/30">
                        ✓
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
            
            {dailyTasks.length === 0 && (
              <div className="text-center py-6 text-white/70">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">لا توجد مهام يومية متاحة حالياً</p>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default DailyTasksCard;