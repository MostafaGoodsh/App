import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { Wallet, Copy, RefreshCw, LogOut, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  // Load balance when connected
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
        title: "✅ تم النسخ",
        description: "تم نسخ عنوان المحفظة",
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
        title: "تم قطع الاتصال",
        description: "تم فصل المحفظة بنجاح",
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

  // Compact variant - just a button
  if (variant === 'compact') {
    return (
      <div className="wallet-adapter-button-container">
        <WalletMultiButton />
      </div>
    );
  }

  // Card variant - full card with details
  if (variant === 'card') {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="w-5 h-5 text-primary" />
            <div className="space-y-1">
              <span className="font-cairo" dir="rtl">محفظة Solana</span>
              <span className="text-sm font-normal text-muted-foreground block font-playfair" dir="ltr">
                Solana Wallet
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            اتصل بمحفظتك الخارجية عبر Phantom أو Solflare
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connected && publicKey ? (
            <>
              {/* Connected State */}
              <div className="flex items-center justify-between">
                <Badge variant="default" className="bg-green-600">
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

              {/* Wallet Address */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-mono">
                  {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-6)}
                </span>
                <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {/* Balance */}
              {showBalance && (
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">الرصيد | Balance</p>
                  <p className="text-2xl font-bold">{balance.toFixed(4)} SOL</p>
                </div>
              )}

              {/* Wallet Button for changing wallet */}
              <div className="pt-2">
                <WalletMultiButton className="!w-full !bg-muted hover:!bg-muted/80 !rounded-md !h-10 !justify-center" />
              </div>
            </>
          ) : (
            <>
              {/* Disconnected State */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm">Phantom / Solflare</span>
                <Badge variant="secondary">غير متصل</Badge>
              </div>
              
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-primary hover:!bg-primary/80 !rounded-md !h-10" />
              </div>

              <p className="text-xs text-center text-muted-foreground mt-2">
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
