import { useAuth } from "@/hooks/useAuth";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { WalletConnectSetup } from "@/components/wallet/WalletConnectSetup";
import { WalletConnectionSection } from "@/components/wallet/WalletConnectionSection";
import { ConnectedWalletsGrid } from "@/components/wallet/ConnectedWalletsGrid";
import { useToast } from "@/hooks/use-toast";

const WalletFixed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    connectedWallets,
    isConnecting,
    connectWalletConnect,
    connectMetaMask,
    connectPhantom,
    refreshBalance,
    sendTransaction,
    disconnectWallet
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">مطلوب تسجيل الدخول</h1>
        <p className="text-muted-foreground">يرجى تسجيل الدخول للوصول إلى محفظتك</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6">المحافظ الرقمية</h1>
      
      {/* WalletConnect Setup Instructions */}
      <WalletConnectSetup />
      
      {/* Wallet Connection Section */}
      <WalletConnectionSection
        isConnecting={isConnecting}
        onWalletConnect={handleWalletConnect}
      />

      {/* Connected Wallets Grid */}
      <ConnectedWalletsGrid
        wallets={connectedWallets}
        onRefreshBalance={handleRefreshBalance}
        onSendTransaction={handleSendTransaction}
        onDisconnect={handleDisconnect}
      />
    </div>
  );
};

export default WalletFixed;