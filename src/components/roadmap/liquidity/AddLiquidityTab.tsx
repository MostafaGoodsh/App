import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowDownCircle, Info, Lock, Zap, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { useLiquidityPool } from '@/hooks/useLiquidityPool';

type PoolHook = ReturnType<typeof useLiquidityPool>;

export const AddLiquidityTab = ({ pool }: { pool: PoolHook }) => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [autoCompound, setAutoCompound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const ap = pool.activePool;
  if (!ap) return null;

  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * ap.fee_percentage / 100;
  const lpTokens = numAmount - fee;
  const priceImpact = numAmount > 10000 ? ((numAmount / (ap.total_value_locked + numAmount)) * 100) : 0.01;
  const selectedStakingPlan = pool.stakingPlans.find(p => p.id === selectedPlan);
  const effectiveApy = ap.apy_percentage + (selectedStakingPlan?.apy_bonus || 0);

  const handleSubmit = async () => {
    if (numAmount <= 0 || numAmount < ap.min_deposit) return;
    setSubmitting(true);
    await pool.addLiquidity(numAmount, selectedPlan || undefined);
    setSubmitting(false);
    setAmount('');
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowDownCircle className="w-4 h-4 text-green-400" />
            <span className="font-cairo">{t('إضافة سيولة', 'Add Liquidity')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="font-cairo text-xs">{t('المبلغ', 'Amount')}</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder={`${t('الحد الأدنى', 'Minimum')}: ${ap.min_deposit}`} className="text-lg font-bold mt-1" dir="ltr" />
            {ap.max_deposit && (
              <p className="text-[9px] text-muted-foreground mt-1">{t('الحد الأقصى', 'Maximum')}: {ap.max_deposit}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-cairo text-xs flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Slippage Tolerance
              </Label>
              <Badge variant="outline" className="text-[10px]">{slippage}%</Badge>
            </div>
            <div className="flex gap-2">
              {[0.1, 0.5, 1.0, 3.0].map(v => (
                <Button key={v} size="sm" variant={slippage === v ? 'default' : 'outline'}
                  onClick={() => setSlippage(v)} className="flex-1 text-[10px] h-7">{v}%</Button>
              ))}
            </div>
          </div>

          {pool.stakingPlans.length > 0 && (
            <div>
              <Label className="font-cairo text-xs flex items-center gap-1 mb-2">
                <Lock className="w-3 h-3" /> {t('خطة القفل', 'Staking Plan')}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {pool.stakingPlans.map(plan => (
                  <Button key={plan.id} variant={selectedPlan === plan.id ? 'default' : 'outline'}
                    onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
                    className="h-auto py-2 flex flex-col text-[10px]">
                    <span className="font-bold font-cairo">{plan.name}</span>
                    <span className="text-green-400">+{plan.apy_bonus}% APY</span>
                    {plan.duration_days > 0 && <span className="opacity-70">{plan.duration_days} {t('يوم', 'days')}</span>}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs font-bold font-cairo">Auto-Compound</p>
                <p className="text-[9px] text-muted-foreground">{t('إعادة استثمار الأرباح تلقائياً', 'Auto-reinvest earnings')}</p>
              </div>
            </div>
            <Switch checked={autoCompound} onCheckedChange={setAutoCompound} />
          </div>

          {numAmount > 0 && (
            <Alert className="border-primary/30 bg-primary/5">
              <Info className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-1 text-xs font-cairo">
                  <div className="flex justify-between">
                    <span>{t('الرسوم', 'Fees')} ({ap.fee_percentage}%)</span>
                    <span className="text-red-400">-{fee.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LP Tokens</span>
                    <span className="text-green-400">{lpTokens.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price Impact</span>
                    <span className={priceImpact > 1 ? 'text-red-400' : 'text-green-400'}>{priceImpact.toFixed(4)}%</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-border/30 pt-1 mt-1">
                    <span>{t('العائد السنوي المتوقع', 'Expected Annual Yield')}</span>
                    <span className="text-primary">{effectiveApy.toFixed(1)}% APY</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {priceImpact > 3 && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-xs font-cairo">
                {t('تحذير: Price Impact مرتفع', 'Warning: High Price Impact')} ({priceImpact.toFixed(2)}%)
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSubmit} disabled={numAmount <= 0 || numAmount < ap.min_deposit || submitting}
            className="w-full bg-green-600 hover:bg-green-700 font-cairo">
            {submitting ? t('جاري الإضافة...', 'Adding...') : t('إضافة سيولة', 'Add Liquidity')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
