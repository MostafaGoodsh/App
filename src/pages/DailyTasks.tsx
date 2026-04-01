import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StreakDisplay from "@/components/engagement/StreakDisplay";
import QuranTab from "@/components/tasks/QuranTab";
import PersonalityTab from "@/components/tasks/PersonalityTab";
import DailyTasksTab from "@/components/tasks/DailyTasksTab";
import SectionIntroduction from "@/components/tasks/SectionIntroduction";

import { useEngagementStats } from "@/hooks/useEngagementStats";
import { useUICardSettings } from "@/hooks/useUICardSettings";
import { Target, Flame, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const DailyTasks = () => {
  const { stats, dailyTasks, completedTasks, completeTask, uncompleteTask, loading } = useEngagementStats();
  const { t, dir } = useLanguage();
  const { getCardStyle, getTitleStyle, getCardSetting } = useUICardSettings();
  const taskCardSetting = getCardSetting('tasks_daily_card');
  const hasCustomTaskCard = taskCardSetting?.background_image || taskCardSetting?.background_gradient || taskCardSetting?.background_color;
  const taskCardStyle = hasCustomTaskCard ? getCardStyle('tasks_daily_card') : {};
  const taskTitleStyle = hasCustomTaskCard ? getTitleStyle('tasks_daily_card') : {};

  return (
    <>
      <Helmet>
        <title>{t("المهام اليومية")} - Crypto-MSR</title>
        <meta name="description" content={t("أكمل مهامك اليومية لتحصل على النقاط وتبني سلسلة حضورك المتتالي")} />
      </Helmet>
      
      <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden"
        style={{ backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background/90">
          <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8 arabic-content" dir={dir}>
            <div className="space-y-2 sm:space-y-4" style={{ textAlign: dir === "rtl" ? "right" : "left" }}>
              <h1 className="font-playfair text-xl sm:text-2xl md:text-4xl font-bold">
                {t("المهام | Tasks")}
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl">
                {t("أكمل مهامك اليومية لتحصل على النقاط وتبني سلسلة حضورك المتتالي")}
              </p>
            </div>

            <SectionIntroduction sectionType="general" />

            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-center">
              <div className="flex items-center gap-1 sm:gap-2">
                <Flame className="h-4 w-4 text-orange-600 shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">{t("السلسلة:")}</span>
                <span className="font-bold text-sm sm:text-base">{stats?.current_streak || 0}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Target className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">{t("أطول سلسلة:")}</span>
                <span className="font-bold text-sm sm:text-base">{stats?.longest_streak || 0}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Clock className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">{t("الجلسات:")}</span>
                <span className="font-bold text-sm sm:text-base">{stats?.total_sessions || 0}</span>
              </div>
            </div>

            <Card className={`w-full overflow-hidden ${hasCustomTaskCard ? 'relative' : ''}`} style={taskCardStyle}>
              {taskCardSetting?.background_image && (
                <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${taskCardSetting.overlay_opacity || 0.6})` }} />
              )}
              <CardHeader className="px-3 sm:px-6 py-3 sm:py-6 relative z-10">
                <CardTitle className="text-center arabic-text text-base sm:text-lg" style={taskTitleStyle}>{t("مهامك اليومية")}</CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6 relative z-10">
                <Tabs defaultValue="daily" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-9 sm:h-10">
                    <TabsTrigger value="quran" className="arabic-text text-[11px] sm:text-sm px-1 sm:px-3">
                      📖 {t("قرآن")}
                    </TabsTrigger>
                    <TabsTrigger value="personality" className="arabic-text text-[11px] sm:text-sm px-1 sm:px-3">
                      {t("شخصية")}
                    </TabsTrigger>
                    <TabsTrigger value="daily" className="arabic-text text-[11px] sm:text-sm px-1 sm:px-3">
                      {t("يومية")}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="quran" className="space-y-3 sm:space-y-4">
                    <SectionIntroduction sectionType="quran_reading" />
                    <QuranTab />
                  </TabsContent>
                  
                  <TabsContent value="personality" className="space-y-3 sm:space-y-4">
                    <SectionIntroduction sectionType="personality_tasks" />
                    <PersonalityTab />
                  </TabsContent>
                  
                  <TabsContent value="daily" className="space-y-3 sm:space-y-4">
                    <SectionIntroduction sectionType="daily_tasks" />
                    <DailyTasksTab 
                      tasks={dailyTasks}
                      completedTasks={completedTasks.map(ct => ct.task_id)}
                      onCompleteTask={completeTask}
                      onUncompleteTask={uncompleteTask}
                      loading={loading}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyTasks;
