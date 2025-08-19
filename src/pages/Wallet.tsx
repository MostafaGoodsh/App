import { WalletDashboard } from "@/components/wallet/WalletDashboard";
import { WalletConnectionSection } from "@/components/wallet/WalletConnectionSection";
import { WalletConnectSetup } from "@/components/wallet/WalletConnectSetup";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet, Plus, Settings, Activity, BarChart3 
} from "lucide-react";

const WalletFixed = () => {
  const { toast } = useToast();
  const {
    connectedWallets,
    isConnecting,
    connectWalletConnect,
    connectMetaMask,
    connectPhantom,
    refreshBalance,
    sendTransaction,
    disconnectWallet,
    addInternalWallet
  } = useWalletConnect();

  const handleWalletConnect = async (type: string) => {
    try {
      let wallet;
      switch (type) {
        case 'walletconnect':
          wallet = await connectWalletConnect();
          if (wallet) {
            toast({ 
              title: "تم الاتصال بنجاح", 
              description: `تم اتصال WalletConnect بالعنوان: ${wallet.address.slice(0, 16)}...` 
            });
          } else {
            throw new Error('فشل في الحصول على بيانات المحفظة');
          }
          break;
        case 'metamask':
          wallet = await connectMetaMask();
          if (wallet) {
            toast({ 
              title: "متصل بـ MetaMask", 
              description: `العنوان: ${wallet.address.slice(0, 16)}...` 
            });
          } else {
            throw new Error('فشل في الاتصال بـ MetaMask');
          }
          break;
        case 'phantom':
          wallet = await connectPhantom();
          if (wallet) {
            toast({ 
              title: "متصل بـ Phantom", 
              description: `العنوان: ${wallet.address.slice(0, 16)}...` 
            });
          } else {
            throw new Error('فشل في الاتصال بـ Phantom');
          }
          break;
        default:
          throw new Error('نوع محفظة غير مدعوم');
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

  const handleRefreshBalance = async (wallet: any) => {
    try {
      await refreshBalance(wallet);
    } catch (error) {
      console.error('Refresh balance error:', error);
      throw error;
    }
  };

  const handleSendTransaction = async (wallet: any, toAddress: string, amount: string) => {
    try {
      return await sendTransaction(wallet, toAddress, amount);
    } catch (error) {
      console.error('Send transaction error:', error);
      throw error;
    }
  };

  const handleDisconnect = (walletId: string) => {
    disconnectWallet(walletId);
    toast({ 
      title: "تم قطع الاتصال", 
      description: "تم قطع اتصال المحفظة بنجاح" 
    });
  };


  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          لوحة تحكم المحافظ الرقمية
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          إدارة شاملة ومتقدمة لمحافظك الرقمية مع ميزات التبادل والأمان
        </p>
      </div>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            لوحة التحكم
          </TabsTrigger>
          <TabsTrigger value="connect" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            إضافة محفظة
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            الإعدادات
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <WalletDashboard
            wallets={connectedWallets}
            onRefreshBalance={handleRefreshBalance}
            onSendTransaction={handleSendTransaction}
            onDisconnect={handleDisconnect}
          />
        </TabsContent>
        
        <TabsContent value="connect" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                توصيل محفظة جديدة
              </CardTitle>
              <CardDescription>
                اختر نوع المحفظة التي تريد توصيلها أو إنشاء محفظة داخلية جديدة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnectSetup />
              <WalletConnectionSection
                isConnecting={isConnecting}
                onWalletConnect={handleWalletConnect}
                onAddInternalWallet={addInternalWallet}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                إعدادات المحافظ
              </CardTitle>
              <CardDescription>
                تخصيص تفضيلاتك وإعدادات الأمان
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">إعدادات متقدمة</p>
                <p className="text-sm text-muted-foreground">
                  ستتوفر إعدادات إضافية قريباً لتحسين تجربة استخدام المحافظ
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletFixed;