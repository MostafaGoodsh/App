import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { 
  Activity, ArrowUpRight, ArrowDownLeft, 
  ExternalLink, Calendar, Hash, Coins
} from "lucide-react";

interface TransactionHistoryProps {
  wallet: ConnectedWallet;
}

// بيانات وهمية للمعاملات
const mockTransactions = [
  {
    id: '0x1234...5678',
    type: 'send' as const,
    amount: '0.1',
    currency: 'ETH',
    to: '0x742d...4e7f',
    date: '2024-01-20',
    time: '14:30',
    status: 'completed' as const,
    fee: '0.002'
  },
  {
    id: '0x8765...4321',
    type: 'receive' as const,
    amount: '0.5',
    currency: 'ETH',
    from: '0x123f...8a9b',
    date: '2024-01-19',
    time: '10:15',
    status: 'completed' as const,
    fee: '0.001'
  },
  {
    id: '0x9999...1111',
    type: 'send' as const,
    amount: '0.05',
    currency: 'ETH',
    to: '0x456c...def0',
    date: '2024-01-18',
    time: '16:45',
    status: 'pending' as const,
    fee: '0.003'
  }
];

export const TransactionHistory = ({ wallet }: TransactionHistoryProps) => {
  const openInExplorer = (txId: string) => {
    const explorerUrl = wallet.network === 'Ethereum' 
      ? `https://etherscan.io/tx/${txId}`
      : `https://solscan.io/tx/${txId}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          تاريخ المعاملات
        </CardTitle>
        <CardDescription>
          آخر المعاملات للمحفظة {wallet.name || wallet.type}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">لا توجد معاملات بعد</p>
          <p className="text-sm text-muted-foreground">
            ستظهر معاملاتك هنا عند بدء الاستخدام مع المحفظة {wallet.network === 'Solana' ? 'Solana' : 'Ethereum'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};