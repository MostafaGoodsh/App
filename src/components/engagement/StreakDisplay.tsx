import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, Trophy, Target } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  profileScore: number;
}

const StreakDisplay = ({ 
  currentStreak, 
  longestStreak, 
  totalSessions, 
  profileScore 
}: StreakDisplayProps) => {
  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: "ماسي", color: "bg-purple-500", icon: "🏆" };
    if (streak >= 14) return { level: "ذهبي", color: "bg-yellow-500", icon: "🥇" };
    if (streak >= 7) return { level: "فضي", color: "bg-gray-400", icon: "🥈" };
    if (streak >= 3) return { level: "برونزي", color: "bg-orange-600", icon: "🥉" };
    return { level: "مبتدئ", color: "bg-blue-500", icon: "⭐" };
  };

  const streakInfo = getStreakLevel(currentStreak);
  const longestStreakInfo = getStreakLevel(longestStreak);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Streak */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-800">
            الحضور المتتالي
          </CardTitle>
          <Flame className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="text-2xl font-bold text-orange-900">
              {currentStreak}
            </div>
            <span className="text-sm text-orange-700">يوم</span>
          </div>
          <div className="flex items-center mt-2">
            <Badge 
              variant="secondary" 
              className={`${streakInfo.color} text-white text-xs`}
            >
              <span className="mr-1">{streakInfo.icon}</span>
              {streakInfo.level}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Longest Streak */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">
            أطول سلسلة
          </CardTitle>
          <Trophy className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="text-2xl font-bold text-purple-900">
              {longestStreak}
            </div>
            <span className="text-sm text-purple-700">يوم</span>
          </div>
          <div className="flex items-center mt-2">
            <Badge 
              variant="secondary" 
              className={`${longestStreakInfo.color} text-white text-xs`}
            >
              <span className="mr-1">{longestStreakInfo.icon}</span>
              {longestStreakInfo.level}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Total Sessions */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">
            إجمالي الجلسات
          </CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="text-2xl font-bold text-blue-900">
              {totalSessions}
            </div>
            <span className="text-sm text-blue-700">جلسة</span>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            مجموع جلسات الدخول
          </p>
        </CardContent>
      </Card>

      {/* Profile Score */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">
            قوة الحساب
          </CardTitle>
          <Target className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="text-2xl font-bold text-green-900">
              {profileScore}
            </div>
            <span className="text-sm text-green-700">نقطة</span>
          </div>
          <p className="text-xs text-green-600 mt-2">
            نقاط اكتمال الملف الشخصي
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakDisplay;