import { useState, useEffect, useRef } from "react";
import { WalletHeroSection } from "./WalletHeroSection";
import { QuickActionButtons } from "./QuickActionButtons";
import { ModernTokenList, TokenData } from "./ModernTokenList";
import { HybridTokenSwap } from "./HybridTokenSwap";
import { WithdrawalDialog } from "./WithdrawalDialog";
import { XpToMsRaConverter } from "./XpToMsRaConverter";
import { RechargeSection } from "./RechargeSection";
import { PiPaymentSection } from "./PiPaymentSection";
import { WalletConnectButton } from "./WalletConnectButton";
import { EvmWalletConnectCard } from "./EvmWalletConnectCard";
import { TonWalletConnectCard } from "./TonWalletConnectCard";
import { PiWalletCard } from "./PiWalletCard";
import { TokenContractManager } from "./TokenContractManager";
import { useAuth } from "@/hooks/useAuth";
import { useInternalWallet } from "@/hooks/useInternalWallet";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, History, ArrowRightLeft, Gift, Link2, QrCode, ArrowDownLeft, Send, TrendingUp, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import msrWalletBg from '@/assets/msr-wallet-bg.jpg';

interface ModernWalletViewProps {
  solanaNetwork: WalletAdapterNetwork;
  onSolanaNetworkChange: (network: WalletAdapterNetwork) => void;
}

type ContractNetwork = 'solana-devnet' | 'solana-mainnet' | 'ethereum' | 'bsc' | 'polygon';

const CONTRACT_NETWORKS: { value: ContractNetwork; label: string }[] = [
  { value: 'solana-devnet', label: 'Solana Devnet' },
  { value: 'solana-mainnet', label: 'Solana Mainnet' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'bsc', label: 'BSC (BNB Chain)' },
  { value: 'polygon', label: 'Polygon' },
];

export const ModernWalletView = ({ solanaNetwork, onSolanaNetworkChange }: ModernWalletViewProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { tokens: internalTokens, balances, isLoading, refreshData, getTotalUSDValue } = useInternalWallet();
  const { toast } = useToast();
  const { t, dir } = useLanguage();

  const [activeBottomTab, setActiveBottomTab] = useState<'wallet' | 'history' | 'swap' | 'rewards'>('wallet');
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [contractNetwork, setContractNetwork] = useState<ContractNetwork>('solana-devnet');
  const [customTokens, setCustomTokens] = useState<any[]>([]);
  const contractManagerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single();
  }, [user]);

  // Load custom tokens from DB
  useEffect(() => {
    const loadCustomTokens = async () => {
      const { data } = await supabase.from('custom_tokens').select('*');
      if (data) setCustomTokens(data);
    };
    loadCustomTokens();
  }, []);

  const reloadCustomTokens = async () => {
    const { data } = await supabase.from('custom_tokens').select('*');
    if (data) setCustomTokens(data);
    refreshData();
  };

  // Build token list: internal + custom tokens merged
  const tokenList: TokenData[] = [
    ...internalTokens.map((token) => {
      const balance = balances.find((item) => item.token_id === token.id || item.token?.symbol === token.symbol);
      return {
        symbol: token.symbol || 'Unknown',
        name: token.name || 'Unknown Token',
        balance: balance?.balance || 0,
        usdValue: (balance?.balance || 0) * (token.exchange_rate_usd || 0),
        price: token.exchange_rate_usd || 0,
        logoUrl: token.icon_url || undefined,
        network: 'internal',
        isInternal: true,
      };
    }),
    ...customTokens
      .filter(ct => !internalTokens.some(it => it.symbol === ct.symbol))
      .map(ct => ({
        symbol: ct.symbol,
        name: ct.name,
        balance: 0,
        usdValue: 0,
        price: 0,
        logoUrl: ct.logo_url || undefined,
        network: ct.network,
        isInternal: false,
      })),
  ];

  const xpBalance = balances.find(b => b.token?.symbol === 'XP');
  const totalUsdValue = getTotalUSDValue();

  const handleOpenAddToken = () => {
    setActiveBottomTab('wallet');
    setContractNetwork(solanaNetwork === WalletAdapterNetwork.Mainnet ? 'solana-mainnet' : 'solana-devnet');
    requestAnimationFrame(() => {
      contractManagerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden w-full max-w-screen-md mx-auto font-cairo" dir={dir}>
      {/* MSR-Wallet Hero Card with Background */}
      <div className="relative overflow-hidden rounded-b-3xl">
        <img src={msrWalletBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="relative z-10 p-6 pt-8 pb-12">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-amber-400 font-cairo mb-1">MSR-Wallet</h1>
            <p className="text-white/70 text-sm">{t("محفظة مصر الرقمية", "MSR Digital Wallet")}</p>
          </div>
          <WalletHeroSection
            totalBalance={totalUsdValue}
            percentageChange={2.5}
            changeAmount={totalUsdValue * 0.025}
            username={profile?.full_name?.split(' ')[0]}
            points={xpBalance?.balance || 0}
          />
        </div>
      </div>

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
            {/* Token List - all tokens including custom */}
            <ModernTokenList tokens={tokenList} isLoading={isLoading} onAddToken={handleOpenAddToken} onRefresh={reloadCustomTokens} onTokenClick={(token) => { toast({ title: token.name, description: `${t("الرصيد")}: ${token.balance} ${token.symbol}` }); }} />

            {/* External Wallet Cards - always visible */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold">{t("المحافظ الخارجية")}</h3>
              </div>

              {/* 3 Wallet Cards */}
              <WalletConnectButton variant="card" showBalance={true} />
              <PiWalletCard />
              <TonWalletConnectCard />
              <EvmWalletConnectCard />
            </div>

            {/* Solana Network Selector & Contract Manager */}
            <div className="space-y-4 pt-4">
              <Card className="border-border/50 bg-card">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-sm">Solana Network</p>
                    <p className="text-xs text-muted-foreground">{t("اختيار الشبكة لعرض المحافظ والعقود")}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" size="sm" variant={solanaNetwork === WalletAdapterNetwork.Devnet ? 'default' : 'outline'} onClick={() => onSolanaNetworkChange(WalletAdapterNetwork.Devnet)}>
                      Devnet
                    </Button>
                    <Button type="button" size="sm" variant={solanaNetwork === WalletAdapterNetwork.Mainnet ? 'default' : 'outline'} onClick={() => onSolanaNetworkChange(WalletAdapterNetwork.Mainnet)}>
                      Mainnet
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div ref={contractManagerRef} className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm">{t("إضافة عقود العملات")}</h4>
                </div>
                <Select value={contractNetwork} onValueChange={(v) => setContractNetwork(v as ContractNetwork)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر الشبكة" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_NETWORKS.map((n) => (
                      <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <TokenContractManager network={contractNetwork} onTokenAdded={() => reloadCustomTokens()} />
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
            <HybridTokenSwap solanaNetwork={solanaNetwork === WalletAdapterNetwork.Mainnet ? 'mainnet' : 'devnet'} />
            <PiPaymentSection />
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

      {/* Bottom Navigation */}
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
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{t("تبديل العملات")}</DialogTitle></DialogHeader><HybridTokenSwap solanaNetwork={solanaNetwork === WalletAdapterNetwork.Mainnet ? 'mainnet' : 'devnet'} /></DialogContent>
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
        const { data: payments } = await supabase.from('payment_transactions').select('*, payment_details, internal_token:internal_tokens(symbol)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
        const allTx = [
          ...(swaps || []).map(s => ({ id: s.id, type: 'swap', description: `${s.from_token?.symbol} → ${s.to_token?.symbol}`, amount: s.to_amount, symbol: s.to_token?.symbol, date: new Date(s.created_at), status: s.status })),
          ...(payments || []).map(p => {
            const paymentDetails = p.payment_details && typeof p.payment_details === 'object' && !Array.isArray(p.payment_details)
              ? p.payment_details as Record<string, string | number | boolean | null>
              : {};
            const networkLabel = typeof paymentDetails.network_label === 'string'
              ? paymentDetails.network_label
              : typeof paymentDetails.network_mode === 'string'
                ? paymentDetails.network_mode
                : undefined;
            const tokenSymbol = typeof paymentDetails.token_symbol === 'string'
              ? paymentDetails.token_symbol
              : p.internal_token?.symbol || p.currency;
            const creditedAmount = typeof paymentDetails.token_amount === 'number'
              ? paymentDetails.token_amount
              : p.tokens_credited || p.amount;
            return {
              id: p.id,
              type: 'deposit',
              description: p.payment_method === 'pi_network' ? `شراء ${tokenSymbol} عبر ${networkLabel || 'Pi Network'}` : `${t("شحن المحفظة")} ${p.payment_method}`,
              meta: p.payment_method === 'pi_network' ? `${p.amount} ${p.currency} → ${creditedAmount} ${tokenSymbol}` : undefined,
              amount: creditedAmount,
              symbol: tokenSymbol,
              date: new Date(p.created_at),
              status: p.status
            };
          })
        ].sort((a, b) => b.date.getTime() - a.date.getTime());
        setTransactions(allTx.slice(0, 20));
      } catch (error) { console.error('Failed to load transactions:', error); }
      finally { setIsLoading(false); }
    };
    loadTransactions();
  }, [user, t]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-bold text-lg mb-1">{t("لا توجد معاملات")}</h3>
        <p className="text-muted-foreground">{t("ستظهر معاملاتك هنا")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <History className="w-5 h-5 text-primary" />
        {t("المعاملات الأخيرة")}
      </h3>
      {transactions.map((tx) => (
        <Card key={tx.id} className="bg-card/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'swap' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}>
                {tx.type === 'swap' ? <ArrowRightLeft className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-medium text-sm">{tx.description}</p>
                {tx.meta && <p className="text-xs text-muted-foreground" dir="ltr">{tx.meta}</p>}
                <p className="text-xs text-muted-foreground">
                  {tx.date.toLocaleDateString('ar-EG')} • {tx.date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="text-end">
              <p className="font-semibold text-sm" dir="ltr">
                +{tx.amount?.toLocaleString('en-US', { maximumFractionDigits: 4 })}
              </p>
              <p className="text-xs text-muted-foreground" dir="ltr">{tx.symbol}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
