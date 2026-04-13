import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, ArrowDownCircle, ArrowUpCircle, Lock, Unlock, Zap, Heart, Settings2, Gamepad2, ShoppingCart, Coins, Pickaxe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { useLiquidityPool } from '@/hooks/useLiquidityPool';

type PoolHook = ReturnType<typeof useLiquidityPool>;

const getTxTypeConfig = (t: (ar: string, en?: string) => string) => ({
  deposit: { icon: ArrowDownCircle, label: t('إيداع', 'Deposit'), color: 'text-green-400' },
  withdraw: { icon: ArrowUpCircle, label: t('سحب', 'Withdraw'), color: 'text-red-400' },
  stake: { icon: Lock, label: t('قفل', 'Stake'), color: 'text-primary' },
  unstake: { icon: Unlock, label: t('فك قفل', 'Unstake'), color: 'text-blue-400' },
  reward: { icon: Zap, label: t('مكافأة', 'Reward'), color: 'text-yellow-400' },
  auto_compound: { icon: Zap, label: t('إعادة استثمار', 'Auto-Compound'), color: 'text-primary' },
  auto_route: { icon: Settings2, label: t('تحويل تلقائي', 'Auto-Route'), color: 'text-cyan-400' },
  charity_out: { icon: Heart, label: t('تبرع', 'Donation'), color: 'text-pink-400' },
  platform_deposit: { icon: ArrowDownCircle, label: t('إيداع المنصة', 'Platform Deposit'), color: 'text-primary' },
  limit_order: { icon: Settings2, label: t('أمر محدد', 'Limit Order'), color: 'text-orange-400' },
});

const getSourceConfig = (t: (ar: string, en?: string) => string) => ({
  wheel_win_tax: { icon: Gamepad2, label: t('ضريبة عجلة الحظ', 'Wheel Win Tax'), currency: '$MS-RA' },
  wheel_spin_cost: { icon: Gamepad2, label: t('تكلفة لفة', 'Spin Cost'), currency: '$MS-RA' },
  wheel_loss: { icon: Gamepad2, label: t('خسارة عجلة', 'Wheel Loss'), currency: '$MS-RA' },
  wheel_bonus_tax: { icon: Gamepad2, label: t('ضريبة بونص', 'Bonus Tax'), currency: '$MS-RA' },
  slot_win_tax: { icon: Gamepad2, label: t('ضريبة سلوت', 'Slot Tax'), currency: '$MS-RA' },
  slot_loss: { icon: Gamepad2, label: t('خسارة سلوت', 'Slot Loss'), currency: '$MS-RA' },
  dice_win_tax: { icon: Gamepad2, label: t('ضريبة نرد', 'Dice Tax'), currency: '$MS-RA' },
  dice_loss: { icon: Gamepad2, label: t('خسارة نرد', 'Dice Loss'), currency: '$MS-RA' },
  payment: { icon: ShoppingCart, label: t('عملية شراء', 'Purchase'), currency: 'EGP → $MS-RA' },
  presale: { icon: Coins, label: t('بيع مبكر', 'Presale'), currency: '$MS-RA' },
  mining: { icon: Pickaxe, label: t('تعدين', 'Mining'), currency: '$MS-RA' },
  conversion: { icon: Coins, label: t('تحويل نقاط', 'Points Conversion'), currency: 'XP → $MS-RA' },
  recharge: { icon: ShoppingCart, label: t('شحن رصيد', 'Recharge'), currency: 'EGP' },
});

const getStatusLabels = (t: (ar: string, en?: string) => string) => ({
  completed: { label: t('مكتمل', 'Completed'), variant: 'default' as const },
  pending: { label: t('معلق', 'Pending'), variant: 'secondary' as const },
  failed: { label: t('فشل', 'Failed'), variant: 'destructive' as const },
  cancelled: { label: t('ملغي', 'Cancelled'), variant: 'secondary' as const },
});

export const TransactionsTab = ({ pool }: { pool: PoolHook }) => {
  const { t } = useLanguage();
  const txTypeConfig = getTxTypeConfig(t);
  const sourceConfig = getSourceConfig(t);
  const statusLabels = getStatusLabels(t);

  if (pool.transactions.length === 0) {
    return (
      <Card className="bg-card/80 border-primary/20">
        <CardContent className="p-8 text-center">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-cairo text-sm text-muted-foreground">{t('لا توجد معاملات بعد', 'No transactions yet')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <span className="font-cairo">{t('سجل المعاملات', 'Transaction History')}</span>
          <Badge variant="secondary" className="text-[9px]">{pool.transactions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {pool.transactions.map(tx => {
          const source = tx.source_type ? (sourceConfig as any)[tx.source_type] : null;
          const config = source 
            ? { ...((txTypeConfig as any)[tx.transaction_type] || txTypeConfig.deposit), label: source.label, icon: source.icon }
            : (txTypeConfig as any)[tx.transaction_type] || txTypeConfig.deposit;
          const status = (statusLabels as any)[tx.status] || statusLabels.completed;
          const Icon = config.icon;
          const currencyLabel = source?.currency || '$MS-RA';

          return (
            <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/30 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold font-cairo">{config.label}</p>
                  <p className="text-[9px] text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString('ar', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {tx.notes && (
                    <p className="text-[8px] text-muted-foreground/60 max-w-[160px] truncate">{tx.notes}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${
                  ['deposit', 'stake', 'reward', 'auto_compound', 'platform_deposit'].includes(tx.transaction_type) 
                    ? 'text-green-400' : 'text-red-400'
                }` } dir="ltr">
                  {['withdraw', 'charity_out'].includes(tx.transaction_type) ? '-' : '+'}
                  {tx.amount.toFixed(2)} <span className="text-[8px] opacity-70">{currencyLabel}</span>
                </p>
                <Badge variant={status.variant} className="text-[8px] px-1 py-0">{status.label}</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
