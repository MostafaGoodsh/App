import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, Unlock, TrendingUp, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { useLiquidityPool } from '@/hooks/useLiquidityPool';

type PoolHook = ReturnType<typeof useLiquidityPool>;

export const StakingTab = ({ pool }: { pool: PoolHook }) => {
  const { t } = useLanguage();
  const ap = pool.activePool;
  if (!ap) return null;

  const stakedPositions = pool.positions.filter(p => p.is_staked && p.status === 'active');

  return (
    <div className="space-y-4">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span className="font-cairo">{t('خطط الـ Staking', 'Staking Plans')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pool.stakingPlans.map(plan => (
            <div key={plan.id} className="p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {plan.duration_days === 0 ? <Unlock className="w-4 h-4 text-green-400" /> : <Lock className="w-4 h-4 text-primary" />}
                  <span className="text-sm font-bold font-cairo">{plan.name}</span>
                </div>
                <Badge className="bg-green-600/20 text-green-400 text-[10px]">
                  {ap.apy_percentage + plan.apy_bonus}% APY
                </Badge>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {plan.duration_days === 0 ? t('بدون قفل', 'No Lock') : `${plan.duration_days} ${t('يوم', 'days')}`}
                </span>
                <span>{t('الحد الأدنى', 'Minimum')}: {plan.min_amount}</span>
              </div>
              {plan.apy_bonus > 0 && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-primary">
                  <TrendingUp className="w-3 h-3" />
                  +{plan.apy_bonus}% {t('مكافأة إضافية', 'Bonus')}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {stakedPositions.length > 0 && (
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="font-cairo">{t('مراكزك المقفلة', 'Your Staked Positions')}</span>
              <Badge variant="secondary" className="text-[9px]">{stakedPositions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stakedPositions.map(pos => {
              const plan = pool.stakingPlans.find(p => p.id === pos.staking_plan_id);
              const unlockDate = pos.stake_unlock_at ? new Date(pos.stake_unlock_at) : null;
              const stakedDate = pos.staked_at ? new Date(pos.staked_at) : null;
              const now = new Date();
              let progress = 100;
              if (unlockDate && stakedDate) {
                const total = unlockDate.getTime() - stakedDate.getTime();
                const elapsed = now.getTime() - stakedDate.getTime();
                progress = Math.min(100, (elapsed / total) * 100);
              }
              const isUnlocked = !unlockDate || unlockDate <= now;

              return (
                <div key={pos.id} className="p-3 rounded-lg border border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">${pos.deposited_amount.toFixed(2)}</span>
                    <Badge variant={isUnlocked ? 'default' : 'secondary'} className="text-[9px]">
                      {isUnlocked ? t('جاهز للفك', 'Ready to Unlock') : plan?.name || t('مقفل', 'Locked')}
                    </Badge>
                  </div>
                  {!isUnlocked && (
                    <>
                      <Progress value={progress} className="h-1.5 mb-1" />
                      <p className="text-[9px] text-muted-foreground">
                        {t('ينتهي', 'Ends')}: {unlockDate?.toLocaleDateString('ar')}
                      </p>
                    </>
                  )}
                  <div className="flex justify-between mt-1 text-[10px]">
                    <span className="text-muted-foreground">{t('الأرباح', 'Earnings')}:</span>
                    <span className="text-green-400 font-bold">${pos.earned_rewards.toFixed(4)}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {stakedPositions.length === 0 && (
        <Card className="bg-card/80 border-primary/20">
          <CardContent className="p-8 text-center">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-cairo text-sm text-muted-foreground">{t('لا توجد مراكز مقفلة', 'No staked positions')}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">{t('اختر خطة Staking عند إضافة السيولة', 'Choose a Staking plan when adding liquidity')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
