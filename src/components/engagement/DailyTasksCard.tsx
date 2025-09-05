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
    <article className="relative overflow-hidden rounded-xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer bg-card/30 backdrop-blur-sm">
      <img 
        src="/lovable-uploads/70f695e0-7133-47ea-82e8-7cca2196e7f4.png"
        alt="أهرامات مصر عند الغروب - خلفية المهام اليومية" 
        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-300" 
        loading="lazy" 
      />
      <div className="relative p-8 min-h-[280px] md:min-h-[320px] flex flex-col justify-end bg-gradient-to-t from-background/90 via-background/60 to-transparent">
        <h2 className="font-playfair text-2xl md:text-3xl mb-3 font-bold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          المهام | Tasks
        </h2>
        
        <div className="space-y-3 mb-4">
          {dailyTasks.slice(0, 3).map((task) => {
            const isCompleted = completedTaskIds.includes(task.id);
            
            return (
              <div 
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all backdrop-blur-sm ${
                  isCompleted 
                    ? 'bg-green-500/20 border-green-400/30 text-green-100' 
                    : 'bg-background/30 border-border/30 hover:bg-background/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getTaskTypeIcon(task.task_type)}</span>
                      <h4 className={`text-sm font-medium ${isCompleted ? 'line-through opacity-70' : ''}`}>
                        {task.title}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Coins className="h-3 w-3" />
                    <span>{task.points_reward}</span>
                  </div>
                  
                  {!isCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={loading}
                      className="text-xs bg-background/20 hover:bg-background/40 border-border/30"
                    >
                      إكمال
                    </Button>
                  )}
                  
                  {isCompleted && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-400/30">
                      ✓
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          
          {dailyTasks.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">لا توجد مهام يومية متاحة حالياً</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-primary to-primary/50 transition-all duration-300"></div>
      </div>
    </article>
  );
};

export default DailyTasksCard;