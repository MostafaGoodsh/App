import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ExternalLink, Shield, Zap } from 'lucide-react';

const WalletPage = () => {
  const handleWalletConnect = () => {
    // سيتم تطوير هذه الوظيفة لاحقاً
    window.open('https://walletconnect.com/', '_blank');
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
              <Button 
                onClick={handleWalletConnect}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <Wallet className="mr-2 h-5 w-5" />
                اتصل بالمحفظة
              </Button>
              
              <p className="text-center text-sm text-muted-foreground">
                ستفتح نافذة جديدة لاختيار المحفظة وإجراء الاتصال الآمن
              </p>
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

        {/* حالة قيد التطوير */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <p className="text-orange-700 font-medium">قيد التطوير</p>
            </div>
            <p className="text-orange-600 mt-2 text-sm">
              ميزة WalletConnect قيد التطوير النشط. ستكون متاحة قريباً مع دعم كامل لجميع شبكات البلوك تشين.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletPage;