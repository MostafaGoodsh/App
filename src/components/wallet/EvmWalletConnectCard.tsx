import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { Copy, Link2, LogOut, RefreshCw, QrCode } from "lucide-react";

const shortenAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const EvmWalletConnectCard = () => {
  const { toast } = useToast();
  const { connectedWallet, connectWallet, disconnectWallet, refreshBalance, isConnecting } =
    useWalletConnect();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = async () => {
    if (!connectedWallet?.address) return;
    await navigator.clipboard.writeText(connectedWallet.address);
    toast({
      title: "تم النسخ",
      description: "تم نسخ عنوان المحفظة",
    });
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast({
        title: "تم الاتصال",
        description: "تم توصيل WalletConnect بنجاح",
      });
    } catch (e: any) {
      toast({
        title: "خطأ",
        description: e?.message || "فشل الاتصال بـ WalletConnect",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    if (!connectedWallet) return;
    setIsRefreshing(true);
    try {
      await refreshBalance();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-t-lg border-b border-primary/20">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="w-5 h-5 text-primary" />
          <div className="space-y-1">
            <span className="font-cairo" dir="rtl">WalletConnect (EVM)</span>
            <span className="text-sm font-normal text-muted-foreground block font-playfair" dir="ltr">
              External EVM Wallet
            </span>
          </div>
        </CardTitle>
        <CardDescription>
          <span className="font-cairo" dir="rtl">اتصال بمحافظ EVM عبر QR</span>
          <span className="block text-xs text-muted-foreground font-playfair" dir="ltr">Connect via QR code</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {connectedWallet ? (
          <>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-primary/30 text-primary">
                متصل | Connected
              </Badge>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={disconnectWallet}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
              <span className="text-sm font-mono" dir="ltr">
                {shortenAddress(connectedWallet.address)}
              </span>
              <Badge variant="secondary">{connectedWallet.network}</Badge>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">الرصيد | Balance</p>
              <p className="text-2xl font-bold" dir="ltr">
                {Number(connectedWallet.balance || 0).toFixed(4)} {connectedWallet.currency}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">غير متصل</Badge>
              <span className="text-xs text-muted-foreground font-playfair" dir="ltr">
                Ethereum / Polygon / BSC ...
              </span>
            </div>

            <Button onClick={handleConnect} disabled={isConnecting} className="w-full" size="lg">
              <QrCode className="w-4 h-4 ml-2" />
              {isConnecting ? "جاري الاتصال..." : "اتصال عبر WalletConnect"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
