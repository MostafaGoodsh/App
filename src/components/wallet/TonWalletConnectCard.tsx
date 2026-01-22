import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTonConnectUI, useTonWallet, useTonAddress, TonConnectButton } from "@tonconnect/ui-react";
import { Copy, Link2, LogOut, RefreshCw, Wallet } from "lucide-react";

const shortenAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const TonWalletConnectCard = () => {
  const { toast } = useToast();
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();
  const [balance, setBalance] = useState<string>("0");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (!userFriendlyAddress) return;
      
      try {
        const response = await fetch(
          `https://tonapi.io/v2/accounts/${userFriendlyAddress}`
        );
        const data = await response.json();
        if (data.balance) {
          // Convert from nanoTON to TON
          const tonBalance = (Number(data.balance) / 1e9).toFixed(4);
          setBalance(tonBalance);
        }
      } catch (error) {
        console.error("Failed to fetch TON balance:", error);
      }
    };

    fetchBalance();
  }, [userFriendlyAddress]);

  const handleCopy = async () => {
    if (!userFriendlyAddress) return;
    await navigator.clipboard.writeText(userFriendlyAddress);
    toast({
      title: "تم النسخ",
      description: "تم نسخ عنوان المحفظة",
    });
  };

  const handleRefresh = async () => {
    if (!userFriendlyAddress) return;
    setIsRefreshing(true);
    try {
      const response = await fetch(
        `https://tonapi.io/v2/accounts/${userFriendlyAddress}`
      );
      const data = await response.json();
      if (data.balance) {
        const tonBalance = (Number(data.balance) / 1e9).toFixed(4);
        setBalance(tonBalance);
      }
      toast({
        title: "تم التحديث",
        description: "تم تحديث رصيد TON",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث الرصيد",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    await tonConnectUI.disconnect();
    setBalance("0");
  };

  const isConnected = !!wallet;

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-blue-500/20 via-blue-500/10 to-transparent rounded-t-lg border-b border-primary/20">
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
          <span className="block text-xs text-muted-foreground font-playfair" dir="ltr">Connect TON wallets</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {isConnected && userFriendlyAddress ? (
          <>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-blue-500/30 text-blue-500">
                متصل | Connected
              </Badge>
              <div className="flex items-center gap-2">
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
              <span className="text-sm font-mono" dir="ltr">
                {shortenAddress(userFriendlyAddress)}
              </span>
              <Badge variant="secondary">TON</Badge>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">الرصيد | Balance</p>
              <p className="text-2xl font-bold" dir="ltr">
                {balance} TON
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">غير متصل</Badge>
              <span className="text-xs text-muted-foreground font-playfair" dir="ltr">
                Tonkeeper / MyTonWallet
              </span>
            </div>

            <div className="flex justify-center py-4">
              <TonConnectButton />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
