import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUICardSettings } from '@/hooks/useUICardSettings';

interface FollowStatsProps {
  userId: string;
}

export const FollowStats = ({ userId }: FollowStatsProps) => {
  const { followersCount, followingCount } = useFollow(userId);
  const { t } = useLanguage();
  const { getCardStyle, getTitleStyle, getCardSetting } = useUICardSettings();

  const setting = getCardSetting('profile_follow');
  const cardStyle = setting ? getCardStyle('profile_follow') : {};
  const titleStyle = setting ? getTitleStyle('profile_follow') : {};
  const hasCustomBg = setting?.background_image || setting?.background_gradient || setting?.background_color;

  return (
    <Card className={hasCustomBg ? "relative overflow-hidden" : ""} style={cardStyle}>
      {setting?.background_image && (
        <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${setting.overlay_opacity || 0.6})` }} />
      )}
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold" style={titleStyle}>{t("المتابعات")}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{followersCount}</p>
            <p className="text-sm text-muted-foreground">{t("متابع")}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{followingCount}</p>
            <p className="text-sm text-muted-foreground">{t("يتابع")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
