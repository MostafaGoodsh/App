import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpCircle, ArrowDownCircle, RotateCcw, Receipt, Clock } from 'lucide-react';
import type { CardTransaction } from '@/hooks/useVirtualCard';

interface Props {
  transactions: CardTransaction[];
  loading: boolean;
}

const txTypeConfig: Record<string, { icon: typeof ArrowUpCircle; color: string; label: string }> = {
  topup: { icon: ArrowUpCircle, color: 'text-green-400', label: 'شحن' },
  purchase: { icon: ArrowDownCircle, color: 'text-red-400', label: 'شراء' },
  refund: { icon: RotateCcw, color: 'text-blue-400', label: 'استرداد' },
  withdrawal: { icon: ArrowDownCircle, color: 'text-orange-400', label: 'سحب' },
  fee: { icon: Receipt, color: 'text-yellow-400', label: 'رسوم' },
};

const CardTransactions = ({ transactions, loading }: Props) => {
  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6 text-center">
          <Clock className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">سجل المعاملات | Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-6">
            لا توجد معاملات بعد
          </p>
        ) : (
          transactions.map(tx => {
            const config = txTypeConfig[tx.transaction_type] || txTypeConfig.fee;
            const Icon = config.icon;
            const isCredit = ['topup', 'refund'].includes(tx.transaction_type);
            const date = new Date(tx.created_at);
            return (
              <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
                <div className={`p-2 rounded-full bg-background/50 ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {tx.merchant_name || tx.description || config.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground" dir="ltr">
                    {date.toLocaleDateString('ar-EG')} • {date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${isCredit ? 'text-green-400' : 'text-red-400'}`} dir="ltr">
                    {isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                  <Badge variant="outline" className="text-[9px] px-1.5">
                    {tx.status === 'completed' ? 'مكتمل' : tx.status === 'pending' ? 'معلق' : tx.status}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default CardTransactions;
