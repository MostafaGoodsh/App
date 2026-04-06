import { useEffect } from 'react';
import { StyledCard, StyledCardTitle, CardContent, CardHeader } from "@/components/ui/styled-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Flame, Trophy, Calendar, Target, Activity } from "lucide-react";
import { useEngagementStats } from "@/hooks/useEngagementStats";

const CARD_KEY = "profile_engagement";

export function EngagementStatsCard() {
  const { stats, updateEngagementStats, loading } = useEngagementStats();

  // Auto-refresh stats every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      updateEngagementStats();
    }, 300000);

    return () => clearInterval(interval);
  }, [updateEngagementStats]);

  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: "ماسي", color: "bg-purple-500", icon: "🏆" };
    if (streak >= 14) return { level: "ذهبي", color: "bg-yellow-500", icon: "🥇" };
    if (streak >= 7) return { level: "فضي", color: "bg-gray-400", icon: "🥈" };
    if (streak >= 3) return { level: "برونزي", color: "bg-orange-600", icon: "🥉" };
    return { level: "مبتدئ", color: "bg-blue-500", icon: "⭐" };
  };

  const currentStreakInfo = getStreakLevel(stats?.current_streak || 0);
  const longestStreakInfo = getStreakLevel(stats?.longest_streak || 0);

  const formatNumber = (num: number) => {
    return num.toLocaleString('ar-SA');
  };

  return (
    <StyledCard cardKey={CARD_KEY} className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <StyledCardTitle cardKey={CARD_KEY} className="text-lg font-bold arabic-text">
          إحصائيات التفاعل
        </StyledCardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={updateEngagementStats}
          disabled={loading}
          className="arabic-text border-gray-600 hover:bg-gray-800 text-white"
        >
          <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Streak */}
        <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
          <div className="flex items-center justify-end gap-2 mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white arabic-text">الحضور المتتالي</h3>
              <Flame className="w-4 h-4 text-gray-300" />
            </div>
            <Badge className={`${currentStreakInfo.color} text-white text-xs`}>
              <span className="ml-1">{currentStreakInfo.icon}</span>
              {currentStreakInfo.level}
            </Badge>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-gray-400 arabic-text">يوم متتالي</span>
            <span className="text-lg font-bold text-white">
              {stats ? formatNumber(stats.current_streak) : '0'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Longest Streak */}
          <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
            <div className="flex items-center justify-end gap-2 mb-1">
              <h4 className="text-sm font-medium text-white arabic-text">أطول سلسلة</h4>
              <Trophy className="w-4 h-4 text-gray-300" />
            </div>
            <div className="text-lg font-bold text-white text-right">
              {stats ? formatNumber(stats.longest_streak) : '0'}
            </div>
            <Badge className={`${longestStreakInfo.color} text-white text-xs mt-1`}>
              <span className="ml-1">{longestStreakInfo.icon}</span>
              {longestStreakInfo.level}
            </Badge>
          </div>

          {/* Total Sessions */}
          <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
            <div className="flex items-center justify-end gap-2 mb-1">
              <h4 className="text-sm font-medium text-white arabic-text">الجلسات</h4>
              <Calendar className="w-4 h-4 text-gray-300" />
            </div>
            <div className="text-lg font-bold text-white text-right">
              {stats ? formatNumber(stats.total_sessions) : '0'}
            </div>
            <p className="text-xs text-gray-400 arabic-text text-right">إجمالي الجلسات</p>
          </div>

          {/* Daily Logins */}
          <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
            <div className="flex items-center justify-end gap-2 mb-1">
              <h4 className="text-sm font-medium text-white arabic-text">تسجيلات اليوم</h4>
              <Activity className="w-4 h-4 text-gray-300" />
            </div>
            <div className="text-lg font-bold text-white text-right">
              {stats ? formatNumber(stats.daily_logins) : '0'}
            </div>
            <p className="text-xs text-gray-400 arabic-text text-right">تسجيل دخول اليوم</p>
          </div>
        </div>

        {/* Last Login Info */}
        <div className="bg-gray-800 rounded-md p-3 border border-gray-700">
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm font-medium text-white arabic-text">
              {stats?.last_login_date 
                ? new Date(stats.last_login_date).toLocaleDateString('ar-SA')
                : 'غير محدد'
              }
            </span>
            <span className="text-sm text-gray-400 arabic-text">آخر تسجيل دخول:</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground arabic-text text-center">
          يتم تحديث الإحصائيات تلقائياً كل 5 دقائق
        </div>
      </CardContent>
    </StyledCard>
  );
}