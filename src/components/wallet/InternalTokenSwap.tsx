import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useInternalWallet } from '@/hooks/useInternalWallet';

// أسعار الصرف التجريبية
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  'SOL': {
    'USDC': 140.50,
    'MSRA': 25.75
  },
  'USDC': {
    'SOL': 0.0071,
    'MSRA': 0.183
  },
  'MSRA': {
    'SOL': 0.0388,
    'USDC': 5.464
  }
};

export const InternalTokenSwap = () => {
  const { tokens, swapTokens } = useInternalWallet();
  const { toast } = useToast();
  
  const [fromToken, setFromToken] = useState<string>('');
  const [toToken, setToToken] = useState<string>('');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState(false);

  const availableTokens = tokens.filter(token => token.balance > 0);
  const selectedFromToken = tokens.find(token => token.symbol === fromToken);
  const selectedToToken = tokens.find(token => token.symbol === toToken);

  const getExchangeRate = (from: string, to: string): number => {
    return EXCHANGE_RATES[from]?.[to] || 0;
  };

  const calculateToAmount = (): number => {
    if (!fromToken || !toToken || !fromAmount) return 0;
    const rate = getExchangeRate(fromToken, toToken);
    return parseFloat(fromAmount) * rate;
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى اختيار العملات وإدخال الكمية",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(fromAmount);
    const fromBalance = selectedFromToken?.balance || 0;

    if (amount <= 0) {
      toast({
        title: "كمية غير صحيحة",
        description: "يرجى إدخال كمية صحيحة أكبر من الصفر",
        variant: "destructive"
      });
      return;
    }

    if (amount > fromBalance) {
      toast({
        title: "رصيد غير كافي",
        description: `الرصيد المتاح: ${fromBalance.toFixed(4)} ${fromToken}`,
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    try {
      const rate = getExchangeRate(fromToken, toToken);
      const { fromAmount: swappedFrom, toAmount } = swapTokens(fromToken, toToken, amount, rate);
      
      // إرسال حدث مخصص لتحديث المكونات الأخرى
      window.dispatchEvent(new CustomEvent('internal-wallet-swap-completed', {
        detail: {
          fromToken,
          toToken,
          fromAmount: swappedFrom,
          toAmount,
          rate
        }
      }));
      
      toast({
        title: "تم التبديل بنجاح! 🎉",
        description: `تم تبديل ${swappedFrom.toFixed(4)} ${fromToken} بـ ${toAmount.toFixed(4)} ${toToken}`,
      });

      // إعادة تعيين النموذج
      setFromAmount('');
      
    } catch (error) {
      console.error('Swap error:', error);
      toast({
        title: "خطأ في التبديل",
        description: "حدث خطأ أثناء عملية التبديل",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const switchTokens = () => {
    if (fromToken && toToken) {
      setFromToken(toToken);
      setToToken(fromToken);
      setFromAmount('');
    }
  };

  const toAmount = calculateToAmount();
  const rate = fromToken && toToken ? getExchangeRate(fromToken, toToken) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5" />
          <span className="arabic-text">تبديل العملات</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* تحذير DevNet */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200 arabic-text">
            ⚠️ محاكاة تبديل العملات - أسعار تجريبية فقط
          </p>
        </div>

        {/* من العملة */}
        <div className="space-y-2">
          <Label htmlFor="from-token" className="arabic-text">من العملة</Label>
          <Select value={fromToken} onValueChange={setFromToken}>
            <SelectTrigger>
              <SelectValue placeholder="اختر العملة المصدر" />
            </SelectTrigger>
            <SelectContent>
              {availableTokens.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex items-center justify-between w-full">
                    <span>{token.symbol} - {token.name}</span>
                    <span className="text-muted-foreground mr-2">
                      {token.balance.toFixed(4)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedFromToken && (
            <p className="text-xs text-muted-foreground arabic-text">
              الرصيد المتاح: {selectedFromToken.balance.toFixed(4)} {selectedFromToken.symbol}
            </p>
          )}
        </div>

        {/* كمية التبديل */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="arabic-text">الكمية</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            disabled={!fromToken}
          />
        </div>

        {/* زر التبديل */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={switchTokens}
            disabled={!fromToken || !toToken}
            className="rounded-full p-2 h-10 w-10"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>

        {/* إلى العملة */}
        <div className="space-y-2">
          <Label htmlFor="to-token" className="arabic-text">إلى العملة</Label>
          <Select value={toToken} onValueChange={setToToken}>
            <SelectTrigger>
              <SelectValue placeholder="اختر العملة المستهدفة" />
            </SelectTrigger>
            <SelectContent>
              {tokens
                .filter(token => token.symbol !== fromToken)
                .map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center justify-between w-full">
                      <span>{token.symbol} - {token.name}</span>
                      <span className="text-muted-foreground mr-2">
                        {token.balance.toFixed(4)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* النتيجة المتوقعة */}
        {fromToken && toToken && fromAmount && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground arabic-text">ستحصل على:</span>
              <span className="font-medium">{toAmount.toFixed(4)} {toToken}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground arabic-text">سعر الصرف:</span>
              <span className="text-sm">1 {fromToken} = {rate.toFixed(4)} {toToken}</span>
            </div>
          </div>
        )}

        {/* زر التنفيذ */}
        <Button 
          onClick={handleSwap}
          disabled={!fromToken || !toToken || !fromAmount || isSwapping || parseFloat(fromAmount) <= 0}
          className="w-full"
        >
          {isSwapping ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              <span className="arabic-text">جاري التبديل...</span>
            </>
          ) : (
            <span className="arabic-text">تنفيذ التبديل</span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};