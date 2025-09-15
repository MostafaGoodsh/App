import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInternalWallet, InternalToken } from '@/hooks/useInternalWallet';
import { Wallet, RefreshCw, Send, Gift, Copy, Coins } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface InternalWalletCardProps {
  onSendToken?: (token: InternalToken | null) => void;
}

export const InternalWalletCard = ({ onSendToken }: InternalWalletCardProps) => {
  const { user } = useAuth();
  const { tokens, isLoading, requestAirdrop, refreshBalances } = useInternalWallet();
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);

  const solToken = tokens.find(token => token.symbol === 'SOL');
  const otherTokens = tokens.filter(token => token.symbol !== 'SOL');

  const handleCopyAddress = () => {
    if (user?.id) {
      navigator.clipboard.writeText(`wallet-${user.id}`);
      toast({
        title: "تم النسخ",
        description: "تم نسخ معرف المحفظة",
      });
    }
  };

  const handleAirdrop = async () => {
    setIsRequesting(true);
    try {
      await requestAirdrop(1);
      toast({
        title: "تم استلام الـ Airdrop",
        description: "تم إضافة 1 SOL إلى محفظتك",
      });
    } catch (error) {
      console.error('Airdrop error:', error);
      toast({
        title: "خطأ في الـ Airdrop",
        description: "حدث خطأ أثناء طلب SOL مجاني",
        variant: "destructive"
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSendToken = (token: InternalToken | null) => {
    onSendToken?.(token);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            <span className="arabic-text">المحفظة الداخلية</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground arabic-text">
            يجب تسجيل الدخول لاستخدام المحفظة
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            <span className="arabic-text">المحفظة الداخلية</span>
          </div>
          <Badge variant="secondary">نشطة</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* معرف المحفظة */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm font-mono">
            wallet-{user.id.slice(0, 8)}...{user.id.slice(-8)}
          </span>
          <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        {/* رصيد SOL */}
        {solToken && (
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground arabic-text">رصيد SOL</p>
                <p className="text-2xl font-bold">{solToken.balance.toFixed(4)} SOL</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAirdrop}
                  disabled={isRequesting}
                >
                  <Gift className="w-4 h-4 mr-1" />
                  <span className="arabic-text">
                    {isRequesting ? "جاري..." : "Airdrop"}
                  </span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSendToken(null)}>
                  <Send className="w-4 h-4 mr-1" />
                  <span className="arabic-text">إرسال</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* أرصدة العملات الأخرى */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium arabic-text">العملات الأخرى</h4>
            <Button variant="ghost" size="sm" onClick={refreshBalances} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {otherTokens.map((token) => (
            <div key={token.symbol} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{token.symbol}</p>
                  <p className="text-sm text-muted-foreground">{token.name}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <p className="font-medium">{token.balance.toFixed(4)}</p>
                {token.balance > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSendToken(token)}
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};