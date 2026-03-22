import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { Wallet, RefreshCw, Send, Gift, Copy } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import solanaWalletBg from '@/assets/solana-wallet-bg.jpg';

interface SolanaToken {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
}

interface SolanaWalletCardProps {
  onSendToken?: (token: SolanaToken | null) => void;
}

export const SolanaWalletCard = ({ onSendToken }: SolanaWalletCardProps) => {
  const { connected, publicKey } = useWallet();
  const { getBalance, getTokenBalance, requestAirdrop } = useSolanaWallet();
  const { toast } = useToast();
  
  const [solBalance, setSolBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<SolanaToken[]>([]);

  // Popular Solana tokens for demo
  const popularTokens = [
    { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', symbol: 'RAY', name: 'Raydium', decimals: 6 },
    { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Wrapped SOL', decimals: 9 },
  ];

  const loadBalances = async () => {
    if (!connected || !publicKey) return;
    
    setIsLoading(true);
    try {
      // Load SOL balance
      const balance = await getBalance();
      setSolBalance(balance);

      // Load token balances
      const tokenBalances = await Promise.all(
        popularTokens.map(async (token) => {
          const balance = await getTokenBalance(token.mint);
          return { ...token, balance };
        })
      );
      setTokens(tokenBalances);
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
  }, [connected, publicKey]);

  // الاستماع لأحداث التبديل
  useEffect(() => {
    const handleSwapComplete = () => {
      loadBalances();
    };

    window.addEventListener('solana-swap-completed', handleSwapComplete);
    return () => window.removeEventListener('solana-swap-completed', handleSwapComplete);
  }, []);

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      toast({
        title: "تم النسخ",
        description: "تم نسخ عنوان المحفظة",
      });
    }
  };

  const handleAirdrop = async () => {
    try {
      await requestAirdrop(1);
      await loadBalances();
    } catch (error) {
      console.error('Airdrop error:', error);
    }
  };

  const handleSendToken = (token: SolanaToken | null) => {
    onSendToken?.(token);
  };

  if (!connected) {
    return (
      <Card className="border-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={solanaWalletBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
        <CardHeader className="relative z-10 rounded-t-lg border-b border-amber-500/30">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-500" />
            <span className="arabic-text">محفظة سولانا</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <p className="text-center text-muted-foreground arabic-text">
            اتصل بمحفظة سولانا للبدء
          </p>
          <div className="flex justify-center">
            <WalletMultiButton />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={solanaWalletBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>
      <CardHeader className="relative z-10 rounded-t-lg border-b border-amber-500/30">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-500" />
            <span className="arabic-text">محفظة سولانا</span>
          </div>
          <Badge variant="secondary" className="bg-green-600 text-white">متصل</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm font-mono">
            {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
          </span>
          <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        {/* SOL Balance */}
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground arabic-text">رصيد SOL</p>
              <p className="text-2xl font-bold">{solBalance.toFixed(4)} SOL</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAirdrop}>
                <Gift className="w-4 h-4 mr-1" />
                <span className="arabic-text">Airdrop</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSendToken(null)}>
                <Send className="w-4 h-4 mr-1" />
                <span className="arabic-text">إرسال</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Token Balances */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium arabic-text">الرموز المميزة</h4>
            <Button variant="ghost" size="sm" onClick={loadBalances} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {tokens.map((token) => (
            <div key={token.mint} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{token.symbol}</p>
                <p className="text-sm text-muted-foreground">{token.name}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{token.balance.toFixed(4)}</p>
                {token.balance > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSendToken(token)}
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Disconnect Button */}
        <div className="pt-4">
          <WalletMultiButton />
        </div>
      </CardContent>
    </Card>
  );
};