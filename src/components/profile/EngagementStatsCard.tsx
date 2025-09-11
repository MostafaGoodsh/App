import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Flame, Trophy, Calendar, Target, Activity } from "lucide-react";
import { useEngagementStats } from "@/hooks/useEngagementStats";

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
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-bold text-orange-800 arabic-text">
          إحصائيات التفاعل
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={updateEngagementStats}
          disabled={loading}
          className="arabic-text border-orange-300 hover:bg-orange-100"
        >
          <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4 border border-orange-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-600" />
              <h3 className="font-medium text-orange-800 arabic-text">الحضور المتتالي</h3>
            </div>
            <Badge className={`${currentStreakInfo.color} text-white text-xs`}>
              <span className="ml-1">{currentStreakInfo.icon}</span>
              {currentStreakInfo.level}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-900">
              {stats ? formatNumber(stats.current_streak) : '0'}
            </span>
            <span className="text-sm text-orange-700 arabic-text">يوم متتالي</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Longest Streak */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-medium text-purple-800 arabic-text">أطول سلسلة</h4>
            </div>
            <div className="text-lg font-bold text-purple-900">
              {stats ? formatNumber(stats.longest_streak) : '0'}
            </div>
            <Badge className={`${longestStreakInfo.color} text-white text-xs mt-1`}>
              <span className="ml-1">{longestStreakInfo.icon}</span>
              {longestStreakInfo.level}
            </Badge>
          </div>

          {/* Total Sessions */}
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-medium text-blue-800 arabic-text">الجلسات</h4>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {stats ? formatNumber(stats.total_sessions) : '0'}
            </div>
            <p className="text-xs text-blue-600 arabic-text">إجمالي الجلسات</p>
          </div>

          {/* Daily Logins */}
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-600" />
              <h4 className="text-sm font-medium text-green-800 arabic-text">تسجيلات اليوم</h4>
            </div>
            <div className="text-lg font-bold text-green-900">
              {stats ? formatNumber(stats.daily_logins) : '0'}
            </div>
            <p className="text-xs text-green-600 arabic-text">تسجيل دخول اليوم</p>
          </div>
        </div>

        {/* Last Login Info */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 arabic-text">آخر تسجيل دخول:</span>
            <span className="text-sm font-medium text-gray-800 arabic-text">
              {stats?.last_login_date 
                ? new Date(stats.last_login_date).toLocaleDateString('ar-SA')
                : 'غير محدد'
              }
            </span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground arabic-text text-center">
          يتم تحديث الإحصائيات تلقائياً كل 5 دقائق
        </div>
      </CardContent>
    </Card>
  );
}