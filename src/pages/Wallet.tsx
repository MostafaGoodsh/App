import React, { useState, useEffect } from 'react';
import { HybridWalletCard } from '@/components/wallet/HybridWalletCard';
import { HybridTokenSwap } from '@/components/wallet/HybridTokenSwap';
import { WithdrawalHistory } from '@/components/wallet/WithdrawalHistory';
import { useSolanaWalletData } from '@/hooks/useSolanaWalletData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Wallet as WalletIcon } from 'lucide-react';

// محتوى المحفظة البسيطة
const WalletContent = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showHybridSwap, setShowHybridSwap] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  
  const { getTransactionHistory } = useSolanaWalletData();

  const loadTransactions = async () => {
    const txHistory = await getTransactionHistory();
    setTransactions(txHistory);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <>
      {/* المحفظة الداخلية فقط */}
      <div className="space-y-6">
        {/* المحفظة الهجين */}
        <HybridWalletCard 
          onSwapClick={() => setShowHybridSwap(true)}
          onWithdrawClick={() => setShowWithdraw(true)}
        />
        
        {/* تاريخ السحوبات */}
        <WithdrawalHistory />
        
        {/* معلومات النظام الموحد */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              نظام XP الموحد
            </CardTitle>
            <CardDescription>كل شيء الآن بنقاط XP واحدة - بسيط وسهل!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-background rounded-lg">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-sm font-medium">المهام اليومية</div>
                <div className="text-xs text-muted-foreground">اكسب XP</div>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <div className="text-2xl mb-1">⛏️</div>
                <div className="text-sm font-medium">التعدين</div>
                <div className="text-xs text-muted-foreground">احصل على XP</div>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <div className="text-2xl mb-1">💳</div>
                <div className="text-sm font-medium">الشحن</div>
                <div className="text-xs text-muted-foreground">اشتري XP</div>
              </div>
            </div>
            <div className="text-center text-sm text-primary font-medium">
              كل النقاط موحدة الآن - لا داعي للتحويل!
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نافذة التبديل السريع */}
      {showHybridSwap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
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
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                  ستتمكن قريباً من سحب عملاتك الداخلية كعملات حقيقية
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* تاريخ المعاملات المبسط */}
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

    </>
  );
};

// صفحة المحفظة الرئيسية
const WalletPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <WalletIcon className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              المحفظة
            </h1>
          </div>
          <p className="text-muted-foreground">
            أدر عملاتك الداخلية وحولها بسهولة
          </p>
        </header>

        <WalletContent />
      </div>
    </div>
  );
};

export default WalletPage;