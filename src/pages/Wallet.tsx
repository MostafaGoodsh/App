import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TokenList } from "@/components/wallet/TokenList";
import { TokenSwap } from "@/components/wallet/TokenSwap";
import { AddTokenDialog } from "@/components/wallet/AddTokenDialog";
import { 
  Wallet, Plus, RefreshCw, Send, ArrowUpDown, Coins
} from "lucide-react";
import { useState } from "react";

const WalletFixed = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const {
    connectedWallets,
    isConnecting,
    connectWallet,
    disconnectWallet,
    refreshBalance
  } = useWalletConnect();

  const handleWalletConnect = async (walletType?: string) => {
    try {
      const wallet = await connectWallet(walletType);
      if (wallet) {
        toast({ 
          title: "تم الاتصال بنجاح", 
          description: `تم الاتصال بـ ${wallet.name || wallet.type}: ${wallet.address.slice(0, 16)}...` 
        });
        setShowModal(false);
      } else {
        throw new Error('فشل في الحصول على بيانات المحفظة');
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast({ 
        title: "خطأ في الاتصال", 
        description: error.message || 'فشل الاتصال بالمحفظة', 
        variant: "destructive" 
      });
    }
  };

  const handleDisconnect = (walletId: string) => {
    disconnectWallet(walletId);
    toast({ 
      title: "تم قطع الاتصال", 
      description: "تم قطع اتصال المحفظة بنجاح" 
    });
  };

  const handleRefreshBalance = async (wallet: any) => {
    try {
      await refreshBalance(wallet);
      toast({
        title: "تم تحديث الرصيد",
        description: "تم تحديث رصيد المحفظة بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "فشل في تحديث رصيد المحفظة",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 arabic-content">
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent arabic-text">
          اتصال المحفظة الرقمية
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto arabic-text">
          اتصل بمحفظتك الرقمية باستخدام WalletConnect
        </p>
      </div>
      
      {connectedWallets.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wallet className="w-6 h-6" />
              اتصال المحفظة
            </CardTitle>
            <CardDescription className="arabic-text">
              اتصل بمحفظتك الرقمية لبدء الاستخدام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowModal(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="arabic-text">اتصال بالمحفظة</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {connectedWallets.map((wallet) => (
            <div key={wallet.id} className="max-w-4xl mx-auto">
              {/* Wallet Header */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        {wallet.name || wallet.type}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRefreshBalance(wallet)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDisconnect(wallet.id)}
                      >
                        قطع الاتصال
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground arabic-text">الرصيد الإجمالي</p>
                      <p className="text-2xl font-bold">{wallet.balance} {wallet.currency}</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground arabic-text">الشبكة</p>
                      <p className="text-lg font-semibold">{wallet.network}</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground arabic-text">نوع المحفظة</p>
                      <p className="text-lg font-semibold">{wallet.type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Wallet Features Tabs */}
              <Tabs defaultValue="tokens" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tokens" className="flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    <span className="arabic-text">الرموز المميزة</span>
                  </TabsTrigger>
                  <TabsTrigger value="swap" className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="arabic-text">التبديل</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="tokens" className="mt-6">
                  <TokenList 
                    wallet={wallet} 
                    onAddToken={() => setShowAddToken(true)}
                  />
                </TabsContent>
                
                <TabsContent value="swap" className="mt-6">
                  <TokenSwap wallet={wallet} />
                </TabsContent>
              </Tabs>
            </div>
          ))}
        </div>
      )}

      <WalletConnectModal
        open={showModal}
        onOpenChange={setShowModal}
        onConnect={handleWalletConnect}
        isConnecting={isConnecting}
      />
      
      {connectedWallets.length > 0 && (
        <AddTokenDialog
          open={showAddToken}
          onOpenChange={setShowAddToken}
          wallet={connectedWallets[0]}
        />
      )}
    </div>
  );
};

export default WalletFixed;