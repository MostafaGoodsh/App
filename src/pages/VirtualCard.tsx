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
import { Badge } from '@/components/ui/badge';

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
        <title>البطاقة الافتراضية | Virtual Card</title>
      </Helmet>
      <div className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-cairo text-2xl font-bold flex items-center justify-center gap-2">
            <CreditCard className="w-7 h-7 text-[#D4AF37]" />
            البطاقة الافتراضية
          </h1>
          <p className="text-sm text-muted-foreground">Virtual Card</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] gap-1 border-[#D4AF37]/30 text-[#D4AF37]">
              <Shield className="w-3 h-3" /> مؤمّنة
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1 border-green-500/30 text-green-400">
              <Zap className="w-3 h-3" /> فورية
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1 border-purple-500/30 text-purple-400">
              <Globe className="w-3 h-3" /> عالمية
            </Badge>
          </div>
        </div>

        {!activeCard ? (
          /* No Card - Create One */
          <div className="space-y-6">
            <div className="relative w-full max-w-[360px] mx-auto aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-3">
              <CreditCard className="w-16 h-16 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">لم تنشئ كارت بعد</p>
            </div>
            <CreateCardDialog createCard={createCard} />

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, title: 'تأمين كامل', desc: 'حماية من الاحتيال', color: 'text-green-400' },
                { icon: Zap, title: 'شحن فوري', desc: 'من محفظتك الداخلية', color: 'text-yellow-400' },
                { icon: Globe, title: 'قبول عالمي', desc: 'Visa & Mastercard', color: 'text-blue-400' },
                { icon: CreditCard, title: 'تحكم كامل', desc: 'تجميد وإعدادات', color: 'text-purple-400' },
              ].map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-card/50 border border-border/50 text-center space-y-1">
                  <f.icon className={`w-6 h-6 mx-auto ${f.color}`} />
                  <p className="text-xs font-bold">{f.title}</p>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Has Card */
          <div className="space-y-5">
            <VirtualCardDisplay card={activeCard} />
            <CardBalance card={activeCard} />

            <Tabs defaultValue="topup" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="topup" className="text-xs">شحن</TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs">المعاملات</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">الإعدادات</TabsTrigger>
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
