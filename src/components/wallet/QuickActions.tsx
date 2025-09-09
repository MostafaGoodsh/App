import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { 
  Send, QrCode, RefreshCw, ArrowLeftRight, 
  Copy, Zap, Shield, Settings
} from "lucide-react";

interface QuickActionsProps {
  wallet: ConnectedWallet;
  onRefreshBalance: (wallet: ConnectedWallet) => Promise<void>;
  onSendTransaction: (wallet: ConnectedWallet, toAddress: string, amount: string) => Promise<string>;
  onDisconnect: (walletId: string) => void;
}

export const QuickActions = ({ 
  wallet, 
  onRefreshBalance, 
  onSendTransaction, 
  onDisconnect 
}: QuickActionsProps) => {
  const { toast } = useToast();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
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
      toast({ title: "تم التحديث", description: "تم تحديث الرصيد بنجاح" });
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
      toast({ 
        title: "فشل في الإرسال", 
        description: error.message || "حدث خطأ أثناء الإرسال", 
        variant: "destructive" 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            الإجراءات السريعة
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefreshBalance}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDisconnect(wallet.id)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          {wallet.name || wallet.type} • {wallet.network}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* إرسال */}
          <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-col h-auto py-4" variant="outline">
                <Send className="w-6 h-6 mb-2" />
                <span className="text-xs">إرسال</span>
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
                    placeholder={wallet.network === 'Polygon' ? '0x...' : '0x...'}
                    value={sendAddress}
                    onChange={(e) => setSendAddress(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="send-amount">المبلغ ({wallet.currency})</Label>
                  <Input
                    id="send-amount"
                    type="number"
                    placeholder="0.0"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    step="0.0001"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    الرصيد المتاح: {wallet.balance} {wallet.currency}
                  </div>
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

          {/* استقبال */}
          <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-col h-auto py-4" variant="outline">
                <QrCode className="w-6 h-6 mb-2" />
                <span className="text-xs">استقبال</span>
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
                  <div className="mb-4 mx-auto w-32 h-32 bg-white border-2 border-dashed rounded-lg flex items-center justify-center">
                    <QrCode className="h-20 w-20 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-mono break-all bg-background p-2 rounded">
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

          {/* تبديل */}
          <Dialog open={swapDialogOpen} onOpenChange={setSwapDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-col h-auto py-4" variant="outline">
                <ArrowLeftRight className="w-6 h-6 mb-2" />
                <span className="text-xs">تبديل</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>تبديل العملات</DialogTitle>
                <DialogDescription>
                  تبديل {wallet.currency} إلى عملة أخرى
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>من</Label>
                  <div className="flex gap-2">
                    <Input value={wallet.currency} disabled className="w-20" />
                    <Input placeholder="0.0" type="number" />
                  </div>
                </div>
                <div>
                  <Label>إلى</Label>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="عملة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eth">ETH</SelectItem>
                        <SelectItem value="sol">SOL</SelectItem>
                        <SelectItem value="usdc">USDC</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="0.0" disabled />
                  </div>
                </div>
                <div className="text-center text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                  ميزة التبديل قيد التطوير
                </div>
                <Button disabled className="w-full">
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  تبديل (قريباً)
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* أمان */}
          <Button className="flex-col h-auto py-4" variant="outline" disabled>
            <Shield className="w-6 h-6 mb-2" />
            <span className="text-xs">الأمان</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};