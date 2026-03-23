import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { Copy, RefreshCw, LogOut, ExternalLink, Ghost } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import solanaWalletBg from '@/assets/solana-bg.jpg';

interface WalletConnectButtonProps {
  variant?: 'default' | 'card' | 'compact';
  showBalance?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const WalletConnectButton = ({ 
  variant = 'default',
  showBalance = true,
  onConnect,
  onDisconnect 
}: WalletConnectButtonProps) => {
  const { connected, publicKey, disconnect } = useWallet();
  const { getBalance } = useSolanaWallet();
  const { toast } = useToast();
  const [balance, setBalance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      handleRefresh();
      onConnect?.();
    }
  }, [connected, publicKey]);

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      toast({
        title: '✅ تم النسخ',
        description: 'تم نسخ عنوان المحفظة',
      });
    }
  };

  const handleRefresh = async () => {
    if (!connected) return;
    setIsRefreshing(true);
    try {
      const newBalance = await getBalance();
      setBalance(newBalance);
    } catch (error) {
      console.error('Error refreshing balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setBalance(0);
      onDisconnect?.();
      toast({
        title: 'تم قطع الاتصال',
        description: 'تم فصل المحفظة بنجاح',
      });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const openExplorer = () => {
    if (publicKey) {
      window.open(`https://solscan.io/account/${publicKey.toString()}`, '_blank');
    }
  };

  if (variant === 'compact') {
    return (
      <div className="wallet-adapter-button-container">
        <WalletMultiButton />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className="relative overflow-hidden border-primary/20">
        <div className="absolute inset-0 z-0">
          <img src={solanaWalletBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-background/75 backdrop-blur-[2px]" />
        </div>

        <CardHeader className="relative z-10 rounded-t-lg border-b border-primary/20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ghost className="w-5 h-5 text-primary" />
            <div className="space-y-1">
              <span className="font-cairo" dir="rtl">محفظة Solana</span>
              <span className="block text-sm font-normal text-muted-foreground font-playfair" dir="ltr">
                Solana Wallet
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            اتصل بمحفظتك الخارجية عبر Phantom أو Solflare
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4 pt-4">
          {connected && publicKey ? (
            <>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-primary/30 text-primary">
                  متصل | Connected
                </Badge>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={openExplorer}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/60 p-3">
                <span className="text-sm font-mono">
                  {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-6)}
                </span>
                <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {showBalance && (
                <div className="rounded-lg bg-primary/10 p-4">
                  <p className="text-sm text-muted-foreground">الرصيد | Balance</p>
                  <p className="text-2xl font-bold text-foreground">{balance.toFixed(4)} SOL</p>
                </div>
              )}

              <div className="pt-2">
                <WalletMultiButton className="!h-10 !w-full !justify-center !rounded-md !bg-muted hover:!bg-muted/80" />
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm">Phantom / Solflare</span>
                <Badge variant="secondary">غير متصل</Badge>
              </div>

              <div className="flex justify-center">
                <WalletMultiButton className="!h-10 !rounded-md !bg-primary hover:!bg-primary/80" />
              </div>

              <p className="mt-2 text-center text-xs text-muted-foreground">
                يدعم Phantom, Solflare, وجميع محافظ Solana
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <div className="flex items-center gap-2">
      <WalletMultiButton />
      {connected && publicKey && (
        <>
          <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDisconnect}>
            <LogOut className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default WalletConnectButton;
