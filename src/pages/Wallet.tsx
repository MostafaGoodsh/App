import React, { useState, useEffect } from 'react';
import { HybridWalletCard } from '@/components/wallet/HybridWalletCard';
import { HybridTokenSwap } from '@/components/wallet/HybridTokenSwap';
import { WithdrawalDialog } from '@/components/wallet/WithdrawalDialog';
import { XpToMsRaConverter } from '@/components/wallet/XpToMsRaConverter';
import { MsRaCurrencyCard } from '@/components/wallet/MsRaCurrencyCard';
import { RechargeSection } from '@/components/wallet/RechargeSection';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Wallet as WalletIcon, Activity, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

// محتوى المحفظة البسيطة
const WalletContent = () => {
  const [showHybridSwap, setShowHybridSwap] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [internalTransactions, setInternalTransactions] = useState<any[]>([]);
  
  const { user } = useAuth();

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

  // Load internal transactions
  useEffect(() => {
    const loadInternalTransactions = async () => {
      if (!user) return;
      
      const { data: swaps } = await supabase
        .from('internal_swaps')
        .select(`
          *,
          from_token:internal_tokens!internal_swaps_from_token_id_fkey(symbol, name),
          to_token:internal_tokens!internal_swaps_to_token_id_fkey(symbol, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: payments } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          internal_token:internal_tokens!withdrawal_requests_internal_token_id_fkey(symbol, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const allTx = [
        ...(swaps || []).map(s => ({
          id: s.id,
          type: 'swap',
          from_amount: s.from_amount,
          to_amount: s.to_amount,
          from_token: s.from_token?.symbol,
          to_token: s.to_token?.symbol,
          date: new Date(s.created_at).toLocaleDateString('ar-EG'),
          time: new Date(s.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          status: s.status,
          created_at: s.created_at
        })),
        ...(payments || []).map(p => ({
          id: p.id,
          type: 'recharge',
          amount: p.amount,
          currency: p.currency,
          payment_method: p.payment_method,
          date: new Date(p.created_at).toLocaleDateString('ar-EG'),
          time: new Date(p.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          status: p.status,
          created_at: p.created_at
        })),
        ...(withdrawals || []).map(w => ({
          id: w.id,
          type: 'withdrawal',
          amount: w.internal_amount,
          target_amount: w.target_amount,
          from_token: w.internal_token?.symbol,
          to_token: w.target_token,
          target_address: w.target_address,
          date: new Date(w.created_at).toLocaleDateString('ar-EG'),
          time: new Date(w.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          status: w.status,
          created_at: w.created_at
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setInternalTransactions(allTx.slice(0, 10));
    };

    loadInternalTransactions();
  }, [user]);

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
      <WithdrawalDialog 
        open={showWithdraw}
        onOpenChange={setShowWithdraw}
      />


      {/* تاريخ المعاملات */}
      <Card className="bg-black/60 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="font-cairo flex items-center gap-2 text-white">
            <Activity className="w-5 h-5" />
            Transaction History | تاريخ المعاملات
          </CardTitle>
          <CardDescription className="text-white/70">
            آخر المعاملات في محفظتك الداخلية
          </CardDescription>
        </CardHeader>
        <CardContent>
          {internalTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-white/70 mb-2">لا توجد معاملات بعد</p>
              <p className="text-sm text-white/50">
                ستظهر معاملاتك هنا عند بدء الاستخدام
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {internalTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-3 bg-background/20 rounded-lg border border-white/10 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {tx.type === 'swap' ? (
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                      </div>
                    ) : tx.type === 'withdrawal' ? (
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-orange-400" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <ArrowDownLeft className="w-5 h-5 text-green-400" />
                      </div>
                    )}
                    
                    <div>
                      <p className="font-cairo font-medium text-white">
                        {tx.type === 'swap' 
                          ? `تبديل ${tx.from_token} إلى ${tx.to_token}`
                          : tx.type === 'withdrawal'
                          ? `سحب ${tx.from_token} إلى ${tx.to_token}`
                          : `شحن ${tx.currency}`
                        }
                      </p>
                      <p className="text-sm text-white/60">
                        {tx.date} | {tx.time}
                      </p>
                    </div>
                  </div>

                  <div className="text-left">
                    <p className="font-cairo font-medium text-white">
                      {tx.type === 'swap' 
                        ? `${tx.to_amount} ${tx.to_token}`
                        : tx.type === 'withdrawal'
                        ? `${tx.target_amount} ${tx.to_token}`
                        : `${tx.amount} ${tx.currency}`
                      }
                    </p>
                    <Badge 
                      variant={tx.status === 'completed' ? 'default' : tx.status === 'failed' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {tx.status === 'completed' ? 'مكتمل' : 
                       tx.status === 'pending' || tx.status === 'processing' ? 'قيد المعالجة' : 'فشل'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
            <h1 className="font-cairo text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Wallet
            </h1>
          </div>
          <p className="font-cairo text-xl md:text-2xl text-white/90 mb-2">
            المحفظة
          </p>
          <p className="text-muted-foreground text-sm">
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