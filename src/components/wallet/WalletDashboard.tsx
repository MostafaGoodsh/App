import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { EnhancedWalletCard } from "./EnhancedWalletCard";
import { WalletOverview } from "./WalletOverview";
import { QuickActions } from "./QuickActions";
import { TransactionHistory } from "./TransactionHistory";
import { 
  Wallet, TrendingUp, ArrowLeftRight, Network, 
  Coins, Activity, BarChart3, Settings
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
  const [selectedWallet, setSelectedWallet] = useState<ConnectedWallet | null>(
    wallets.length > 0 ? wallets[0] : null
  );

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
    // تحويل تقريبي للقيمة (يمكن تحسينه بأسعار حقيقية)
    const rate = wallet.currency === 'ETH' ? 2000 : wallet.currency === 'SOL' ? 100 : 1;
    return sum + (balance * rate);
  }, 0);

  return (
    <div className="space-y-6">
      {/* نظرة عامة */}
      <WalletOverview wallets={wallets} totalValue={totalValue} />
      
      {/* الواجهة الرئيسية */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* القائمة الجانبية للمحافظ */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              المحافظ المتصلة ({wallets.length})
            </CardTitle>
            <CardDescription>
              اختر محفظة للتحكم بها
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {wallets.map((wallet) => (
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
            ))}
          </CardContent>
        </Card>

        {/* المحتوى الرئيسي */}
        <div className="lg:col-span-2 space-y-6">
          {selectedWallet && (
            <>
              {/* الإجراءات السريعة */}
              <QuickActions 
                wallet={selectedWallet}
                onRefreshBalance={onRefreshBalance}
                onSendTransaction={onSendTransaction}
                onDisconnect={onDisconnect}
              />

              {/* التبويبات */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    التفاصيل
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};