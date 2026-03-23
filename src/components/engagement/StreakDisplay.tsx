import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, Trophy, Target } from "lucide-react";
import { useUICardSettings } from "@/hooks/useUICardSettings";

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
  const { getCardStyle, getTitleStyle, getCardSetting } = useUICardSettings();

  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: "ماسي", color: "bg-purple-500", icon: "🏆" };
    if (streak >= 14) return { level: "ذهبي", color: "bg-yellow-500", icon: "🥇" };
    if (streak >= 7) return { level: "فضي", color: "bg-gray-400", icon: "🥈" };
    if (streak >= 3) return { level: "برونزي", color: "bg-orange-600", icon: "🥉" };
    return { level: "مبتدئ", color: "bg-blue-500", icon: "⭐" };
  };

  const streakInfo = getStreakLevel(currentStreak);
  const longestStreakInfo = getStreakLevel(longestStreak);

  const cards = [
    { key: "streak_current", title: "الحضور المتتالي", value: currentStreak, unit: "يوم", icon: Flame, badge: streakInfo, defaultBg: "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200", defaultTextColor: "text-orange-800", defaultValueColor: "text-orange-900", defaultUnitColor: "text-orange-700" },
    { key: "streak_longest", title: "أطول سلسلة", value: longestStreak, unit: "يوم", icon: Trophy, badge: longestStreakInfo, defaultBg: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200", defaultTextColor: "text-purple-800", defaultValueColor: "text-purple-900", defaultUnitColor: "text-purple-700" },
    { key: "streak_sessions", title: "إجمالي الجلسات", value: totalSessions, unit: "جلسة", icon: Calendar, badge: null, defaultBg: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200", defaultTextColor: "text-blue-800", defaultValueColor: "text-blue-900", defaultUnitColor: "text-blue-700", extra: "مجموع جلسات الدخول", extraColor: "text-blue-600" },
    { key: "streak_score", title: "قوة الحساب", value: profileScore, unit: "نقطة", icon: Target, badge: null, defaultBg: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200", defaultTextColor: "text-green-800", defaultValueColor: "text-green-900", defaultUnitColor: "text-green-700", extra: "نقاط اكتمال الملف الشخصي", extraColor: "text-green-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const setting = getCardSetting(card.key);
        const hasCustom = setting?.background_image || setting?.background_gradient || setting?.background_color;
        const cardStyle = hasCustom ? getCardStyle(card.key) : {};
        const titleStyle = hasCustom ? getTitleStyle(card.key) : {};
        const Icon = card.icon;

        return (
          <Card key={card.key} className={hasCustom ? "relative overflow-hidden" : card.defaultBg} style={cardStyle}>
            {setting?.background_image && (
              <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${setting.overlay_opacity || 0.6})` }} />
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className={hasCustom ? "text-sm font-medium" : `text-sm font-medium ${card.defaultTextColor}`} style={titleStyle}>
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${hasCustom ? "" : card.defaultTextColor}`} style={hasCustom && setting?.text_color ? { color: setting.text_color } : {}} />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className={hasCustom ? "text-2xl font-bold" : `text-2xl font-bold ${card.defaultValueColor}`} style={hasCustom && setting?.title_color ? { color: setting.title_color } : {}}>
                  {card.value}
                </div>
                <span className={hasCustom ? "text-sm" : `text-sm ${card.defaultUnitColor}`} style={hasCustom && setting?.text_color ? { color: setting.text_color } : {}}>
                  {card.unit}
                </span>
              </div>
              {card.badge && (
                <div className="flex items-center mt-2">
                  <Badge variant="secondary" className={`${card.badge.color} text-white text-xs`}>
                    <span className="mr-1">{card.badge.icon}</span>
                    {card.badge.level}
                  </Badge>
                </div>
              )}
              {card.extra && (
                <p className={hasCustom ? "text-xs mt-2" : `text-xs ${card.extraColor} mt-2`} style={hasCustom && setting?.text_color ? { color: setting.text_color } : {}}>
                  {card.extra}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StreakDisplay;
