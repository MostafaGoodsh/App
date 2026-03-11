import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StreakDisplay from "@/components/engagement/StreakDisplay";
import QuranTab from "@/components/tasks/QuranTab";
import PersonalityTab from "@/components/tasks/PersonalityTab";
import DailyTasksTab from "@/components/tasks/DailyTasksTab";
import SectionIntroduction from "@/components/tasks/SectionIntroduction";
import WheelOfFortune from "@/components/tasks/WheelOfFortune";
import { useEngagementStats } from "@/hooks/useEngagementStats";
import { Target, Flame, Clock } from "lucide-react";

const DailyTasks = () => {
  const { stats, dailyTasks, completedTasks, completeTask, uncompleteTask, loading } = useEngagementStats();

  return (
    <>
      <Helmet>
        <title>المهام اليومية - منصة مصر الرقمية</title>
        <meta name="description" content="أكمل المهام اليومية واحصل على النقاط وقم ببناء سلسلة حضورك المتتالي" />
      </Helmet>
      
      <div 
        className="min-h-screen w-full max-w-[100vw] overflow-x-hidden"
        style={{
          backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background/90">
          <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8 arabic-content">
            {/* Hero Section */}
            <div className="text-center space-y-2 sm:space-y-4">
              <h1 className="font-playfair text-xl sm:text-2xl md:text-4xl font-bold arabic-text">
                المهام | Tasks
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto arabic-text">
                أكمل مهامك اليومية لتحصل على النقاط وتبني سلسلة حضورك المتتالي
              </p>
            </div>

            {/* General Introduction */}
            <SectionIntroduction sectionType="general" />

            {/* Stats Overview */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-center">
              <div className="flex items-center gap-1 sm:gap-2">
                <Flame className="h-4 w-4 text-orange-600 shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">السلسلة:</span>
                <span className="font-bold text-sm sm:text-base">{stats?.current_streak || 0}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Target className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">أطول سلسلة:</span>
                <span className="font-bold text-sm sm:text-base">{stats?.longest_streak || 0}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Clock className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">الجلسات:</span>
                <span className="font-bold text-sm sm:text-base">{stats?.total_sessions || 0}</span>
              </div>
            </div>

            {/* Tasks Tabs */}
            <Card className="w-full overflow-hidden">
              <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
                <CardTitle className="text-center arabic-text text-base sm:text-lg">مهامك اليومية</CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
                <Tabs defaultValue="quran" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-9 sm:h-10">
                    <TabsTrigger value="quran" className="arabic-text text-[11px] sm:text-sm px-1 sm:px-3">
                      📖 قرآن
                    </TabsTrigger>
                    <TabsTrigger value="personality" className="arabic-text text-[11px] sm:text-sm px-1 sm:px-3">
                      شخصية
                    </TabsTrigger>
                    <TabsTrigger value="daily" className="arabic-text text-[11px] sm:text-sm px-1 sm:px-3">
                      يومية
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

            {/* Wheel of Fortune - Below Tasks */}
            <WheelOfFortune />
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyTasks;