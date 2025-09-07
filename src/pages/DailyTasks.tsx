import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StreakDisplay from "@/components/engagement/StreakDisplay";
import MediaContentTab from "@/components/tasks/MediaContentTab";
import PersonalityTab from "@/components/tasks/PersonalityTab";
import DailyTasksTab from "@/components/tasks/DailyTasksTab";
import SectionIntroduction from "@/components/tasks/SectionIntroduction";
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
        className="min-h-screen"
        style={{
          backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="min-h-screen bg-background/90">
          <div className="container mx-auto px-4 py-8 space-y-8 arabic-content">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="font-playfair text-2xl md:text-4xl font-bold arabic-text">
            المهام | Tasks
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto arabic-text">
            أكمل مهامك اليومية لتحصل على النقاط وتبني سلسلة حضورك المتتالي
          </p>
        </div>

        {/* General Introduction */}
        <div className="max-w-4xl mx-auto">
          <SectionIntroduction sectionType="general" />
        </div>

        {/* Stats Overview */}
        <div className="flex justify-center gap-6 text-center mb-6">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-muted-foreground">السلسلة:</span>
            <span className="font-bold">{stats?.current_streak || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">أطول سلسلة:</span>
            <span className="font-bold">{stats?.longest_streak || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">الجلسات:</span>
            <span className="font-bold">{stats?.total_sessions || 0}</span>
          </div>
        </div>

        {/* Tasks Tabs */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center arabic-text">مهامك اليومية</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="media" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="media" className="arabic-text text-xs sm:text-sm">
                  وسائط
                </TabsTrigger>
                <TabsTrigger value="personality" className="arabic-text text-xs sm:text-sm">
                  شخصية
                </TabsTrigger>
                <TabsTrigger value="daily" className="arabic-text text-xs sm:text-sm">
                  يومية
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="media" className="space-y-4">
                <SectionIntroduction sectionType="media_content" />
                <MediaContentTab />
              </TabsContent>
              
              <TabsContent value="personality" className="space-y-4">
                <SectionIntroduction sectionType="personality_tasks" />
                <PersonalityTab />
              </TabsContent>
              
              <TabsContent value="daily" className="space-y-4">
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