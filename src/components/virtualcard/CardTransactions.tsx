import { Badge } from '@/components/ui/badge';
import { ArrowUpCircle, ArrowDownCircle, RotateCcw, Receipt, Clock } from 'lucide-react';
import type { CardTransaction } from '@/hooks/useVirtualCard';

interface Props {
  transactions: CardTransaction[];
  loading: boolean;
}

const txTypeConfig: Record<string, { icon: typeof ArrowUpCircle; color: string; label: string }> = {
  topup: { icon: ArrowUpCircle, color: 'text-[#D4AF37]', label: 'Top Up' },
  purchase: { icon: ArrowDownCircle, color: 'text-red-400', label: 'Purchase' },
  refund: { icon: RotateCcw, color: 'text-[#D4AF37]/70', label: 'Refund' },
  withdrawal: { icon: ArrowDownCircle, color: 'text-red-400', label: 'Withdrawal' },
  fee: { icon: Receipt, color: 'text-[#D4AF37]/50', label: 'Fee' },
};

const CardTransactions = ({ transactions, loading }: Props) => {
  if (loading) {
    return (
      <div className="rounded-xl bg-black/40 border border-[#D4AF37]/20 p-6 text-center">
        <Clock className="w-6 h-6 animate-spin mx-auto text-[#D4AF37]/50" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-black/40 border border-[#D4AF37]/20 p-4">
      <h3 className="text-sm font-bold text-[#D4AF37] mb-3">Transactions</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {transactions.length === 0 ? (
          <p className="text-center text-[#D4AF37]/40 text-sm py-6">No transactions yet</p>
        ) : (
          transactions.map(tx => {
            const config = txTypeConfig[tx.transaction_type] || txTypeConfig.fee;
            const Icon = config.icon;
            const isCredit = ['topup', 'refund'].includes(tx.transaction_type);
            const date = new Date(tx.created_at);
            return (
              <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-[#D4AF37]/10">
                <div className={`p-2 rounded-full bg-[#D4AF37]/10 ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    {tx.merchant_name || tx.description || config.label}
                  </p>
                  <p className="text-[10px] text-[#D4AF37]/40" dir="ltr">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${isCredit ? 'text-[#D4AF37]' : 'text-red-400'}`} dir="ltr">
                    {isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                  <Badge variant="outline" className="text-[9px] px-1.5 border-[#D4AF37]/20 text-[#D4AF37]/60">
                    {tx.status === 'completed' ? 'Done' : tx.status === 'pending' ? 'Pending' : tx.status}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CardTransactions;
