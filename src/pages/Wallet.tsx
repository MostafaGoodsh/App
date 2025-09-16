import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ExternalLink, Shield, Zap } from 'lucide-react';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

const WalletPage = () => {
  const [provider, setProvider] = useState<any>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletConnect = async () => {
    try {
      setIsConnecting(true);
      
      const ethereumProvider = await EthereumProvider.init({
        projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_REOWN_PROJECT_ID_HERE', // استخدم project ID من حساب Reown الخاص بك
        chains: [1, 137, 56], // Ethereum, Polygon, BSC
        showQrModal: true,
        qrModalOptions: {
          themeMode: 'dark',
          themeVariables: {
            '--wcm-font-family': 'system-ui, sans-serif',
            '--wcm-accent-color': 'hsl(var(--primary))',
            '--wcm-accent-fill-color': 'hsl(var(--primary-foreground))',
            '--wcm-background-color': 'hsl(var(--background))',
            '--wcm-background-border-radius': '8px',
            '--wcm-container-border-radius': '12px',
          }
        }
      });

      await ethereumProvider.enable();
      
      const accounts = await ethereumProvider.request({ method: 'eth_accounts' }) as string[];
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setProvider(ethereumProvider);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (provider) {
      provider.disconnect();
      setProvider(null);
      setAccount('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent arabic-text">
            محفظة WalletConnect
          </h1>
          <p className="text-muted-foreground arabic-text">
            اتصل بمحفظتك بأمان باستخدام WalletConnect
          </p>
        </header>

        {/* بطاقة WalletConnect الرئيسية */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">اتصال المحفظة</CardTitle>
            <CardDescription>
              اتصل بمحفظتك المفضلة بأمان عبر بروتوكول WalletConnect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <Shield className="w-8 h-8 mx-auto text-green-500" />
                <h3 className="font-semibold">آمن</h3>
                <p className="text-sm text-muted-foreground">
                  بروتوكول مشفر ومؤمن
                </p>
              </div>
              <div className="text-center space-y-2">
                <Zap className="w-8 h-8 mx-auto text-blue-500" />
                <h3 className="font-semibold">سريع</h3>
                <p className="text-sm text-muted-foreground">
                  اتصال فوري بالمحفظة
                </p>
              </div>
              <div className="text-center space-y-2">
                <ExternalLink className="w-8 h-8 mx-auto text-purple-500" />
                <h3 className="font-semibold">متوافق</h3>
                <p className="text-sm text-muted-foreground">
                  يدعم جميع المحافظ
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {!account ? (
                <>
                  <Button 
                    onClick={handleWalletConnect}
                    className="w-full h-12 text-lg"
                    size="lg"
                    disabled={isConnecting}
                  >
                    <Wallet className="mr-2 h-5 w-5" />
                    {isConnecting ? 'جاري الاتصال...' : 'اتصل بالمحفظة'}
                  </Button>
                  
                  <p className="text-center text-sm text-muted-foreground">
                    ستفتح نافذة جديدة لاختيار المحفظة وإجراء الاتصال الآمن
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-green-700 font-medium mb-2">محفظة متصلة بنجاح!</p>
                    <p className="text-sm text-green-600 font-mono break-all">
                      {account}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={disconnectWallet}
                    variant="outline"
                    className="w-full h-12 text-lg"
                    size="lg"
                  >
                    قطع الاتصال
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* معلومات إضافية */}
        <Card>
          <CardHeader>
            <CardTitle>المحافظ المدعومة</CardTitle>
            <CardDescription>
              يمكنك الاتصال بأي محفظة تدعم بروتوكول WalletConnect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'MetaMask', emoji: '🦊' },
                { name: 'Trust Wallet', emoji: '🛡️' },
                { name: 'Rainbow', emoji: '🌈' },
                { name: 'Coinbase', emoji: '💙' },
                { name: 'Phantom', emoji: '👻' },
                { name: 'Solflare', emoji: '☀️' },
                { name: 'Slope', emoji: '📈' },
                { name: 'وأكثر...', emoji: '🚀' }
              ].map((wallet, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl mb-1">{wallet.emoji}</div>
                  <div className="text-sm font-medium">{wallet.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default WalletPage;