import { useSimpleWallet } from "@/hooks/useSimpleWallet";
import { SimpleWalletConnection } from "@/components/wallet/SimpleWalletConnection";
import { SimpleWalletCard } from "@/components/wallet/SimpleWalletCard";
import { useToast } from "@/hooks/use-toast";

const WalletFixed = () => {
  const { toast } = useToast();
  const {
    wallets,
    isConnecting,
    connectMetaMask,
    connectPhantom,
    addInternalWallet,
    disconnectWallet,
    refreshBalance
  } = useSimpleWallet();

  const handleConnectMetaMask = async () => {
    try {
      const wallet = await connectMetaMask();
      if (wallet) {
        toast({
          title: "تم الاتصال بنجاح",
          description: `تم الاتصال بـ MetaMask: ${wallet.address.slice(0, 16)}...`
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في الاتصال",
        description: error.message || "فشل في الاتصال بـ MetaMask",
        variant: "destructive"
      });
    }
  };

  const handleConnectPhantom = async () => {
    try {
      const wallet = await connectPhantom();
      if (wallet) {
        toast({
          title: "تم الاتصال بنجاح", 
          description: `تم الاتصال بـ Phantom: ${wallet.address.slice(0, 16)}...`
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في الاتصال",
        description: error.message || "فشل في الاتصال بـ Phantom",
        variant: "destructive"
      });
    }
  };

  const handleCreateWallet = (walletData: { name: string; network: 'Ethereum' | 'Solana' }) => {
    addInternalWallet(walletData);
  };

  const handleDisconnect = (walletId: string) => {
    disconnectWallet(walletId);
    toast({
      title: "تم قطع الاتصال",
      description: "تم قطع اتصال المحفظة بنجاح"
    });
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6">المحافظ الرقمية</h1>
      
      {/* Wallet Connection Section */}
      <SimpleWalletConnection
        isConnecting={isConnecting}
        onConnectMetaMask={handleConnectMetaMask}
        onConnectPhantom={handleConnectPhantom}
        onCreateWallet={handleCreateWallet}
      />

      {/* Connected Wallets */}
      {wallets.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">لا توجد محافظ متصلة</h3>
          <p className="text-muted-foreground">قم بتوصيل محفظة أو إنشاء محفظة جديدة أعلاه</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">المحافظ المتصلة ({wallets.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wallets.map((wallet) => (
              <SimpleWalletCard
                key={wallet.id}
                wallet={wallet}
                onRefresh={refreshBalance}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletFixed;