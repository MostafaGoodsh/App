import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePiNetwork } from "@/hooks/usePiNetwork";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, CheckCircle2, LogIn, Send, ArrowDownLeft, Coins, Copy } from "lucide-react";
import { PI_NETWORK_OPTIONS } from "@/config/pi";
import { toast } from "sonner";
import piWalletBg from "@/assets/pi-wallet-bg.jpg";
import piLogo from "@/assets/pi-logo.png";

export const PiWalletCard = () => {
  const {
    isPiBrowser,
    isAuthenticated,
    piUser,
    isInitializing,
    isProcessing,
    authenticate,
    createPayment,
    networkMode,
    networkLabel,
    setNetworkMode,
  } = usePiNetwork();
  const { t } = useLanguage();

  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [sendMemo, setSendMemo] = useState("");

  const handleSend = async () => {
    const amount = parseFloat(sendAmount);
    if (!amount || amount <= 0) {
      toast.error("أدخل مبلغ صحيح / Enter a valid amount");
      return;
    }
    await createPayment(amount, sendMemo || "Pi Payment", {});
    setSendAmount("");
    setSendMemo("");
    setShowSendDialog(false);
  };

  const copyPiUid = () => {
    if (piUser?.uid) {
      navigator.clipboard.writeText(piUser.uid);
      toast.success("تم نسخ معرف Pi / Pi UID copied");
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-border/50 relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src={piWalletBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
        <CardContent className="p-4 space-y-4 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img src={piLogo} alt="Pi" className="w-10 h-10 rounded-full shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground text-sm">Pi Network</h4>
                  {isAuthenticated && (
                    <Badge variant="outline" className="text-[10px]">
                      {t("متصل")}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">{networkLabel}</p>
                {isAuthenticated && piUser ? (
                  <p className="text-xs text-muted-foreground truncate">
                    {piUser.username || piUser.uid}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {isPiBrowser ? t("اضغط للاتصال") : t("يتطلب Pi Browser")}
                  </p>
                )}
              </div>
            </div>

            {!isAuthenticated ? (
              <Button
                size="sm"
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary/10 shrink-0"
                onClick={authenticate}
                disabled={!isPiBrowser || isInitializing}
              >
                {isInitializing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-1" />
                    {t("اتصال")}
                  </>
                )}
              </Button>
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
          </div>

          {/* Connected: Balance & Actions */}
          {isAuthenticated && piUser && (
            <div className="space-y-3 pt-2 border-t border-border/30">
              {/* Testnet balance display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{t("الرصيد")}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground" dir="ltr">
                    {networkMode === 'testnet' ? '— π (Testnet)' : '— π'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {networkMode === 'testnet' 
                      ? 'الرصيد يظهر بعد أول معاملة' 
                      : 'Pi Mainnet'}
                  </p>
                </div>
              </div>

              {/* Pi UID */}
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-2">
                <div>
                  <p className="text-[10px] text-muted-foreground">Pi UID</p>
                  <p className="text-xs font-mono truncate max-w-[180px]" dir="ltr">{piUser.uid}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copyPiUid}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>

              {/* Send / Receive buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setShowSendDialog(true)}
                  disabled={isProcessing}
                >
                  <Send className="w-3.5 h-3.5" />
                  {t("إرسال")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setShowReceiveDialog(true)}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  {t("استلام")}
                </Button>
              </div>
            </div>
          )}

          {/* Network Selector */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">اختيار الشبكة / Network</p>
            <div className="grid grid-cols-2 gap-2">
              {PI_NETWORK_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={networkMode === option.value ? "default" : "outline"}
                  className="h-auto flex-col items-start px-3 py-2"
                  onClick={() => setNetworkMode(option.value)}
                >
                  <span className="text-xs font-semibold">{option.label}</span>
                  <span className="text-[10px] opacity-70">{option.description}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              {t("إرسال Pi")} ({networkLabel})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("المبلغ")} (π)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                dir="ltr"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("ملاحظة")} (Memo)</label>
              <Input
                placeholder="Payment memo..."
                value={sendMemo}
                onChange={(e) => setSendMemo(e.target.value)}
                dir="ltr"
              />
            </div>
            {networkMode === 'testnet' && (
              <p className="text-xs text-yellow-600 bg-yellow-500/10 rounded-lg p-2">
                ⚠️ أنت تستخدم شبكة Testnet - لن يتم خصم أموال حقيقية
              </p>
            )}
            <Button 
              onClick={handleSend} 
              disabled={isProcessing || !sendAmount}
              className="w-full"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {t("إرسال")} {sendAmount ? `${sendAmount} π` : ''}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receive Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5" />
              {t("استلام Pi")} ({networkLabel})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/15 flex items-center justify-center text-3xl font-bold text-primary">
              π
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-xs text-muted-foreground">Pi Username</p>
              <p className="font-bold text-lg">{piUser?.username || '—'}</p>
              <p className="text-xs text-muted-foreground mt-2">Pi UID</p>
              <p className="font-mono text-xs break-all">{piUser?.uid}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={copyPiUid}>
                <Copy className="w-3 h-3 mr-1" /> {t("نسخ")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              شارك اسم المستخدم أو المعرف لاستلام Pi عبر {networkLabel}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
