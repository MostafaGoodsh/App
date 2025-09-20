import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { 
  ArrowLeftRight, TrendingUp, RefreshCw, 
  Coins, Zap, AlertTriangle, CheckCircle 
} from "lucide-react";

interface CurrencyExchangeProps {
  wallet: ConnectedWallet;
  availableTokens: Token[];
  onSwap: (fromToken: string, toToken: string, amount: string) => Promise<void>;
}

interface Token {
  symbol: string;
  name: string;
  network: string;
  balance: string;
  price: number;
  icon?: string;
}

const defaultTokens: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', network: 'Ethereum', balance: '0', price: 2000, icon: '⟠' },
  { symbol: 'USDC', name: 'USD Coin', network: 'Ethereum', balance: '0', price: 1, icon: '💵' },
  { symbol: 'USDT', name: 'Tether', network: 'Ethereum', balance: '0', price: 1, icon: '💰' },
  { symbol: 'SOL', name: 'Solana', network: 'Solana', balance: '0', price: 100, icon: '◎' },
  { symbol: 'MATIC', name: 'Polygon', network: 'Polygon', balance: '0', price: 0.8, icon: '⬟' },
  { symbol: 'BNB', name: 'Binance Coin', network: 'BSC', balance: '0', price: 300, icon: '◆' },
];

export const CurrencyExchange = ({ 
  wallet, 
  availableTokens = defaultTokens,
  onSwap 
}: CurrencyExchangeProps) => {
  const { toast } = useToast();
  const [fromToken, setFromToken] = useState(wallet.currency);
  const [toToken, setToToken] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Filter tokens based on current network
  const networkTokens = availableTokens.filter(token => 
    token.network === wallet.network
  );

  // Add current wallet token if not in list
  if (!networkTokens.find(t => t.symbol === wallet.currency)) {
    networkTokens.unshift({
      symbol: wallet.currency,
      name: wallet.currency,
      network: wallet.network,
      balance: wallet.balance || '0',
      price: wallet.currency === 'ETH' ? 2000 : wallet.currency === 'SOL' ? 100 : 1,
      icon: wallet.currency === 'ETH' ? '⟠' : wallet.currency === 'SOL' ? '◎' : '💰'
    });
  }

  const fromTokenData = networkTokens.find(t => t.symbol === fromToken);
  const toTokenData = networkTokens.find(t => t.symbol === toToken);

  // Calculate exchange rate and to amount
  useEffect(() => {
    if (fromTokenData && toTokenData && fromAmount) {
      setIsCalculating(true);
      
      // Simulate API call delay
      const timer = setTimeout(() => {
        const rate = fromTokenData.price / toTokenData.price;
        const calculatedAmount = (parseFloat(fromAmount) * rate).toFixed(6);
        
        setExchangeRate(rate);
        setToAmount(calculatedAmount);
        setIsCalculating(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [fromToken, toToken, fromAmount, fromTokenData, toTokenData]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى ملء جميع الحقول بقيم صحيحة",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(fromAmount) > parseFloat(fromTokenData?.balance || '0')) {
      toast({
        title: "الرصيد غير كافي",
        description: "المبلغ المطلوب أكبر من الرصيد المتاح",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    try {
      await onSwap(fromToken, toToken, fromAmount);
      
      toast({
        title: "تم التبديل بنجاح",
        description: `تم تبديل ${fromAmount} ${fromToken} إلى ${toAmount} ${toToken}`
      });
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      
    } catch (error: any) {
      toast({
        title: "فشل في التبديل",
        description: error.message || "حدث خطأ أثناء عملية التبديل",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const fee = fromAmount ? (parseFloat(fromAmount) * 0.003).toFixed(6) : '0'; // 0.3% fee

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5" />
          تبديل العملات
        </CardTitle>
        <CardDescription>
          تبديل العملات الرقمية على شبكة {wallet.network}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* From Token */}
        <div className="space-y-3">
          <Label>من العملة</Label>
          <div className="flex gap-3">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {networkTokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center gap-2">
                      <span>{token.icon}</span>
                      <span>{token.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1"
            />
          </div>
          {fromTokenData && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>الرصيد: {fromTokenData.balance} {fromToken}</span>
              <span>${(parseFloat(fromAmount || '0') * fromTokenData.price).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSwapTokens}
            className="rounded-full h-10 w-10 p-0"
            disabled={!fromToken || !toToken}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-3">
          <Label>إلى العملة</Label>
          <div className="flex gap-3">
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="اختر" />
              </SelectTrigger>
              <SelectContent>
                {networkTokens
                  .filter(token => token.symbol !== fromToken)
                  .map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <span>{token.icon}</span>
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.0"
              value={toAmount}
              disabled
              className="flex-1"
            />
          </div>
          {toTokenData && toAmount && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>المقدار المتوقع</span>
              <span>${(parseFloat(toAmount) * toTokenData.price).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Exchange Rate & Details */}
        {fromTokenData && toTokenData && exchangeRate > 0 && (
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">سعر التبديل</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  1 {fromToken} = {exchangeRate.toFixed(6)} {toToken}
                </span>
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>رسوم التبديل (0.3%)</span>
              <span>{fee} {fromToken}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>الحد الأدنى المستلم</span>
              <span>{(parseFloat(toAmount) * 0.98).toFixed(6)} {toToken}</span>
            </div>
          </div>
        )}

        {/* Warning */}
        {parseFloat(fromAmount || '0') > parseFloat(fromTokenData?.balance || '0') && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">الرصيد غير كافي لإتمام هذه المعاملة</span>
          </div>
        )}

        {/* Swap Button */}
        <Button 
          onClick={handleSwap}
          disabled={
            !fromToken || 
            !toToken || 
            !fromAmount || 
            parseFloat(fromAmount) <= 0 ||
            parseFloat(fromAmount) > parseFloat(fromTokenData?.balance || '0') ||
            isSwapping ||
            isCalculating
          }
          className="w-full h-12"
        >
          {isSwapping ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              جاري التبديل...
            </>
          ) : isCalculating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              جاري الحساب...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              تبديل {fromToken} إلى {toToken}
            </>
          )}
        </Button>

        {/* Network Badge */}
        <div className="text-center">
          <Badge variant="outline" className="px-3 py-1">
            <Coins className="w-3 h-3 mr-1" />
            شبكة {wallet.network}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};