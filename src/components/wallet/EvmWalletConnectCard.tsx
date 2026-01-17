import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { getWalletConnectProjectId, setWalletConnectProjectId } from "@/config/wallet";
import { Copy, Link2, LogOut, RefreshCw, QrCode } from "lucide-react";

const shortenAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const EvmWalletConnectCard = () => {
  const { toast } = useToast();
  const { connectedWallet, connectWallet, disconnectWallet, refreshBalance, isConnecting } =
    useWalletConnect();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [projectId, setProjectId] = useState(() => getWalletConnectProjectId());
  const [projectIdDraft, setProjectIdDraft] = useState(projectId);

  const handleSaveProjectId = () => {
    const value = projectIdDraft.trim();
    if (!value) {
      toast({
        title: "خطأ",
        description: "من فضلك أدخل WalletConnect Project ID",
        variant: "destructive",
      });
      return;
    }

    setWalletConnectProjectId(value);
    setProjectId(value);
    toast({
      title: "تم الحفظ",
      description: "تم حفظ Project ID بنجاح",
    });
  };

  const handleClearProjectId = () => {
    setWalletConnectProjectId("");
    setProjectId("");
    setProjectIdDraft("");
    toast({
      title: "تم المسح",
      description: "تم مسح Project ID — أدخله من جديد ثم حاول الاتصال.",
    });
  };

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
      if (!projectId) {
        toast({
          title: "Project ID مطلوب",
          description: "أدخل WalletConnect Project ID ثم حاول مرة أخرى",
          variant: "destructive",
        });
        return;
      }

      // Preflight: avoid opening a modal that will load forever (403 / Project not found)
      const cfgUrl = `https://api.web3modal.org/appkit/v1/config?projectId=${encodeURIComponent(projectId)}&st=appkit&sv=html-core-1.7.8`;
      const res = await fetch(cfgUrl);
      if (!res.ok) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        toast({
          title: "WalletConnect غير جاهز",
          description:
            res.status === 403
              ? `Forbidden (403). غالبًا Project ID غير صحيح أو الدومين غير مضاف في WalletConnect Cloud. الدومين الحالي: ${origin}`
              : `تعذر التحقق من Project ID (HTTP ${res.status}).` ,
          variant: "destructive",
        });
        return;
      }

      await connectWallet();
      toast({
        title: "تم الاتصال",
        description: "تم توصيل WalletConnect بنجاح",
      });
    } catch (e: any) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const msg = e?.message || "فشل الاتصال بـ WalletConnect";
      toast({
        title: "خطأ",
        description: msg.includes('403') || msg.toLowerCase().includes('project not found')
          ? `${msg} (الدومين: ${origin})`
          : msg,
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

            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
              <div className="space-y-1">
                <p className="text-sm font-cairo" dir="rtl">WalletConnect Project ID</p>
                <p className="text-xs text-muted-foreground font-playfair" dir="ltr">
                  Required (public). If you see infinite loading, update it here.
                </p>
                {projectId ? (
                  <p className="text-xs text-muted-foreground font-mono" dir="ltr">
                    Current: {projectId.slice(0, 6)}...{projectId.slice(-4)}
                  </p>
                ) : null}
              </div>

              <div className="flex gap-2">
                <Input
                  value={projectIdDraft}
                  onChange={(e) => setProjectIdDraft(e.target.value)}
                  placeholder="e.g. 123abc..."
                  dir="ltr"
                  className="font-mono"
                />
                <Button type="button" variant="secondary" onClick={handleSaveProjectId}>
                  حفظ
                </Button>
                <Button type="button" variant="ghost" onClick={handleClearProjectId}>
                  مسح
                </Button>
              </div>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting || !projectId}
              className="w-full"
              size="lg"
            >
              <QrCode className="w-4 h-4 ml-2" />
              {isConnecting ? "جاري الاتصال..." : "اتصال عبر WalletConnect"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
