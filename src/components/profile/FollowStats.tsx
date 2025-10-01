import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';

interface FollowStatsProps {
  userId: string;
}

export const FollowStats = ({ userId }: FollowStatsProps) => {
  const { followersCount, followingCount } = useFollow(userId);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold arabic-text">المتابعات</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{followersCount}</p>
            <p className="text-sm text-muted-foreground arabic-text">متابع</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{followingCount}</p>
            <p className="text-sm text-muted-foreground arabic-text">يتابع</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};