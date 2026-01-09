import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWalletConnect, ConnectedWallet } from '@/hooks/useWalletConnect';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Wallet, Link2, Unlink, Loader2, 
  CheckCircle2, ExternalLink, Copy, RefreshCw 
} from 'lucide-react';

interface WalletConnectButtonProps {
  variant?: 'default' | 'card' | 'compact';
  showBalance?: boolean;
  onConnect?: (wallet: ConnectedWallet) => void;
  onDisconnect?: () => void;
}

export const WalletConnectButton = ({
  variant = 'default',
  showBalance = true,
  onConnect,
  onDisconnect,
}: WalletConnectButtonProps) => {
  const { toast } = useToast();
  const { connectedWallet, isConnecting, connectWallet, disconnectWallet, refreshBalance } = useWalletConnect();
  const { connected: solanaConnected, publicKey, disconnect: disconnectSolana } = useWallet();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleConnect = async () => {
    try {
      const wallet = await connectWallet();
      if (wallet) {
        toast({
          title: "تم التوصيل بنجاح | Connected",
          description: `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`,
        });
        onConnect?.(wallet);
      }
    } catch (error: any) {
      toast({
        title: "فشل التوصيل | Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "تم قطع الاتصال",
      description: "تم فصل المحفظة بنجاح",
    });
    onDisconnect?.();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
      toast({
        title: "تم التحديث",
        description: "تم تحديث الرصيد",
      });
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "تم النسخ",
      description: "تم نسخ العنوان",
    });
  };

  // Compact variant - just a button
  if (variant === 'compact') {
    if (connectedWallet) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
          </Badge>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={handleDisconnect}
          >
            <Unlink className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return (
      <Button 
        size="sm"
        onClick={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <Loader2 className="w-4 h-4 animate-spin ml-1" />
        ) : (
          <Link2 className="w-4 h-4 ml-1" />
        )}
        توصيل
      </Button>
    );
  }

  // Card variant - full card display
  if (variant === 'card') {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="w-5 h-5 text-primary" />
            <div className="space-y-1">
              <span className="font-cairo" dir="rtl">المحافظ الخارجية</span>
              <span className="text-sm font-normal text-muted-foreground block font-playfair" dir="ltr">
                External Wallets
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            اتصل بمحفظتك الخارجية عبر WalletConnect أو Phantom
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* WalletConnect Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">WalletConnect</span>
              {connectedWallet ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="w-3 h-3 ml-1" />
                  متصل
                </Badge>
              ) : (
                <Badge variant="secondary">غير متصل</Badge>
              )}
            </div>

            {connectedWallet ? (
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">العنوان:</span>
                  <div className="flex items-center gap-1">
                    <code className="text-xs font-mono">
                      {connectedWallet.address.slice(0, 10)}...{connectedWallet.address.slice(-8)}
                    </code>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6"
                      onClick={() => copyAddress(connectedWallet.address)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {showBalance && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">الرصيد:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold">
                        {parseFloat(connectedWallet.balance).toFixed(4)} {connectedWallet.currency}
                      </span>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                      >
                        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">الشبكة:</span>
                  <Badge variant="outline">{connectedWallet.network}</Badge>
                </div>

                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={handleDisconnect}
                >
                  <Unlink className="w-4 h-4 ml-1" />
                  قطع الاتصال
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الاتصال...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 ml-2" />
                    اتصل بـ WalletConnect
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Solana Wallet Section */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Phantom Wallet</span>
              {solanaConnected ? (
                <Badge variant="default" className="bg-purple-600">
                  <CheckCircle2 className="w-3 h-3 ml-1" />
                  متصل
                </Badge>
              ) : (
                <Badge variant="secondary">غير متصل</Badge>
              )}
            </div>

            {solanaConnected && publicKey ? (
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">العنوان:</span>
                  <div className="flex items-center gap-1">
                    <code className="text-xs font-mono">
                      {publicKey.toString().slice(0, 10)}...{publicKey.toString().slice(-8)}
                    </code>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6"
                      onClick={() => copyAddress(publicKey.toString())}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full"
                  onClick={() => disconnectSolana()}
                >
                  <Unlink className="w-4 h-4 ml-1" />
                  قطع الاتصال
                </Button>
              </div>
            ) : (
              <WalletMultiButton className="w-full !bg-gradient-to-r !from-purple-600 !to-blue-600 !rounded-lg" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant - just a styled button
  return (
    <Button 
      className="w-full"
      onClick={connectedWallet ? handleDisconnect : handleConnect}
      disabled={isConnecting}
      variant={connectedWallet ? "outline" : "default"}
    >
      {isConnecting ? (
        <>
          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          جاري الاتصال...
        </>
      ) : connectedWallet ? (
        <>
          <Unlink className="w-4 h-4 ml-2" />
          قطع الاتصال ({connectedWallet.address.slice(0, 6)}...)
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4 ml-2" />
          اتصل بالمحفظة الخارجية
        </>
      )}
    </Button>
  );
};
