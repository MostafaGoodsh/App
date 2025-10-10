import React, { useState, useEffect } from 'react';
import { HybridWalletCard } from '@/components/wallet/HybridWalletCard';
import { HybridTokenSwap } from '@/components/wallet/HybridTokenSwap';
import { WithdrawalHistory } from '@/components/wallet/WithdrawalHistory';
import { XpToMsRaConverter } from '@/components/wallet/XpToMsRaConverter';
import { MsRaCurrencyCard } from '@/components/wallet/MsRaCurrencyCard';
import { RechargeSection } from '@/components/wallet/RechargeSection';
import { useSolanaWalletData } from '@/hooks/useSolanaWalletData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Wallet as WalletIcon } from 'lucide-react';

// محتوى المحفظة البسيطة
const WalletContent = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showHybridSwap, setShowHybridSwap] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const { user } = useAuth();
  const { getTransactionHistory } = useSolanaWalletData();

  // Check verification status
  useEffect(() => {
    const checkVerification = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('identity_verification')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();
      
      setIsVerified(!!data);
    };
    
    checkVerification();
  }, [user]);

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
        {/* محفظة XP و MS-RA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HybridWalletCard 
            onSwapClick={() => setShowHybridSwap(true)}
            onWithdrawClick={() => setShowWithdraw(true)}
          />
          <MsRaCurrencyCard isVerified={isVerified} />
        </div>

        {/* Recharge & Conversion Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RechargeSection />
          <XpToMsRaConverter />
        </div>
        
        {/* تاريخ السحوبات */}
        <WithdrawalHistory />
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
              المحفظة | Wallet
            </h1>
          </div>
          <p className="text-muted-foreground">
            أدر عملاتك الداخلية، اشحن، حول، واسحب بسهولة
            <br />
            <span className="text-xs">Manage, Recharge, Convert & Withdraw Easily</span>
          </p>
        </header>

        <WalletContent />
      </div>
    </div>
  );
};

export default WalletPage;