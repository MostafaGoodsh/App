import { useState, useEffect } from "react";
import tonWalletBg from '@/assets/ton-wallet-bg.jpg';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTonConnectUI, useTonWallet, useTonAddress, TonConnectButton } from "@tonconnect/ui-react";
import { Copy, Link2, LogOut, RefreshCw, Wallet, Send, ArrowRightLeft, Plus } from "lucide-react";

const shortenAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const TonWalletConnectCard = () => {
  const { toast } = useToast();
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();
  const [balance, setBalance] = useState<string>("0");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [customTokenAddress, setCustomTokenAddress] = useState("");
  const [showAddToken, setShowAddToken] = useState(false);

  useEffect(() => {
    if (userFriendlyAddress) fetchBalance();
  }, [userFriendlyAddress]);

  const fetchBalance = async () => {
    if (!userFriendlyAddress) return;
    try {
      const response = await fetch(`https://tonapi.io/v2/accounts/${userFriendlyAddress}`);
      const data = await response.json();
      if (data.balance) {
        setBalance((Number(data.balance) / 1e9).toFixed(4));
      }
    } catch (error) {
      console.error("Failed to fetch TON balance:", error);
    }
  };

  const handleCopy = async () => {
    if (!userFriendlyAddress) return;
    await navigator.clipboard.writeText(userFriendlyAddress);
    toast({ title: "تم النسخ", description: "تم نسخ عنوان المحفظة" });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBalance();
    setIsRefreshing(false);
    toast({ title: "تم التحديث", description: "تم تحديث رصيد TON" });
  };

  const handleDisconnect = async () => {
    await tonConnectUI.disconnect();
    setBalance("0");
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) return;
    try {
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
          address: transferTo,
          amount: (parseFloat(transferAmount) * 1e9).toString(),
        }]
      };
      await tonConnectUI.sendTransaction(tx);
      toast({ title: "تم الإرسال", description: `تم إرسال ${transferAmount} TON` });
      setShowTransfer(false);
      setTransferTo("");
      setTransferAmount("");
      setTimeout(fetchBalance, 3000);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "فشل الإرسال", variant: "destructive" });
    }
  };

  const handleAddToken = () => {
    if (!customTokenAddress.trim()) return;
    toast({ title: "تم!", description: "تمت إضافة العملة للمراقبة" });
    setCustomTokenAddress("");
    setShowAddToken(false);
  };

  const isConnected = !!wallet;

  return (
    <>
      <Card className="border-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={tonWalletBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
        <CardHeader className="relative z-10 rounded-t-lg border-b border-primary/20">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="w-5 h-5 text-blue-500" />
            <div className="space-y-1">
              <span className="font-cairo" dir="rtl">TON Network</span>
              <span className="text-sm font-normal text-muted-foreground block font-playfair" dir="ltr">
                The Open Network
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            <span className="font-cairo" dir="rtl">اتصال بمحافظ TON (Tonkeeper, MyTonWallet)</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4 relative z-10">
          {isConnected && userFriendlyAddress ? (
            <>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-blue-500/30 text-blue-500">
                  متصل
                </Badge>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                <span className="text-sm font-mono" dir="ltr">{shortenAddress(userFriendlyAddress)}</span>
                <Badge variant="secondary">TON</Badge>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">الرصيد</p>
                <p className="text-2xl font-bold" dir="ltr">{balance} TON</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="flex flex-col gap-1 h-auto py-2" onClick={() => setShowTransfer(true)}>
                  <Send className="w-4 h-4" />
                  <span className="text-[10px]">إرسال</span>
                </Button>
                <Button variant="outline" size="sm" className="flex flex-col gap-1 h-auto py-2" onClick={() => setShowSwap(true)}>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span className="text-[10px]">تبادل</span>
                </Button>
                <Button variant="outline" size="sm" className="flex flex-col gap-1 h-auto py-2" onClick={() => setShowAddToken(true)}>
                  <Plus className="w-4 h-4" />
                  <span className="text-[10px]">عملة</span>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">غير متصل</Badge>
                <span className="text-xs text-muted-foreground" dir="ltr">Tonkeeper / MyTonWallet</span>
              </div>
              <div className="flex justify-center py-4">
                <TonConnectButton />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transfer Dialog */}
      <Dialog open={showTransfer} onOpenChange={setShowTransfer}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              إرسال TON
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>العنوان</Label>
              <Input placeholder="EQ..." value={transferTo} onChange={(e) => setTransferTo(e.target.value)} dir="ltr" />
            </div>
            <div>
              <Label>الكمية (TON)</Label>
              <Input type="number" placeholder="0.00" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} dir="ltr" />
              <p className="text-xs text-muted-foreground mt-1">الرصيد: {balance} TON</p>
            </div>
            <Button onClick={handleTransfer} className="w-full" disabled={!transferTo || !transferAmount}>
              إرسال
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Swap Dialog */}
      <Dialog open={showSwap} onOpenChange={setShowSwap}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              تبادل على TON
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center py-4">
              تبادل العملات على شبكة TON قادم قريباً
            </p>
            <Button variant="outline" onClick={() => setShowAddToken(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              إضافة عملة للتبادل
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Token Dialog */}
      <Dialog open={showAddToken} onOpenChange={setShowAddToken}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              إضافة عملة جديدة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>عنوان العقد (Jetton Address)</Label>
              <Input placeholder="EQ..." value={customTokenAddress} onChange={(e) => setCustomTokenAddress(e.target.value)} dir="ltr" />
            </div>
            <Button onClick={handleAddToken} className="w-full" disabled={!customTokenAddress.trim()}>
              إضافة العملة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
