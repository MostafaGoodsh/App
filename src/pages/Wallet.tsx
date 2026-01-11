import React, { useState, useEffect, useCallback } from 'react';
import { HybridWalletCard } from '@/components/wallet/HybridWalletCard';
import { HybridTokenSwap } from '@/components/wallet/HybridTokenSwap';
import { WithdrawalDialog } from '@/components/wallet/WithdrawalDialog';
import { XpToMsRaConverter } from '@/components/wallet/XpToMsRaConverter';
import { MsRaCurrencyCard } from '@/components/wallet/MsRaCurrencyCard';
import { RechargeSection } from '@/components/wallet/RechargeSection';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { EvmWalletConnectCard } from '@/components/wallet/EvmWalletConnectCard';
import { SolanaTokenSwap } from '@/components/wallet/SolanaTokenSwap';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Wallet as WalletIcon, Activity, ArrowUpRight, ArrowDownLeft, RefreshCw, Loader2, Link2, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// محتوى المحفظة الموحد (بدون تبويبات)
const WalletContent = () => {
  const [showHybridSwap, setShowHybridSwap] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [internalTransactions, setInternalTransactions] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { user } = useAuth();
  const { toast } = useToast();

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
  const loadInternalTransactions = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    loadInternalTransactions();
  }, [loadInternalTransactions]);

  // Check payment status function
  const checkPaymentStatus = useCallback(async (transactionId: string) => {
    setCheckingPayment(transactionId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: { transaction_id: transactionId },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      if (data.status === 'completed') {
        toast({
          title: "✅ تم الدفع بنجاح",
          description: `تم إضافة ${data.tokens_credited} إلى رصيدك`
        });
      } else if (data.status === 'failed') {
        toast({
          title: "❌ فشل الدفع",
          description: data.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "⏳ قيد المعالجة",
          description: "الدفع لا يزال قيد المعالجة"
        });
      }

      await loadInternalTransactions();
    } catch (error: any) {
      console.error('Check payment error:', error);
      toast({
        title: "خطأ",
        description: "فشل التحقق من حالة الدفع",
        variant: "destructive"
      });
    } finally {
      setCheckingPayment(null);
    }
  }, [toast, loadInternalTransactions]);

  // Handle payment callback from redirect
  useEffect(() => {
    const paymentCallback = searchParams.get('payment_callback');
    const transactionId = searchParams.get('transaction_id');

    if (paymentCallback === 'true' && transactionId) {
      setSearchParams({});
      checkPaymentStatus(transactionId);
    }
  }, [searchParams, setSearchParams, checkPaymentStatus]);

  // Refresh transactions
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInternalTransactions();
    setIsRefreshing(false);
    toast({
      title: "تم التحديث",
      description: "تم تحديث قائمة المعاملات"
    });
  };

  return (
    <div className="space-y-8">
      {/* ===== القسم 1: المحفظة الداخلية ===== */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <WalletIcon className="w-6 h-6 text-primary" />
          <h2 className="font-cairo text-xl font-bold text-foreground">
            المحفظة الداخلية | Internal Wallet
          </h2>
        </div>
        
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
      </section>

      {/* ===== القسم 2: المحافظ الخارجية ===== */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Link2 className="w-6 h-6 text-primary" />
          <h2 className="font-cairo text-xl font-bold text-foreground">
            المحافظ الخارجية | External Wallets
          </h2>
        </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WalletConnectButton variant="card" showBalance={true} />
            <EvmWalletConnectCard />
          </div>
        </section>

      {/* ===== القسم 3: تبادل العملات ===== */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <ArrowRightLeft className="w-6 h-6 text-primary" />
          <h2 className="font-cairo text-xl font-bold text-foreground">
            تبادل العملات | Token Swap
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SolanaTokenSwap />
          
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-t-lg border-b border-amber-500/30">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-5 h-5 text-amber-500" />
                <div className="space-y-1">
                  <span className="font-cairo" dir="rtl">العملات المدعومة</span>
                  <span className="text-sm font-normal text-muted-foreground block font-playfair" dir="ltr">
                    Supported Tokens
                  </span>
                </div>
              </CardTitle>
              <CardDescription>
                الشبكات والعملات المدعومة للتبادل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-xs">◎</span>
                    </div>
                    <span className="text-sm">Solana</span>
                  </div>
                  <Badge variant="default" className="bg-green-600">مدعومة</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-xs">💵</span>
                    </div>
                    <span className="text-sm">USDC</span>
                  </div>
                  <Badge variant="default" className="bg-green-600">مدعومة</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-xs">💰</span>
                    </div>
                    <span className="text-sm">USDT</span>
                  </div>
                  <Badge variant="default" className="bg-green-600">مدعومة</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <span className="text-xs">🐶</span>
                    </div>
                    <span className="text-sm">BONK</span>
                  </div>
                  <Badge variant="default" className="bg-green-600">مدعومة</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center pt-2">
                يمكنك إضافة عقود عملات مخصصة من خلال نافذة التبادل
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

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

      {/* ===== القسم 4: تاريخ المعاملات ===== */}
      <section className="space-y-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-cairo flex items-center gap-2">
                <Activity className="w-5 h-5" />
                تاريخ المعاملات | Transaction History
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <CardDescription>
              آخر المعاملات في محفظتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            {internalTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">لا توجد معاملات بعد</p>
                <p className="text-sm text-muted-foreground">
                  ستظهر معاملاتك هنا عند بدء الاستخدام
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {internalTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/30 transition-colors"
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
                        <p className="font-cairo font-medium">
                          {tx.type === 'swap' 
                            ? `تبديل ${tx.from_token} إلى ${tx.to_token}`
                            : tx.type === 'withdrawal'
                            ? `سحب ${tx.from_token} إلى ${tx.to_token}`
                            : `شحن ${tx.currency}`
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {tx.date} | {tx.time}
                        </p>
                      </div>
                    </div>

                    <div className="text-left">
                      <p className="font-cairo font-medium">
                        {tx.type === 'swap' 
                          ? `${tx.to_amount} ${tx.to_token}`
                          : tx.type === 'withdrawal'
                          ? `${tx.target_amount} ${tx.to_token}`
                          : `${tx.amount} ${tx.currency}`
                        }
                      </p>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant={tx.status === 'completed' ? 'default' : tx.status === 'failed' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {tx.status === 'completed' ? 'مكتمل' : 
                           tx.status === 'pending' || tx.status === 'processing' ? 'قيد المعالجة' : 'فشل'}
                        </Badge>
                        {tx.type === 'recharge' && (tx.status === 'pending' || tx.status === 'processing') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => checkPaymentStatus(tx.id)}
                            disabled={checkingPayment === tx.id}
                          >
                            {checkingPayment === tx.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

// صفحة المحفظة الرئيسية
const WalletPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <WalletIcon className="w-10 h-10 text-primary" />
            <h1 className="font-cairo text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Wallet
            </h1>
          </div>
          <p className="font-cairo text-xl md:text-2xl text-foreground/90 mb-2">
            المحفظة
          </p>
          <p className="text-muted-foreground text-sm">
            أدر عملاتك الداخلية والخارجية، اشحن، حول، واسحب بسهولة
            <br />
            <span className="text-xs">Manage Internal & External Wallets, Recharge, Convert & Withdraw</span>
          </p>
        </header>

        <WalletContent />
      </div>
    </div>
  );
};

export default WalletPage;
