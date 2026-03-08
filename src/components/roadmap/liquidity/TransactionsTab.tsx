import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, ArrowDownCircle, ArrowUpCircle, Lock, Unlock, Zap, Heart, Settings2 } from 'lucide-react';
import type { useLiquidityPool } from '@/hooks/useLiquidityPool';

type PoolHook = ReturnType<typeof useLiquidityPool>;

const txTypeConfig: Record<string, { icon: any; label: string; color: string }> = {
  deposit: { icon: ArrowDownCircle, label: 'إيداع', color: 'text-green-400' },
  withdraw: { icon: ArrowUpCircle, label: 'سحب', color: 'text-red-400' },
  stake: { icon: Lock, label: 'قفل', color: 'text-primary' },
  unstake: { icon: Unlock, label: 'فك قفل', color: 'text-blue-400' },
  reward: { icon: Zap, label: 'مكافأة', color: 'text-yellow-400' },
  auto_compound: { icon: Zap, label: 'إعادة استثمار', color: 'text-primary' },
  auto_route: { icon: Settings2, label: 'تحويل تلقائي', color: 'text-cyan-400' },
  charity_out: { icon: Heart, label: 'تبرع', color: 'text-pink-400' },
  platform_deposit: { icon: ArrowDownCircle, label: 'إيداع المنصة', color: 'text-primary' },
  limit_order: { icon: Settings2, label: 'أمر محدد', color: 'text-orange-400' },
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  completed: { label: 'مكتمل', variant: 'default' },
  pending: { label: 'معلق', variant: 'secondary' },
  failed: { label: 'فشل', variant: 'destructive' },
  cancelled: { label: 'ملغي', variant: 'secondary' },
};

export const TransactionsTab = ({ pool }: { pool: PoolHook }) => {
  if (pool.transactions.length === 0) {
    return (
      <Card className="bg-card/80 border-primary/20">
        <CardContent className="p-8 text-center">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-cairo text-sm text-muted-foreground">لا توجد معاملات بعد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <span className="font-cairo">سجل المعاملات</span>
          <Badge variant="secondary" className="text-[9px]">{pool.transactions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {pool.transactions.map(tx => {
          const config = txTypeConfig[tx.transaction_type] || txTypeConfig.deposit;
          const status = statusLabels[tx.status] || statusLabels.completed;
          const Icon = config.icon;

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
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${
                  ['deposit', 'stake', 'reward', 'auto_compound', 'platform_deposit'].includes(tx.transaction_type) 
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  {['withdraw', 'charity_out'].includes(tx.transaction_type) ? '-' : '+'}
                  {tx.amount.toFixed(2)}
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
