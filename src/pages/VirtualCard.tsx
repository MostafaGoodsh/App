import { Helmet } from 'react-helmet-async';
import { useVirtualCard } from '@/hooks/useVirtualCard';
import VirtualCardDisplay from '@/components/virtualcard/VirtualCardDisplay';
import CardBalance from '@/components/virtualcard/CardBalance';
import CardTopup from '@/components/virtualcard/CardTopup';
import CardTransactions from '@/components/virtualcard/CardTransactions';
import CardSettings from '@/components/virtualcard/CardSettings';
import CreateCardDialog from '@/components/virtualcard/CreateCardDialog';
import { Loader2, CreditCard, Shield, Zap, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VirtualCardPage = () => {
  const {
    activeCard,
    transactions,
    cardsLoading,
    txLoading,
    createCard,
    topupCard,
    toggleCardStatus,
    updateCardSettings,
  } = useVirtualCard();

  if (cardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Virtual Card | البطاقة الافتراضية</title>
      </Helmet>
      <div className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-cairo text-2xl font-bold flex items-center justify-center gap-2 text-[#D4AF37]">
            <CreditCard className="w-7 h-7" />
            Virtual Card
          </h1>
          <p className="text-sm text-[#D4AF37]/60">البطاقة الافتراضية</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] flex items-center gap-1">
              <Shield className="w-3 h-3" /> Secured
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] flex items-center gap-1">
              <Zap className="w-3 h-3" /> Instant
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] flex items-center gap-1">
              <Globe className="w-3 h-3" /> Global
            </span>
          </div>
        </div>

        {!activeCard ? (
          <div className="space-y-6">
            {/* Empty state - no gray card */}
            <div className="text-center py-8 space-y-3">
              <CreditCard className="w-16 h-16 text-[#D4AF37]/30 mx-auto" />
              <p className="text-[#D4AF37]/60 text-sm">No card yet</p>
              <p className="text-[#D4AF37]/40 text-xs">لم تنشئ كارت بعد</p>
            </div>
            <CreateCardDialog createCard={createCard} />

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, title: 'Full Security', desc: 'حماية كاملة' },
                { icon: Zap, title: 'Instant Top-up', desc: 'شحن فوري' },
                { icon: Globe, title: 'Global Acceptance', desc: 'Visa & Mastercard' },
                { icon: CreditCard, title: 'Full Control', desc: 'تحكم كامل' },
              ].map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-black/30 border border-[#D4AF37]/20 text-center space-y-1">
                  <f.icon className="w-6 h-6 mx-auto text-[#D4AF37]" />
                  <p className="text-xs font-bold text-[#D4AF37]">{f.title}</p>
                  <p className="text-[10px] text-[#D4AF37]/50">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <VirtualCardDisplay card={activeCard} />
            <CardBalance card={activeCard} />

            <Tabs defaultValue="topup" className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-black/30 border border-[#D4AF37]/20">
                <TabsTrigger value="topup" className="text-xs data-[state=active]:bg-[#D4AF37]/20 data-[state=active]:text-[#D4AF37]">Top Up</TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs data-[state=active]:bg-[#D4AF37]/20 data-[state=active]:text-[#D4AF37]">Transactions</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs data-[state=active]:bg-[#D4AF37]/20 data-[state=active]:text-[#D4AF37]">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="topup" className="mt-3">
                <CardTopup topupCard={topupCard} />
              </TabsContent>
              <TabsContent value="transactions" className="mt-3">
                <CardTransactions transactions={transactions} loading={txLoading} />
              </TabsContent>
              <TabsContent value="settings" className="mt-3">
                <CardSettings card={activeCard} toggleStatus={toggleCardStatus} updateSettings={updateCardSettings} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </>
  );
};

export default VirtualCardPage;
