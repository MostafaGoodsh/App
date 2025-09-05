import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DailyTasksList from "@/components/engagement/DailyTasksList";
import StreakDisplay from "@/components/engagement/StreakDisplay";
import { useEngagementStats } from "@/hooks/useEngagementStats";
import { Clock, Target, Flame } from "lucide-react";

const DailyTasks = () => {
  const { stats, dailyTasks, completedTasks, completeTask, loading } = useEngagementStats();

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
          <h1 className="font-playfair text-4xl md:text-5xl font-bold arabic-text">
            المهام اليومية
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto arabic-text">
            أكمل مهامك اليومية لتحصل على النقاط وتبني سلسلة حضورك المتتالي
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
          <Card className="bg-black/90 border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-white arabic-text">السلسلة الحالية</CardTitle>
              <Flame className="h-3 w-3 text-orange-600" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-xl font-bold text-white">{stats?.current_streak || 0}</div>
              <p className="text-xs text-white/70 arabic-text">يوم متتالي</p>
            </CardContent>
          </Card>

          <Card className="bg-black/90 border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-white arabic-text">أطول سلسلة</CardTitle>
              <Target className="h-3 w-3 text-primary" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-xl font-bold text-white">{stats?.longest_streak || 0}</div>
              <p className="text-xs text-white/70 arabic-text">يوم</p>
            </CardContent>
          </Card>

          <Card className="bg-black/90 border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-white arabic-text">إجمالي الجلسات</CardTitle>
              <Clock className="h-3 w-3 text-green-600" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-xl font-bold text-white">{stats?.total_sessions || 0}</div>
              <p className="text-xs text-white/70 arabic-text">جلسة</p>
            </CardContent>
          </Card>
        </div>

        {/* Streak Display */}
        <StreakDisplay 
          currentStreak={stats?.current_streak || 0}
          longestStreak={stats?.longest_streak || 0}
          totalSessions={stats?.total_sessions || 0}
          profileScore={stats?.profile_completion_score || 0}
        />

        {/* Daily Tasks List */}
        <DailyTasksList 
          tasks={dailyTasks}
          completedTasks={completedTasks.map(ct => ct.task_id)}
          onCompleteTask={completeTask}
          loading={loading}
        />
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyTasks;