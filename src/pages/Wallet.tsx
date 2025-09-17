import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ExternalLink, Shield, Zap } from 'lucide-react';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import SolanaWallet from '@/components/wallet/SolanaWallet';

const WalletPage = () => {
  const [provider, setProvider] = useState<any>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [networkId, setNetworkId] = useState<number>(1);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // مسح البيانات المحفوظة عند تحميل الصفحة
  useEffect(() => {
    clearWalletConnectStorage();
  }, []);

  const clearWalletConnectStorage = () => {
    try {
      // مسح جميع بيانات WalletConnect المحفوظة
      Object.keys(localStorage).forEach(key => {
        if (key.includes('walletconnect') || key.includes('wc@2') || key.includes('-wc')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  };

  // جلب رصيد المحفظة
  const fetchBalance = async (walletProvider: any, walletAccount: string) => {
    try {
      setIsLoadingBalance(true);
      const balance = await walletProvider.request({
        method: 'eth_getBalance',
        params: [walletAccount, 'latest']
      });
      
      // تحويل من wei إلى ether
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
      setBalance(balanceInEth.toFixed(4));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // الحصول على اسم الشبكة
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

  // الحصول على رمز الرمز الأصلي للشبكة
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

  const handleWalletConnect = async () => {
    try {
      setIsConnecting(true);
      
      // مسح البيانات المحفوظة قبل الاتصال الجديد
      clearWalletConnectStorage();
      
      const ethereumProvider = await EthereumProvider.init({
        projectId: '5cbecfb58785fd00d9c6f1825f993060', // معرف مشروع Reown الخاص بك
        chains: [1, 137, 56, 10, 42161, 8453, 43114], // Ethereum, Polygon, BSC, Optimism, Arbitrum, Base, Avalanche
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
        
        // جلب الشبكة الحالية
        const chainId = await ethereumProvider.request({ method: 'eth_chainId' }) as string;
        setNetworkId(parseInt(chainId, 16));
        
        // جلب الرصيد
        await fetchBalance(ethereumProvider, accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // تبديل الشبكة
  const switchNetwork = async (chainId: number) => {
    if (!provider) return;
    
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      setNetworkId(chainId);
      // إعادة جلب الرصيد للشبكة الجديدة
      await fetchBalance(provider, account);
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (provider) {
        await provider.disconnect();
      }
      // مسح البيانات المحفوظة عند قطع الاتصال
      clearWalletConnectStorage();
      setProvider(null);
      setAccount('');
      setBalance('0');
      setNetworkId(1);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      // حتى لو فشل قطع الاتصال، امسح البيانات محلياً
      clearWalletConnectStorage();
      setProvider(null);
      setAccount('');
      setBalance('0');
      setNetworkId(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent arabic-text">
            محافظ العملات الرقمية
          </h1>
          <p className="text-muted-foreground arabic-text">
            اتصل بمحافظ Ethereum و Solana بأمان
          </p>
        </header>

        {/* تبويبات المحافظ */}
        <Tabs defaultValue="ethereum" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ethereum">Ethereum & EVM</TabsTrigger>
            <TabsTrigger value="solana">Solana</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ethereum" className="space-y-4">
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
                      
                      {/* معلومات المحفظة */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5" />
                            محتويات المحفظة
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-primary/5 rounded-lg">
                              <h3 className="font-semibold mb-2">الرصيد الحالي</h3>
                              {isLoadingBalance ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                  <span>جاري التحميل...</span>
                                </div>
                              ) : (
                                <p className="text-2xl font-bold text-primary">{balance} {getNativeTokenSymbol(networkId)}</p>
                              )}
                            </div>
                            
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <h3 className="font-semibold mb-2">الشبكة الحالية</h3>
                              <p className="text-lg font-medium text-blue-700">{getNetworkName(networkId)}</p>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t space-y-3">
                            <div>
                              <h4 className="font-semibold mb-3">تبديل الشبكة</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { id: 1, name: 'Ethereum', symbol: 'ETH' },
                                  { id: 137, name: 'Polygon', symbol: 'MATIC' },
                                  { id: 56, name: 'BSC', symbol: 'BNB' },
                                  { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
                                  { id: 10, name: 'Optimism', symbol: 'ETH' },
                                  { id: 8453, name: 'Base', symbol: 'ETH' }
                                ].map((network) => (
                                  <Button
                                    key={network.id}
                                    onClick={() => switchNetwork(network.id)}
                                    variant={networkId === network.id ? "default" : "outline"}
                                    size="sm"
                                    className="text-xs"
                                  >
                                    {network.name}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            
                            <Button 
                              onClick={() => fetchBalance(provider, account)}
                              variant="outline"
                              className="w-full"
                              disabled={isLoadingBalance}
                            >
                              تحديث الرصيد
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
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
          </TabsContent>
          
          <TabsContent value="solana" className="space-y-4">
            <SolanaWallet />
          </TabsContent>
        </Tabs>

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