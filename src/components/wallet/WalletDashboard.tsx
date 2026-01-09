import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { EnhancedWalletCard } from "./EnhancedWalletCard";
import { WalletOverview } from "./WalletOverview";
import { QuickActions } from "./QuickActions";
import { TransactionHistory } from "./TransactionHistory";
import { NetworkSwitcher } from "./NetworkSwitcher";
import { CurrencyExchange } from "./CurrencyExchange";
import { SolanaTokenList } from "./SolanaTokenList";
import { PointsToTokensConverter } from "./PointsToTokensConverter";
import { AddTokenDialog } from "./AddTokenDialog";
import { HybridTokenSwap } from "./HybridTokenSwap";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, TrendingUp, ArrowLeftRight, Network, 
  Coins, Activity, BarChart3, Settings, Zap, Plus, Link2
} from "lucide-react";

interface WalletDashboardProps {
  wallets: ConnectedWallet[];
  onRefreshBalance: (wallet: ConnectedWallet) => Promise<void>;
  onSendTransaction: (wallet: ConnectedWallet, toAddress: string, amount: string) => Promise<string>;
  onDisconnect: (walletId: string) => void;
}

export const WalletDashboard = ({ 
  wallets, 
  onRefreshBalance, 
  onSendTransaction, 
  onDisconnect 
}: WalletDashboardProps) => {
  const { toast } = useToast();
  const { connectWallet, isConnecting } = useWalletConnect();
  const [selectedWallet, setSelectedWallet] = useState<ConnectedWallet | null>(
    wallets.length > 0 ? wallets[0] : null
  );
  const [selectedNetwork, setSelectedNetwork] = useState<string>('solana');
  const [showAddToken, setShowAddToken] = useState(false);
  const [showTokenSwap, setShowTokenSwap] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Listen for events from WithdrawalDialog
  useEffect(() => {
    const handleOpenWalletConnect = async () => {
      try {
        const wallet = await connectWallet();
        if (wallet) {
          toast({
            title: "تم توصيل المحفظة بنجاح",
            description: `تم الاتصال بـ ${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`,
          });
        }
      } catch (error: any) {
        toast({
          title: "خطأ في الاتصال",
          description: error.message || "فشل في توصيل المحفظة",
          variant: "destructive",
        });
      }
    };

    const handleOpenTokenSwap = () => {
      setShowTokenSwap(true);
      setActiveTab('exchange');
    };

    window.addEventListener('open-wallet-connect', handleOpenWalletConnect);
    window.addEventListener('open-token-swap', handleOpenTokenSwap);

    return () => {
      window.removeEventListener('open-wallet-connect', handleOpenWalletConnect);
      window.removeEventListener('open-token-swap', handleOpenTokenSwap);
    };
  }, [connectWallet, toast]);

  if (wallets.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-6">
          <Wallet className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-3">ابدأ رحلتك مع المحافظ الرقمية</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          قم بتوصيل محفظتك الأولى لبدء إدارة أصولك الرقمية والاستفادة من جميع الميزات المتقدمة
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Badge variant="secondary" className="px-4 py-2">
            <Network className="w-4 h-4 mr-2" />
            دعم متعدد الشبكات
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Coins className="w-4 h-4 mr-2" />
            إدارة الأصول
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Activity className="w-4 h-4 mr-2" />
            تتبع المعاملات
          </Badge>
        </div>
      </div>
    );
  }

  const totalValue = wallets.reduce((sum, wallet) => {
    const balance = parseFloat(wallet.balance) || 0;
    // تحويل تقريبي للقيمة - سولانا فقط
    const rate = wallet.currency === 'SOL' ? 100 : 1;
    return sum + (balance * rate);
  }, 0);

  // Show only Solana wallets
  const networkWallets = wallets.filter(wallet => 
    wallet.network.toLowerCase() === 'solana'
  );

  const handleNetworkChange = (network: string) => {
    // For Solana only
    setSelectedNetwork('solana');
    const solanaWallet = wallets.find(w => w.network.toLowerCase() === 'solana');
    
    if (solanaWallet) {
      setSelectedWallet(solanaWallet);
    } else {
      setSelectedWallet(null);
    }
  };

  const handleSwap = async (fromToken: string, toToken: string, amount: string) => {
    // Simulate swap functionality
    console.log(`Swapping ${amount} ${fromToken} to ${toToken}`);
    // Here you would implement actual swap logic
  };

  return (
    <div className="space-y-8">
      {/* نظرة عامة */}
      <section>
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 border-l-4 border-primary px-4 py-2 rounded-r-lg mb-4">
          <h2 className="font-cairo font-bold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            نظرة عامة | Overview
          </h2>
        </div>
        <WalletOverview wallets={wallets} totalValue={totalValue} />
      </section>
      
      {/* الواجهة الرئيسية */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* القائمة الجانبية للمحافظ */}
        <Card className="lg:col-span-1 border-2 border-border/50">
          <CardHeader className="border-b border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Wallet className="w-5 h-5" />
              المحافظ المتصلة | Connected Wallets ({networkWallets.length})
            </CardTitle>
            <CardDescription>
              شبكة {selectedNetwork} • اختر محفظة للتحكم بها
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {/* Solana Network Only */}
            <div className="pb-3 border-b">
              <div className="text-center p-2 bg-muted rounded-lg">
                <Badge variant="default">شبكة Solana</Badge>
              </div>
            </div>
            
            {/* Wallet List for Selected Network */}
            {networkWallets.length > 0 ? (
              networkWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedWallet?.id === wallet.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedWallet(wallet)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {wallet.name || wallet.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {wallet.address.slice(0, 16)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {wallet.balance} {wallet.currency}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {wallet.network}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Network className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">لا توجد محافظ على شبكة {selectedNetwork}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* المحتوى الرئيسي */}
        <div className="lg:col-span-2 space-y-6">
          {selectedWallet && (
            <>
              {/* الإجراءات السريعة */}
              <section>
                <div className="bg-gradient-to-r from-primary/20 to-primary/5 border-l-4 border-primary px-4 py-2 rounded-r-lg mb-4">
                  <h2 className="font-cairo font-bold text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    الإجراءات السريعة | Quick Actions
                  </h2>
                </div>
                <QuickActions 
                  wallet={selectedWallet}
                  onRefreshBalance={onRefreshBalance}
                  onSendTransaction={onSendTransaction}
                  onDisconnect={onDisconnect}
                />
              </section>

              {/* التبويبات */}
              <section>
                <div className="bg-gradient-to-r from-primary/20 to-primary/5 border-l-4 border-primary px-4 py-2 rounded-r-lg mb-4">
                  <h2 className="font-cairo font-bold text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    إدارة المحفظة | Wallet Management
                  </h2>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="details" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      التفاصيل
                    </TabsTrigger>
                    <TabsTrigger value="tokens" className="flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      العملات
                    </TabsTrigger>
                    <TabsTrigger value="exchange" className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4" />
                      التبديل
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      المعاملات
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      الإحصائيات
                    </TabsTrigger>
                  </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <EnhancedWalletCard
                    wallet={selectedWallet}
                    onRefreshBalance={onRefreshBalance}
                    onSendTransaction={onSendTransaction}
                    onDisconnect={onDisconnect}
                  />
                  
                  {/* زر توصيل محفظة WalletConnect */}
                  <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-primary" />
                            توصيل محفظة إضافية | Connect Wallet
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            اتصل بمحفظة WalletConnect للوصول لجميع الميزات
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => window.dispatchEvent(new CustomEvent('open-wallet-connect'))}
                          disabled={isConnecting}
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          {isConnecting ? 'جاري الاتصال...' : 'توصيل'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tokens" className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">العملات الرقمية | Tokens</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddToken(true)}
                      className="border-primary text-primary"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة عقد عملة
                    </Button>
                  </div>
                  <SolanaTokenList wallet={selectedWallet} />
                  <PointsToTokensConverter />
                  
                  {/* Add Token Dialog */}
                  <AddTokenDialog 
                    open={showAddToken}
                    onOpenChange={setShowAddToken}
                    wallet={selectedWallet}
                    onTokenAdded={(token) => {
                      toast({
                        title: "تم إضافة العملة",
                        description: `تمت إضافة ${token.name} (${token.symbol}) بنجاح`,
                      });
                    }}
                  />
                </TabsContent>

                <TabsContent value="exchange" className="space-y-4">
                  {/* التبديل الداخلي السريع */}
                  <HybridTokenSwap />
                  
                  {/* تبديل العملات الخارجية */}
                  <CurrencyExchange
                    wallet={selectedWallet}
                    availableTokens={[]}
                    onSwap={handleSwap}
                  />
                </TabsContent>

                <TabsContent value="transactions">
                  <TransactionHistory wallet={selectedWallet} />
                </TabsContent>

                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        إحصائيات المحفظة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">إجمالي الرصيد</p>
                          <p className="text-2xl font-bold">
                            {selectedWallet.balance} {selectedWallet.currency}
                          </p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">نوع الشبكة</p>
                          <p className="text-2xl font-bold">{selectedWallet.network}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};