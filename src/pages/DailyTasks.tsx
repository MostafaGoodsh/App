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
        <title>المهام اليومية | Daily Tasks - منصة مصر الرقمية</title>
        <meta name="description" content="أكمل المهام اليومية واحصل على النقاط وقم ببناء سلسلة حضورك المتتالي | Complete daily tasks, earn points and build your streak" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="mixed-text-xl font-playfair text-4xl md:text-5xl font-bold">
            المهام اليومية | Daily Tasks
          </h1>
          <p className="mixed-text text-lg text-muted-foreground max-w-2xl mx-auto">
            أكمل مهامك اليومية لتحصل على النقاط وتبني سلسلة حضورك المتتالي | Complete your daily tasks to earn points and build your streak
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mixed-text text-sm font-medium">السلسلة الحالية | Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.current_streak || 0}</div>
              <p className="mixed-text text-xs text-muted-foreground">يوم متتالي | consecutive days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mixed-text text-sm font-medium">أطول سلسلة | Longest Streak</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.longest_streak || 0}</div>
              <p className="mixed-text text-xs text-muted-foreground">يوم | days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="mixed-text text-sm font-medium">إجمالي الجلسات | Total Sessions</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_sessions || 0}</div>
              <p className="mixed-text text-xs text-muted-foreground">جلسة | sessions</p>
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
    </>
  );
};

export default DailyTasks;