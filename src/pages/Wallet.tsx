import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useToast } from "@/hooks/use-toast";
import { NetworkSwitcher } from "@/components/wallet/NetworkSwitcher";
import { TokenList } from "@/components/wallet/TokenList";
import { TokenSwap } from "@/components/wallet/TokenSwap";
import { AddTokenDialog } from "@/components/wallet/AddTokenDialog";
import { 
  Wallet, RefreshCw, ArrowUpDown, Coins, Plus
} from "lucide-react";

const WalletPage = () => {
  const { toast } = useToast();
  const [showAddToken, setShowAddToken] = useState(false);
  const [customTokens, setCustomTokens] = useState<any[]>(() => {
    const saved = localStorage.getItem('customTokens');
    return saved ? JSON.parse(saved) : [];
  });
  const {
    connectedWallet,
    isConnecting,
    connectWallet,
    switchNetwork,
    disconnectWallet,
    refreshBalance
  } = useWalletConnect();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast({ 
        title: "تم الاتصال بنجاح", 
        description: "تم الاتصال بالمحفظة بنجاح" 
      });
    } catch (error: any) {
      toast({ 
        title: "خطأ في الاتصال", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({ 
      title: "تم قطع الاتصال", 
      description: "تم قطع اتصال المحفظة بنجاح" 
    });
  };

  const handleRefresh = async () => {
    try {
      await refreshBalance();
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

  if (!connectedWallet) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 arabic-content">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent arabic-text">
            المحفظة الرقمية
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto arabic-text">
            اتصل بمحفظتك الرقمية باستخدام WalletConnect
          </p>
        </div>
        
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wallet className="w-6 h-6" />
              اتصال المحفظة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? <RefreshCw className="w-4 w-4 animate-spin mr-2" /> : <Wallet className="w-4 h-4 mr-2" />}
              <span className="arabic-text">اتصال بـ WalletConnect</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 arabic-content">
      {/* Wallet Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                {connectedWallet.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {connectedWallet.address.slice(0, 8)}...{connectedWallet.address.slice(-8)}
              </p>
            </div>
            <div className="flex gap-2">
              <NetworkSwitcher 
                currentNetwork={connectedWallet.network}
                onNetworkSwitch={switchNetwork}
              />
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                قطع الاتصال
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground arabic-text">الرصيد الإجمالي</p>
              <p className="text-2xl font-bold">{connectedWallet.balance} {connectedWallet.currency}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground arabic-text">الشبكة</p>
              <p className="text-lg font-semibold">{connectedWallet.network}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground arabic-text">نوع المحفظة</p>
              <p className="text-lg font-semibold">{connectedWallet.type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Features */}
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
            wallet={connectedWallet} 
            onAddToken={() => setShowAddToken(true)}
            customTokens={customTokens}
            onTokenAdded={(token) => setCustomTokens(prev => [...prev, token])}
          />
        </TabsContent>
        
        <TabsContent value="swap" className="mt-6">
          <TokenSwap wallet={connectedWallet} customTokens={customTokens} />
        </TabsContent>
      </Tabs>

      <AddTokenDialog
        open={showAddToken}
        onOpenChange={setShowAddToken}
        wallet={connectedWallet}
        onTokenAdded={(token) => {
          const updatedTokens = [...customTokens, token];
          setCustomTokens(updatedTokens);
          localStorage.setItem('customTokens', JSON.stringify(updatedTokens));
          setShowAddToken(false);
        }}
      />
    </div>
  );
};

export default WalletPage;