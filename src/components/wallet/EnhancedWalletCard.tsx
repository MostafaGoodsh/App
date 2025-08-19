import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, ExternalLink, Shield, Activity, 
  TrendingUp, AlertCircle, CheckCircle, Network
} from "lucide-react";

interface EnhancedWalletCardProps {
  wallet: ConnectedWallet;
  onRefreshBalance: (wallet: ConnectedWallet) => Promise<void>;
  onSendTransaction: (wallet: ConnectedWallet, toAddress: string, amount: string) => Promise<string>;
  onDisconnect: (walletId: string) => void;
}

export const EnhancedWalletCard = ({ 
  wallet, 
  onRefreshBalance, 
  onSendTransaction, 
  onDisconnect 
}: EnhancedWalletCardProps) => {
  const { toast } = useToast();
  
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({ title: "تم النسخ", description: "تم نسخ العنوان إلى الحافظة" });
  };

  const openInExplorer = () => {
    const explorerUrl = wallet.network === 'Ethereum' 
      ? `https://etherscan.io/address/${wallet.address}`
      : `https://solscan.io/account/${wallet.address}`;
    window.open(explorerUrl, '_blank');
  };

  const getWalletStatus = () => {
    const balance = parseFloat(wallet.balance || '0');
    if (balance > 1) return { status: 'active', color: 'green', text: 'نشطة' };
    if (balance > 0) return { status: 'low', color: 'yellow', text: 'رصيد منخفض' };
    return { status: 'empty', color: 'red', text: 'فارغة' };
  };

  const walletStatus = getWalletStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {wallet.name || wallet.type}
              <Badge 
                variant={walletStatus.status === 'active' ? 'default' : 'secondary'}
                className={`
                  ${walletStatus.color === 'green' ? 'bg-green-500' : ''}
                  ${walletStatus.color === 'yellow' ? 'bg-yellow-500' : ''}
                  ${walletStatus.color === 'red' ? 'bg-red-500' : ''}
                `}
              >
                {walletStatus.text}
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              {wallet.network} • {wallet.type}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={openInExplorer}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* الرصيد الرئيسي */}
        <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
          <p className="text-3xl font-bold mb-2">
            {wallet.balance} <span className="text-lg">{wallet.currency}</span>
          </p>
          <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
        </div>

        {/* معلومات المحفظة */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">الأمان</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">محفوظة</span>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">النشاط</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">متصلة</span>
            </div>
          </Card>
        </div>

        {/* عنوان المحفظة */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">عنوان المحفظة</span>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => copyAddress(wallet.address)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <code className="text-xs font-mono break-all">
              {wallet.address}
            </code>
          </div>
        </div>

        {/* شريط التقدم للرصيد */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>مستوى الرصيد</span>
            <span>{Math.min(100, parseFloat(wallet.balance || '0') * 50).toFixed(0)}%</span>
          </div>
          <Progress 
            value={Math.min(100, parseFloat(wallet.balance || '0') * 50)} 
            className="h-2"
          />
        </div>

        {/* معلومات الشبكة */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Network className="w-4 h-4" />
            <span className="font-medium">معلومات الشبكة</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">الشبكة</p>
              <p className="font-medium">{wallet.network}</p>
            </div>
            <div>
              <p className="text-muted-foreground">العملة</p>
              <p className="font-medium">{wallet.currency}</p>
            </div>
          </div>
        </div>

        {/* تحذير إذا كان الرصيد منخفض */}
        {parseFloat(wallet.balance || '0') < 0.01 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              الرصيد منخفض جداً. قد تحتاج إلى إضافة أموال لدفع رسوم المعاملات.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};