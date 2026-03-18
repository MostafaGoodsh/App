import { useState, useEffect, useCallback } from "react";
import { WalletHeroSection } from "./WalletHeroSection";
import { QuickActionButtons } from "./QuickActionButtons";
import { ModernTokenList, TokenData } from "./ModernTokenList";
import { HybridTokenSwap } from "./HybridTokenSwap";
import { WithdrawalDialog } from "./WithdrawalDialog";
import { XpToMsRaConverter } from "./XpToMsRaConverter";
import { RechargeSection } from "./RechargeSection";
import { WalletConnectButton } from "./WalletConnectButton";
import { EvmWalletConnectCard } from "./EvmWalletConnectCard";
import { TonWalletConnectCard } from "./TonWalletConnectCard";
import { useAuth } from "@/hooks/useAuth";
import { useInternalWallet } from "@/hooks/useInternalWallet";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet, History, ArrowRightLeft, Gift, Link2, QrCode, ArrowDownLeft, Send, RefreshCw, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ModernWalletView = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { tokens: internalTokens, balances, isLoading, refreshData, getTotalUSDValue } = useInternalWallet();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [activeBottomTab, setActiveBottomTab] = useState<'wallet' | 'history' | 'swap' | 'rewards'>('wallet');
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [userXP, setUserXP] = useState(0);

  useEffect(() => {
    const loadUserXP = async () => {
      if (!user) return;
      await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    };
    loadUserXP();
  }, [user]);

  const tokenList: TokenData[] = balances
    .filter((bal) => { const symbol = (bal.token?.symbol || '').toUpperCase(); return symbol === 'XP' || symbol === 'MSRA' || symbol === 'MS-RA'; })
    .map((bal) => ({ symbol: bal.token?.symbol || 'Unknown', name: bal.token?.name || 'Unknown Token', balance: bal.balance, isInternal: true }));

  const xpBalance = balances.find(b => b.token?.symbol === 'XP');
  const totalUsdValue = getTotalUSDValue();

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden w-full max-w-screen-md mx-auto font-cairo" dir={t("الرئيسية") === "الرئيسية" ? "rtl" : "ltr"}>
      <WalletHeroSection totalBalance={totalUsdValue} percentageChange={2.5} changeAmount={totalUsdValue * 0.025} username={profile?.full_name?.split(' ')[0]} points={xpBalance?.balance || 0} />

      <div className="px-3 sm:px-4 -mt-6 relative z-10 mb-4 sm:mb-6">
        <QuickActionButtons onReceive={() => setShowReceiveDialog(true)} onSend={() => setShowSendDialog(true)} onEarn={() => toast({ title: t("قريباً"), description: t("ميزة الربح قادمة قريباً!") })} onSwap={() => setShowSwapDialog(true)} />
      </div>

      <div className="px-3 sm:px-4 space-y-4 sm:space-y-6 overflow-x-hidden">
        <Card className="overflow-hidden bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">{t("حوّل نقاطك إلى MS-RA")}</h3>
              <p className="text-xs text-muted-foreground/70" dir="ltr">Convert XP to MS-RA</p>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setActiveBottomTab('swap')}>{t("تحويل")}</Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-gradient-to-r from-primary/10 to-card border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-primary" /></div>
              <div>
                <h3 className="font-bold text-foreground">{t("سحب إلى محفظة خارجية")}</h3>
                <p className="text-xs text-muted-foreground/70" dir="ltr">Withdraw to External Wallet</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10" onClick={() => setShowWithdrawDialog(true)}>{t("سحب")}</Button>
          </CardContent>
        </Card>

        {activeBottomTab === 'wallet' && (
          <>
            <ModernTokenList tokens={tokenList} isLoading={isLoading} onAddToken={() => toast({ title: t("قريباً"), description: t("إضافة عملات مخصصة قادمة قريباً") })} onRefresh={refreshData} onTokenClick={(token) => { toast({ title: token.name, description: `${t("الرصيد")}: ${token.balance} ${token.symbol}` }); }} />
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold">{t("المحافظ الخارجية")}</h3>
              </div>
              <div className="grid gap-4">
                <WalletConnectButton variant="card" showBalance={true} />
                <EvmWalletConnectCard />
                <TonWalletConnectCard />
              </div>
            </div>
          </>
        )}

        {activeBottomTab === 'history' && <TransactionHistoryTab />}

        {activeBottomTab === 'swap' && (
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"><ArrowRightLeft className="w-6 h-6 text-primary" /></div>
                  <h3 className="font-bold text-lg">{t("مركز التبادل")}</h3>
                </div>
              </CardContent>
            </Card>
            <XpToMsRaConverter />
            <HybridTokenSwap />
            <RechargeSection />
          </div>
        )}

        {activeBottomTab === 'rewards' && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-bold text-lg mb-1">{t("المكافآت")}</h3>
            <p className="text-muted-foreground">{t("قريباً ستتمكن من ربح مكافآت إضافية")}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 safe-area-pb">
        <div className="flex justify-around max-w-lg mx-auto">
          {[
            { id: 'wallet' as const, icon: Wallet, label: t('المحفظة') },
            { id: 'history' as const, icon: History, label: t('تاريخ المعاملات') },
            { id: 'swap' as const, icon: ArrowRightLeft, label: t('تبديل') },
            { id: 'rewards' as const, icon: Gift, label: t('المكافآت') },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveBottomTab(tab.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeBottomTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{t("تبديل العملات")}</DialogTitle></DialogHeader><HybridTokenSwap /></DialogContent>
      </Dialog>

      <WithdrawalDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog} />

      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ArrowDownLeft className="w-5 h-5" />{t("استلام العملات")}</DialogTitle></DialogHeader>
          <div className="text-center py-8">
            <div className="w-48 h-48 mx-auto bg-muted rounded-xl flex items-center justify-center mb-4"><QrCode className="w-24 h-24 text-muted-foreground" /></div>
            <p className="text-sm text-muted-foreground mb-4">{t("قم بتوصيل محفظة Solana أو EVM لعرض عنوان الاستلام")}</p>
            <WalletConnectButton variant="compact" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Send className="w-5 h-5" />{t("إرسال العملات")}</DialogTitle></DialogHeader>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">{t("قم بتوصيل محفظة خارجية لإرسال العملات")}</p>
            <WalletConnectButton variant="compact" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TransactionHistoryTab = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const { data: swaps } = await supabase.from('internal_swaps').select(`*, from_token:internal_tokens!internal_swaps_from_token_id_fkey(symbol), to_token:internal_tokens!internal_swaps_to_token_id_fkey(symbol)`).eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
        const { data: payments } = await supabase.from('payment_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
        const allTx = [
          ...(swaps || []).map(s => ({ id: s.id, type: 'swap', description: `${s.from_token?.symbol} → ${s.to_token?.symbol}`, amount: s.to_amount, symbol: s.to_token?.symbol, date: new Date(s.created_at), status: s.status })),
          ...(payments || []).map(p => ({ id: p.id, type: 'deposit', description: `${t("شحن المحفظة")} ${p.payment_method}`, amount: p.amount, symbol: p.currency, date: new Date(p.created_at), status: p.status }))
        ].sort((a, b) => b.date.getTime() - a.date.getTime());
        setTransactions(allTx.slice(0, 20));
      } catch (error) { console.error('Failed to load transactions:', error); }
      finally { setIsLoading(false); }
    };
    loadTransactions();
  }, [user]);

  if (isLoading) return (<div className="space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />))}</div>);

  if (transactions.length === 0) {
    return (<div className="text-center py-12"><History className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><h3 className="font-bold text-lg mb-2">{t("لا توجد معاملات")}</h3><p className="text-muted-foreground">{t("ستظهر معاملاتك هنا")}</p></div>);
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'swap' ? 'bg-purple-500/20 text-purple-500' : tx.type === 'deposit' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
              {tx.type === 'swap' ? <ArrowRightLeft className="w-5 h-5" /> : tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium text-foreground">{tx.description}</p>
              <p className="text-xs text-muted-foreground">{tx.date.toLocaleDateString('ar-EG')} • {tx.date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${tx.type === 'deposit' ? 'text-green-500' : ''}`}>{tx.type === 'deposit' ? '+' : ''}{tx.amount} {tx.symbol}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'bg-green-500/20 text-green-500' : tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>
              {tx.status === 'completed' ? t('مكتمل') : tx.status === 'pending' ? t('قيد التنفيذ') : t('فشل')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
