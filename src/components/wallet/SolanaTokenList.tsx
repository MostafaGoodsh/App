import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSolanaTokens, SolanaToken } from "@/hooks/useSolanaTokens";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { 
  Coins, Plus, RefreshCw, ExternalLink, Copy, Send, ArrowUpDown
} from "lucide-react";

interface SolanaTokenListProps {
  wallet: ConnectedWallet;
  onSendToken?: (token: SolanaToken) => void;
}

export const SolanaTokenList = ({ wallet, onSendToken }: SolanaTokenListProps) => {
  const { toast } = useToast();
  const { tokens, isLoading, fetchTokenAccounts, addCustomToken } = useSolanaTokens();
  const [addTokenDialog, setAddTokenDialog] = useState(false);
  const [customMintAddress, setCustomMintAddress] = useState("");
  const [isAddingToken, setIsAddingToken] = useState(false);

  useEffect(() => {
    if (wallet?.address && wallet?.network === 'solana') {
      fetchTokenAccounts(wallet.address);
    }
  }, [wallet.address, wallet.network, fetchTokenAccounts]);

  // الاستماع لأحداث التبديل
  useEffect(() => {
    const handleSwapComplete = () => {
      if (wallet?.address && wallet?.network === 'solana') {
        fetchTokenAccounts(wallet.address);
      }
    };

    window.addEventListener('solana-swap-completed', handleSwapComplete);
    return () => window.removeEventListener('solana-swap-completed', handleSwapComplete);
  }, [wallet?.address, wallet?.network, fetchTokenAccounts]);

  const handleRefreshTokens = async () => {
    try {
      await fetchTokenAccounts(wallet.address);
      toast({ title: "تم التحديث", description: "تم تحديث قائمة العملات" });
    } catch (error) {
      toast({ 
        title: "خطأ في التحديث", 
        description: "فشل في تحديث العملات",
        variant: "destructive" 
      });
    }
  };

  const handleAddCustomToken = async () => {
    if (!customMintAddress.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال عنوان العملة", variant: "destructive" });
      return;
    }

    setIsAddingToken(true);
    try {
      await addCustomToken(customMintAddress.trim(), wallet.address);
      toast({ 
        title: "تم الإضافة", 
        description: "تم إضافة العملة بنجاح" 
      });
      setAddTokenDialog(false);
      setCustomMintAddress("");
    } catch (error: any) {
      toast({ 
        title: "فشل في الإضافة", 
        description: error.message || "حدث خطأ أثناء إضافة العملة",
        variant: "destructive" 
      });
    } finally {
      setIsAddingToken(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({ title: "تم النسخ", description: "تم نسخ العنوان إلى الحافظة" });
  };

  const openSolscan = (mintAddress: string) => {
    window.open(`https://solscan.io/token/${mintAddress}?cluster=devnet`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            العملات ({tokens.length})
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshTokens}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={addTokenDialog} onOpenChange={setAddTokenDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة عملة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>إضافة عملة مخصصة</DialogTitle>
                  <DialogDescription>
                    أدخل عنوان العقد (Mint Address) للعملة التي تريد إضافتها
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mint-address">عنوان العقد</Label>
                    <Input
                      id="mint-address"
                      placeholder="مثال: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                      value={customMintAddress}
                      onChange={(e) => setCustomMintAddress(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleAddCustomToken} 
                      className="flex-1"
                      disabled={isAddingToken}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isAddingToken ? "جاري الإضافة..." : "إضافة"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setAddTokenDialog(false)}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
        <CardDescription>
          عملات Solana وعملاتك المحولة في محفظة {wallet.name || wallet.type}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="mr-2">جاري تحميل العملات...</span>
          </div>
        ) : tokens.length > 0 ? (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.mintAddress}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {token.logoUri ? (
                    <img 
                      src={token.logoUri} 
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      token.isConverted ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Coins className={`w-4 h-4 ${token.isConverted ? 'text-primary' : ''}`} />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{token.symbol}</p>
                      {token.isConverted && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          محول
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{token.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">{token.balance}</p>
                    <Badge variant="outline" className="text-xs">
                      {token.symbol}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-1">
                    {/* Send/Transfer button */}
                    {onSendToken && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSendToken(token)}
                        className="h-8 w-8 p-0"
                        title="إرسال العملة"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyAddress(token.mintAddress)}
                      className="h-8 w-8 p-0"
                      title="نسخ العنوان"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    
                    {!token.isConverted && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openSolscan(token.mintAddress)}
                        className="h-8 w-8 p-0"
                        title="عرض في Solscan"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {token.isConverted && token.mintAddress !== 'converted-token' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openSolscan(token.mintAddress)}
                        className="h-8 w-8 p-0"
                        title="عرض في Solscan"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-2">لا توجد عملات</p>
            <p className="text-xs">قم بإضافة عملة مخصصة أو احصل على عملات أولاً</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};