import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowUpCircle, Info, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { useLiquidityPool } from '@/hooks/useLiquidityPool';

type PoolHook = ReturnType<typeof useLiquidityPool>;

export const RemoveLiquidityTab = ({ pool }: { pool: PoolHook }) => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ap = pool.activePool;
  if (!ap) return null;

  const activePositions = pool.positions.filter(p => p.status === 'active');
  const selectedPosition = activePositions.find(p => p.id === selectedPositionId) || activePositions[0];
  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * ap.fee_percentage / 100;
  const netAmount = numAmount - fee;

  const isLocked = selectedPosition?.is_staked && selectedPosition?.stake_unlock_at && new Date(selectedPosition.stake_unlock_at) > new Date();

  const handleSubmit = async () => {
    if (!selectedPosition || numAmount <= 0) return;
    setSubmitting(true);
    await pool.removeLiquidity(selectedPosition.id, numAmount);
    setSubmitting(false);
    setAmount('');
  };

  if (activePositions.length === 0) {
    return (
      <Card className="bg-card/80 border-primary/20">
        <CardContent className="p-8 text-center">
          <ArrowUpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-cairo text-sm text-muted-foreground">{t('لا توجد مراكز نشطة للسحب', 'No active positions to withdraw')}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">{t('أضف سيولة أولاً', 'Add liquidity first')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activePositions.length > 1 && (
        <div className="space-y-2">
          <Label className="font-cairo text-xs">{t('اختر المركز', 'Select Position')}</Label>
          {activePositions.map(pos => (
            <Card key={pos.id} onClick={() => setSelectedPositionId(pos.id)}
              className={`cursor-pointer transition-all ${(selectedPositionId || activePositions[0]?.id) === pos.id ? 'border-primary bg-primary/10' : 'border-border/50'}`}>
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold">${pos.deposited_amount.toFixed(2)}</p>
                  <p className="text-[9px] text-muted-foreground">{pos.lp_tokens.toFixed(2)} LP</p>
                </div>
                <div className="flex items-center gap-2">
                  {pos.is_staked && <Badge variant="secondary" className="text-[9px]"><Lock className="w-2.5 h-2.5 mr-1" />{t('مقفل', 'Locked')}</Badge>}
                  <Badge variant="outline" className="text-[9px]">${pos.earned_rewards.toFixed(2)} {t('ربح', 'profit')}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4 text-red-400" />
            <span className="font-cairo">{t('سحب سيولة', 'Remove Liquidity')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLocked && (
            <Alert variant="destructive">
              <Lock className="w-4 h-4" />
              <AlertDescription className="text-xs font-cairo">
                {t('هذا المركز مقفل حتى', 'This position is locked until')} {new Date(selectedPosition!.stake_unlock_at!).toLocaleDateString('ar')}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="font-cairo text-xs">{t('المبلغ', 'Amount')}</Label>
              <Button variant="ghost" size="sm" className="text-[10px] h-5 text-primary"
                onClick={() => selectedPosition && setAmount(selectedPosition.deposited_amount.toString())}>
                {t('الكل', 'All')}
              </Button>
            </div>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              max={selectedPosition?.deposited_amount} placeholder="0.00" className="text-lg font-bold" dir="ltr" disabled={!!isLocked} />
            {selectedPosition && (
              <p className="text-[9px] text-muted-foreground mt-1">{t('المتاح', 'Available')}: ${selectedPosition.deposited_amount.toFixed(2)}</p>
            )}
          </div>

          <div className="flex gap-2">
            {[25, 50, 75, 100].map(pct => (
              <Button key={pct} size="sm" variant="outline" className="flex-1 text-[10px] h-7" disabled={!!isLocked}
                onClick={() => selectedPosition && setAmount((selectedPosition.deposited_amount * pct / 100).toString())}>
                {pct}%
              </Button>
            ))}
          </div>

          {numAmount > 0 && (
            <Alert className="border-primary/30 bg-primary/5">
              <Info className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-1 text-xs font-cairo">
                  <div className="flex justify-between">
                    <span>{t('رسوم السحب', 'Withdrawal Fees')} ({ap.fee_percentage}%)</span>
                    <span className="text-red-400">-{fee.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-border/30 pt-1 mt-1">
                    <span>{t('ستحصل على', "You'll receive")}</span>
                    <span className="text-primary">{netAmount.toFixed(4)}</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSubmit} disabled={numAmount <= 0 || !!isLocked || submitting}
            variant="destructive" className="w-full font-cairo">
            {submitting ? t('جاري السحب...', 'Withdrawing...') : t('سحب سيولة', 'Remove Liquidity')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
