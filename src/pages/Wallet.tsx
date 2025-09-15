import React, { useState, useEffect } from 'react';
import { SolanaWalletProvider } from '@/components/wallet/SolanaWalletProvider';
import { SolanaWalletCard } from '@/components/wallet/SolanaWalletCard';
import { SolanaTokenTransfer } from '@/components/wallet/SolanaTokenTransfer';
import { SolanaTokenList } from '@/components/wallet/SolanaTokenList';
import { PointsToTokensConverter } from '@/components/wallet/PointsToTokensConverter';
import { ConvertedTokensList } from '@/components/wallet/ConvertedTokensList';
import { SolanaTokenSwap } from '@/components/wallet/SolanaTokenSwap';
import { HybridWalletCard } from '@/components/wallet/HybridWalletCard';
import { HybridTokenSwap } from '@/components/wallet/HybridTokenSwap';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { useSolanaWalletData } from '@/hooks/useSolanaWalletData';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Gift, TrendingUp, Zap, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Internal wallet content component that uses the wallet context
const WalletContent = () => {
  const [showSolanaTransfer, setShowSolanaTransfer] = useState(false);
  const [selectedSolanaToken, setSelectedSolanaToken] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showHybridSwap, setShowHybridSwap] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const { requestAirdrop } = useSolanaWallet();
  const { walletData, addAirdropReward, getTransactionHistory } = useSolanaWalletData();

  const handleAirdrop = async () => {
    try {
      toast.loading('جاري طلب Airdrop...');
      const signature = await requestAirdrop(1);
      
      if (signature) {
        // إضافة مكافأة في قاعدة البيانات
        await addAirdropReward(1);
        toast.success('تم إرسال 1 SOL بنجاح!');
        
        // تحديث قائمة المعاملات
        const updatedTransactions = await getTransactionHistory();
        setTransactions(updatedTransactions);
      }
    } catch (error) {
      console.error('Airdrop error:', error);
      toast.error('فشل في طلب Airdrop');
    }
  };

  const loadTransactions = async () => {
    const txHistory = await getTransactionHistory();
    setTransactions(txHistory);
  };

  useEffect(() => {
    if (walletData) {
      loadTransactions();
    }
  }, [walletData]);

  return (
    <>
      {/* زر الاتصال بالمحفظة */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>اتصال المحفظة</CardTitle>
          <CardDescription>اتصل بمحفظة Phantom الخاصة بك</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !text-primary-foreground !border-0 !rounded-lg !px-6 !py-3 !text-base !font-medium !transition-colors" />
        </CardContent>
      </Card>

      {/* إحصائيات المحفظة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد الحالي</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletData?.balance || 0} SOL</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المعاملات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة الشبكة</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Devnet</div>
          </CardContent>
        </Card>
      </div>

        {/* التبويبات الرئيسية */}
        <Tabs defaultValue="hybrid" className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hybrid" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              المحفظة الهجين
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              محفظة Solana
            </TabsTrigger>
            <TabsTrigger value="swap" className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              تبديل Solana
            </TabsTrigger>
            <TabsTrigger value="conversion" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              تحويل النقاط
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hybrid" className="space-y-6">
            {/* المحفظة الهجين */}
            <HybridWalletCard 
              onSwapClick={() => setShowHybridSwap(true)}
              onWithdrawClick={() => setShowWithdraw(true)}
            />
            
            {/* تبديل سريع في نافذة منبثقة */}
            {showHybridSwap && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold">تبديل سريع</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowHybridSwap(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="p-4">
                    <HybridTokenSwap />
                  </div>
                </div>
              </div>
            )}

            {/* نافذة السحب الحقيقي */}
            {showWithdraw && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold">سحب حقيقي</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowWithdraw(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="p-4">
                    <div className="text-center py-8">
                      <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">قريباً جداً!</h3>
                      <p className="text-muted-foreground mb-4">
                        ميزة السحب الحقيقي للعملات قيد التطوير
                      </p>
                      <p className="text-sm text-blue-600">
                        ستتمكن قريباً من سحب عملاتك الداخلية كعملات حقيقية على شبكة Solana
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

        <TabsContent value="wallet" className="space-y-6">
          {/* محفظة Solana */}
          <SolanaWalletCard 
            onSendToken={(token) => {
              setSelectedSolanaToken(token);
              setShowSolanaTransfer(true);
            }}
          />
          
          {/* قائمة العملات */}
          {walletData && (
            <SolanaTokenList 
              wallet={{
                id: '1',
                address: walletData.publicKey?.toString() || '',
                network: 'solana',
                type: 'WalletConnect',
                balance: walletData.balance?.toString() || '0',
                currency: 'SOL',
                name: 'Phantom Wallet',
                chainId: 101 // Solana mainnet chainId
              }}
              onSendToken={(token) => {
                setSelectedSolanaToken(token);
                setShowSolanaTransfer(true);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="swap" className="space-y-6">
          {/* تبديل العملات على Solana Devnet */}
          <SolanaTokenSwap />
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          {/* تحويل النقاط إلى العملات */}
          <PointsToTokensConverter />

          {/* الإجراءات السريعة */}
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات السريعة</CardTitle>
              <CardDescription>إجراءات سريعة لإدارة محفظتك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleAirdrop} className="w-full" size="lg">
                  <Gift className="mr-2 h-4 w-4" />
                  طلب Airdrop (1 SOL)
                </Button>
                <Button 
                  onClick={() => setShowSolanaTransfer(true)} 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  إرسال SOL
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* تاريخ المعاملات */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>تاريخ المعاملات</CardTitle>
            <CardDescription>آخر المعاملات المنفذة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{tx.transaction_type}</div>
                    <div className="text-sm text-muted-foreground">{tx.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">+{tx.amount} SOL</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <SolanaTokenTransfer 
        open={showSolanaTransfer}
        onOpenChange={setShowSolanaTransfer}
        token={selectedSolanaToken}
      />
    </>
  );
};

// Main wallet page component
const WalletPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent arabic-text">
            إدارة المحافظ الرقمية
          </h1>
          <p className="text-muted-foreground arabic-text">
            اتصل بمحافظك وأدر عملاتك الرقمية بأمان
          </p>
        </header>

        <SolanaWalletProvider network={WalletAdapterNetwork.Devnet}>
          <WalletContent />
        </SolanaWalletProvider>
      </div>
    </div>
  );
};

export default WalletPage;