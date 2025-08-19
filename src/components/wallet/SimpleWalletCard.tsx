import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SimpleWallet } from '@/hooks/useSimpleWallet';
import {
  Copy,
  RefreshCw,
  ArrowUpFromLine,
  ArrowDownToLine,
  X,
  Wallet
} from 'lucide-react';

interface SimpleWalletCardProps {
  wallet: SimpleWallet;
  onRefresh: (walletId: string) => void;
  onDisconnect: (walletId: string) => void;
}

export const SimpleWalletCard = ({
  wallet,
  onRefresh,
  onDisconnect
}: SimpleWalletCardProps) => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ العنوان إلى الحافظة'
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh(wallet.id);
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث الرصيد بنجاح'
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الرصيد',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getWalletIcon = () => {
    switch (wallet.type) {
      case 'metamask':
        return '🦊';
      case 'phantom':
        return '👻';
      case 'internal':
        return '🏦';
      default:
        return '💰';
    }
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getWalletIcon()}</span>
            <span>{wallet.name}</span>
          </div>
          <div className="flex gap-1 items-center">
            <Badge variant="secondary">{wallet.currency}</Badge>
            <Badge variant="outline">{wallet.network}</Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDisconnect(wallet.id)}
              className="h-6 w-6 p-0 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Balance Display */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-2xl font-bold">{wallet.balance}</p>
          <p className="text-sm text-muted-foreground">{wallet.currency}</p>
        </div>

        {/* Address Display */}
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-hidden">
            {wallet.address.slice(0, 20)}...
          </code>
          <Button size="sm" variant="ghost" onClick={copyAddress}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" className="w-full">
            <ArrowUpFromLine className="h-4 w-4 mr-2" />
            إرسال
          </Button>
          <Button size="sm" variant="outline" className="w-full">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            استقبال
          </Button>
        </div>

        {/* Wallet Status */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span>متصل</span>
        </div>
      </CardContent>
    </Card>
  );
};