import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ExternalLink, Shield, Zap, RefreshCw } from 'lucide-react';
import { EthereumWallet } from '@/components/wallet/EthereumWallet';
import { SolanaWallet } from '@/components/wallet/SolanaWallet';

const WalletPage = () => {
  const [connectedWallet, setConnectedWallet] = useState<{
    type: 'ethereum' | 'solana';
    account: string;
    balance: string;
    networkId?: number;
  } | null>(null);

  // أسماء الشبكات Ethereum
  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 137: return 'Polygon';
      case 56: return 'BSC';
      case 10: return 'Optimism';
      case 42161: return 'Arbitrum';
      case 8453: return 'Base';
      case 43114: return 'Avalanche';
      default: return `Chain ${chainId}`;
    }
  };

  // رموز العملات الأصلية
  const getNativeTokenSymbol = (chainId: number) => {
    switch (chainId) {
      case 1: return 'ETH';
      case 137: return 'MATIC';
      case 56: return 'BNB';
      case 10: return 'ETH';
      case 42161: return 'ETH';
      case 8453: return 'ETH';
      case 43114: return 'AVAX';
      default: return 'ETH';
    }
  };

  const handleEthereumConnect = (account: string, balance: string, networkId: number) => {
    setConnectedWallet({
      type: 'ethereum',
      account,
      balance,
      networkId
    });
  };

  const handleSolanaConnect = (account: string, balance: string) => {
    setConnectedWallet({
      type: 'solana',
      account,
      balance
    });
  };

  const handleDisconnect = () => {
    setConnectedWallet(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            محفظة رقمية متعددة الشبكات
          </h1>
          <p className="text-muted-foreground">
            اتصل بمحافظ Ethereum و Solana بأمان
          </p>
        </header>

        {/* خصائص المحفظة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="text-center space-y-2">
            <Shield className="w-8 h-8 mx-auto text-green-500" />
            <h3 className="font-semibold">آمن ومشفر</h3>
            <p className="text-sm text-muted-foreground">
              بروتوكولات أمان متقدمة
            </p>
          </div>
          <div className="text-center space-y-2">
            <Zap className="w-8 h-8 mx-auto text-blue-500" />
            <h3 className="font-semibold">سريع وموثوق</h3>
            <p className="text-sm text-muted-foreground">
              اتصال فوري بالمحافظ
            </p>
          </div>
          <div className="text-center space-y-2">
            <ExternalLink className="w-8 h-8 mx-auto text-purple-500" />
            <h3 className="font-semibold">متعدد الشبكات</h3>
            <p className="text-sm text-muted-foreground">
              يدعم Ethereum و Solana
            </p>
          </div>
        </div>

        {!connectedWallet ? (
          <>
            {/* اختيار نوع المحفظة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EthereumWallet 
                onConnect={handleEthereumConnect}
                onDisconnect={handleDisconnect}
              />
              <SolanaWallet onConnect={handleSolanaConnect} />
            </div>

            {/* محافظ مدعومة */}
            <Card>
              <CardHeader>
                <CardTitle>المحافظ المدعومة</CardTitle>
                <CardDescription>
                  يمكنك الاتصال بأي من هذه المحافظ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'MetaMask', emoji: '🦊', type: 'Ethereum' },
                    { name: 'Phantom', emoji: '👻', type: 'Solana' },
                    { name: 'Trust Wallet', emoji: '🛡️', type: 'Multi' },
                    { name: 'Solflare', emoji: '☀️', type: 'Solana' },
                    { name: 'Rainbow', emoji: '🌈', type: 'Ethereum' },
                    { name: 'Coinbase', emoji: '💙', type: 'Multi' },
                    { name: 'Slope', emoji: '📈', type: 'Solana' },
                    { name: 'WalletConnect', emoji: '🔗', type: 'Multi' }
                  ].map((wallet, index) => (
                    <div key={index} className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl mb-1">{wallet.emoji}</div>
                      <div className="text-sm font-medium">{wallet.name}</div>
                      <div className="text-xs text-muted-foreground">{wallet.type}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">محفظة متصلة</CardTitle>
              <CardDescription>
                {connectedWallet.type === 'ethereum' ? 'شبكة Ethereum' : 'شبكة Solana'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-green-700 font-medium mb-2">✅ تم الاتصال بنجاح!</p>
                <p className="text-sm text-green-600 font-mono break-all">
                  {connectedWallet.account}
                </p>
              </div>

              {/* معلومات المحفظة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h3 className="font-semibold mb-2">الرصيد الحالي</h3>
                  <p className="text-2xl font-bold text-primary">
                    {connectedWallet.balance} {connectedWallet.type === 'solana' ? 'SOL' : 
                      getNativeTokenSymbol(connectedWallet.networkId || 1)}
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">الشبكة</h3>
                  <p className="text-lg font-medium text-blue-700">
                    {connectedWallet.type === 'solana' ? 'Solana Devnet' : 
                      getNetworkName(connectedWallet.networkId || 1)}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleDisconnect}
                  variant="outline"
                  className="flex-1"
                >
                  قطع الاتصال
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="default"
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  تحديث
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WalletPage;