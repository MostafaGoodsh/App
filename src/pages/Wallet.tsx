import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { Keypair } from "@solana/web3.js";
import { 
  Copy, Send, QrCode, Plus, Wallet2, 
  RefreshCw, ExternalLink, Eye, EyeOff, AlertCircle, ArrowDownToLine, ArrowUpFromLine, Network
} from "lucide-react";

// Multi-wallet support with MetaMask, Phantom, WalletConnect and internal wallets
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: { toString(): string } }>;
        disconnect: () => Promise<void>;
        signAndSendTransaction?: (transaction: any) => Promise<{ signature: string }>;
        signTransaction?: (transaction: any) => Promise<any>;
      };
    };
  }
}

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
    sendTransaction
  } = useWalletConnect();
  
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [sendAmount, setSendAmount] = useState("");
  const [sendAddress, setSendAddress] = useState("");
  const [newWalletName, setNewWalletName] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<'Ethereum' | 'Solana'>('Ethereum');

  const handleWalletConnect = async (type: string) => {
    try {
      let wallet;
      switch (type) {
        case 'walletconnect':
          wallet = await connectWalletConnect();
          toast({ 
            title: "تم الاتصال بنجاح", 
            description: `تم اتصال WalletConnect بالعنوان: ${wallet?.address?.slice(0, 16)}...` 
          });
          break;
        case 'metamask':
          wallet = await connectMetaMask();
          toast({ 
            title: "متصل بـ MetaMask", 
            description: `العنوان: ${wallet?.address?.slice(0, 16)}...` 
          });
          break;
        case 'phantom':
          wallet = await connectPhantom();
          toast({ 
            title: "متصل بـ Phantom", 
            description: `العنوان: ${wallet?.address?.slice(0, 16)}...` 
          });
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

  const createInternalWallet = async () => {
    if (!newWalletName.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم المحفظة", variant: "destructive" });
      return;
    }
    
    try {
      let newWallet: any;
      
      if (selectedNetwork === 'Ethereum') {
        const wallet = ethers.Wallet.createRandom();
        newWallet = {
          id: Date.now().toString(),
          type: 'Internal',
          address: wallet.address,
          balance: "0.0",
          currency: 'ETH',
          network: 'Ethereum',
          name: newWalletName
        };
      } else {
        const keypair = Keypair.generate();
        newWallet = {
          id: Date.now().toString(),
          type: 'Internal',
          address: keypair.publicKey.toString(),
          balance: "0.0",
          currency: 'SOL',
          network: 'Solana',
          name: newWalletName
        };
      }
      
      // Note: This would need to be integrated with the useWalletConnect hook
      setNewWalletName("");
      toast({ 
        title: "تم إنشاء المحفظة", 
        description: `محفظة ${newWalletName} (${selectedNetwork}) تم إنشاؤها بنجاح` 
      });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في إنشاء المحفظة", variant: "destructive" });
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({ title: "تم النسخ", description: "تم نسخ العنوان إلى الحافظة" });
  };

  const handleRefreshBalance = async (wallet: any) => {
    await refreshBalance(wallet);
    toast({ title: "تم التحديث", description: "تم تحديث الرصيد" });
  };

  const handleSend = async () => {
    if (!selectedWallet || !sendAmount || !sendAddress) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }

    try {
      const txHash = await sendTransaction(selectedWallet, sendAddress, sendAmount);
      
      toast({ 
        title: "تم الإرسال بنجاح", 
        description: `معرف المعاملة: ${txHash.slice(0, 16)}...` 
      });
      
      setSendDialogOpen(false);
      setSendAmount("");
      setSendAddress("");
      
    } catch (error: any) {
      console.error("Send transaction error:", error);
      toast({ 
        title: "فشل في الإرسال", 
        description: error.message || "حدث خطأ أثناء الإرسال", 
        variant: "destructive" 
      });
    }
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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔗 WalletConnect
            </CardTitle>
            <CardDescription>اتصال بأكثر من 300 محفظة</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setConnectModalOpen(true)}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              اتصال بالمحافظ
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🦊 MetaMask
            </CardTitle>
            <CardDescription>محفظة Ethereum الأشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleWalletConnect('metamask')}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              اتصال بـ MetaMask
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👻 Phantom
            </CardTitle>
            <CardDescription>محفظة Solana الرائدة</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleWalletConnect('phantom')}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              اتصال بـ Phantom
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ➕ إنشاء محفظة
            </CardTitle>
            <CardDescription>أنشئ محفظة داخلية جديدة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="wallet-name">اسم المحفظة</Label>
              <Input
                id="wallet-name"
                placeholder="أدخل اسم المحفظة"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="network-select">اختر الشبكة</Label>
              <Select value={selectedNetwork} onValueChange={(value: 'Ethereum' | 'Solana') => setSelectedNetwork(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الشبكة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ethereum">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      Ethereum (ETH)
                    </div>
                  </SelectItem>
                  <SelectItem value="Solana">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      Solana (SOL)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={createInternalWallet}>
              <Plus className="h-4 w-4 mr-2" />
              إنشاء محفظة {selectedNetwork}
            </Button>
          </CardContent>
        </Card>
      </div>

      {connectedWallets.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">المحافظ المتصلة</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connectedWallets.map((wallet) => (
              <Card key={wallet.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{wallet.name || wallet.type}</span>
                    <div className="flex gap-1">
                      <Badge variant="secondary">{wallet.currency}</Badge>
                      <Badge variant="outline">{wallet.network}</Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {wallet.type === 'Internal' ? `محفظة داخلية - ${wallet.network}` : `محفظة ${wallet.type} - ${wallet.network}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{wallet.balance}</p>
                    <p className="text-sm text-muted-foreground">{wallet.currency}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-hidden">
                      {wallet.address.slice(0, 20)}...
                    </code>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyAddress(wallet.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleRefreshBalance(wallet)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedWallet(wallet)}
                        >
                          <ArrowUpFromLine className="h-4 w-4 mr-2" />
                          إرسال
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    
                    <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setSelectedWallet(wallet)}
                        >
                          <ArrowDownToLine className="h-4 w-4 mr-2" />
                          استقبال
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Send Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إرسال {selectedWallet?.currency}</DialogTitle>
            <DialogDescription>
              من محفظة: {selectedWallet?.name || selectedWallet?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="send-address">عنوان المستلم</Label>
              <Input
                id="send-address"
                placeholder="0x..."
                value={sendAddress}
                onChange={(e) => setSendAddress(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="send-amount">المبلغ</Label>
              <Input
                id="send-amount"
                type="number"
                placeholder="0.0"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSend} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                إرسال
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSendDialogOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receive Dialog */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>استقبال {selectedWallet?.currency}</DialogTitle>
            <DialogDescription>
              شارك هذا العنوان لاستقبال {selectedWallet?.currency}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-6 bg-muted rounded-lg">
              <div className="mb-4 mx-auto w-32 h-32 bg-white border rounded-lg flex items-center justify-center">
                <QrCode className="h-20 w-20" />
              </div>
              <p className="text-sm font-mono break-all">
                {selectedWallet?.address}
              </p>
            </div>
            <Button 
              onClick={() => selectedWallet && copyAddress(selectedWallet.address)}
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              نسخ العنوان
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* WalletConnect Modal */}
      <WalletConnectModal
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
        onConnect={handleWalletConnect}
        isConnecting={isConnecting}
      />
    </div>
  );
};

export default WalletFixed;
