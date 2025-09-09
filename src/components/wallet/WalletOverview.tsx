import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { 
  TrendingUp, Wallet, Network, Activity, 
  ArrowUp, ArrowDown, DollarSign
} from "lucide-react";

interface WalletOverviewProps {
  wallets: ConnectedWallet[];
  totalValue: number;
}

export const WalletOverview = ({ wallets, totalValue }: WalletOverviewProps) => {
  const polygonWallets = wallets.filter(w => w.network === 'Polygon');
  
  const totalMaticBalance = polygonWallets.reduce((sum, w) => sum + parseFloat(w.balance || '0'), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
        <CardHeader className="relative pb-2">
          <CardDescription className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            القيمة الإجمالية
          </CardDescription>
          <CardTitle className="text-2xl">
            ${totalValue.toLocaleString('ar-SA', { maximumFractionDigits: 2 })}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <ArrowUp className="w-4 h-4" />
            <span>متصل</span>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5" />
        <CardHeader className="relative pb-2">
          <CardDescription className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            إجمالي المحافظ
          </CardDescription>
          <CardTitle className="text-2xl">{wallets.length}</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {polygonWallets.length} MATIC
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-500/5" />
        <CardHeader className="relative pb-2">
          <CardDescription className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Polygon
          </CardDescription>
          <CardTitle className="text-2xl">
            {totalMaticBalance.toFixed(4)} MATIC
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-sm text-muted-foreground">
            {polygonWallets.length} محفظة متصلة
          </div>
        </CardContent>
      </Card>
    </div>
  );
};