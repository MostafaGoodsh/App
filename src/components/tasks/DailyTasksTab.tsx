import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Coins } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DailyTask {
  id: string;
  task_key: string;
  title: string;
  title_en?: string;
  description: string | null;
  description_en?: string | null;
  points_reward: number;
  task_type: string;
  is_active: boolean;
  display_order: number;
}

interface DailyTasksTabProps {
  tasks: DailyTask[];
  completedTasks: string[];
  onCompleteTask: (taskId: string) => Promise<boolean>;
  onUncompleteTask: (taskId: string) => Promise<boolean>;
  loading?: boolean;
}

const DailyTasksTab = ({ 
  tasks, 
  completedTasks, 
  onCompleteTask, 
  onUncompleteTask,
  loading = false 
}: DailyTasksTabProps) => {
  const { language, t, dir } = useLanguage();
  const isArabic = language === "ar" || language === "both";

  const handleCompleteTask = async (taskId: string) => {
    await onCompleteTask(taskId);
  };

  const handleUncompleteTask = async (taskId: string) => {
    await onUncompleteTask(taskId);
  };

  return (
    <div className="space-y-3" dir={dir}>
      {tasks.map((task) => {
        const isCompleted = completedTasks.includes(task.id);
        const rawTitle = (!isArabic && (task as any).title_en) ? (task as any).title_en : task.title;
        const rawDesc = (!isArabic && (task as any).description_en) ? (task as any).description_en : task.description;
        const displayTitle = isArabic ? rawTitle : t(rawTitle);
        const displayDesc = isArabic ? rawDesc : (rawDesc ? t(rawDesc) : null);
        
        return (
          <div 
            key={task.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-background border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
            onClick={() => isCompleted ? handleUncompleteTask(task.id) : handleCompleteTask(task.id)}
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
          <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t("لا توجد مهام يومية متاحة حالياً")}</p>
        </div>
      )}
    </div>
  );
};

export default DailyTasksTab;
