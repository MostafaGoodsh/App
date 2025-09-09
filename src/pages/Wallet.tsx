import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, Plus
} from "lucide-react";
import { useState } from "react";

const WalletFixed = () => {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const {
    connectedWallets,
    isConnecting,
    connectWallet,
    disconnectWallet
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
        <div className="space-y-4">
          {connectedWallets.map((wallet) => (
            <Card key={wallet.id} className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{wallet.name || wallet.type}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDisconnect(wallet.id)}
                  >
                    قطع الاتصال
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">العنوان:</p>
                <p className="font-mono text-sm break-all mb-4">{wallet.address}</p>
                <p className="text-sm text-muted-foreground mb-2">الرصيد:</p>
                <p className="text-lg font-semibold">{wallet.balance} {wallet.currency}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WalletConnectModal
        open={showModal}
        onOpenChange={setShowModal}
        onConnect={handleWalletConnect}
        isConnecting={isConnecting}
      />
    </div>
  );
};

export default WalletFixed;