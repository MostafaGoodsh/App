import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { 
  Copy, Send, QrCode, RefreshCw, ArrowDownToLine, ArrowUpFromLine, X
} from "lucide-react";

interface WalletCardProps {
  wallet: ConnectedWallet;
  onRefreshBalance: (wallet: ConnectedWallet) => Promise<void>;
  onSendTransaction: (wallet: ConnectedWallet, toAddress: string, amount: string) => Promise<string>;
  onDisconnect: (walletId: string) => void;
}

export const WalletCard = ({ wallet, onRefreshBalance, onSendTransaction, onDisconnect }: WalletCardProps) => {
  const { toast } = useToast();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [sendAddress, setSendAddress] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({ title: "تم النسخ", description: "تم نسخ العنوان إلى الحافظة" });
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshBalance(wallet);
      toast({ title: "تم التحديث", description: "تم تحديث الرصيد" });
    } catch (error) {
      toast({ 
        title: "خطأ في التحديث", 
        description: "فشل في تحديث الرصيد",
        variant: "destructive" 
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSend = async () => {
    if (!sendAmount || !sendAddress) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }

    try {
      const txHash = await onSendTransaction(wallet, sendAddress, sendAmount);
      
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

  return (
    <Card className="relative border-primary/20">
      <CardHeader className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-t-lg border-b border-amber-500/30">
        <CardTitle className="flex items-center justify-between">
          <span>{wallet.name || wallet.type}</span>
          <div className="flex gap-1 items-center">
            <Badge variant="secondary">{wallet.currency}</Badge>
            <Badge variant="outline">{wallet.network}</Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDisconnect(wallet.id)}
              className="h-6 w-6 p-0 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          {wallet.type === 'WalletConnect' ? `محفظة WalletConnect - ${wallet.network}` : `محفظة ${wallet.type} - ${wallet.network}`}
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
            onClick={handleRefreshBalance}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full">
                <ArrowUpFromLine className="h-4 w-4 mr-2" />
                إرسال
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>إرسال {wallet.currency}</DialogTitle>
                <DialogDescription>
                  من محفظة: {wallet.name || wallet.type}
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
          
          <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full">
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                استقبال
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>استقبال {wallet.currency}</DialogTitle>
                <DialogDescription>
                  شارك هذا العنوان لاستقبال {wallet.currency}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="mb-4 mx-auto w-32 h-32 bg-white border rounded-lg flex items-center justify-center">
                    <QrCode className="h-20 w-20" />
                  </div>
                  <p className="text-sm font-mono break-all">
                    {wallet.address}
                  </p>
                </div>
                <Button 
                  onClick={() => copyAddress(wallet.address)}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  نسخ العنوان
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};