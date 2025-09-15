import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInternalWallet } from '@/hooks/useInternalWallet';
import { ArrowUpDown, Zap, Calculator } from 'lucide-react';
import { Label } from '@/components/ui/label';

export const HybridTokenSwap = () => {
  const { 
    tokens, 
    swapTokens, 
    getTokenBalance, 
    getExchangeRate, 
    isLoading 
  } = useInternalWallet();

  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  const fromTokenBalance = getTokenBalance(fromToken);
  const exchangeRate = getExchangeRate(fromToken, toToken);
  const estimatedOutput = amount && !isNaN(Number(amount)) 
    ? (Number(amount) * exchangeRate).toFixed(4)
    : '0';

  const handleSwap = async () => {
    if (!fromToken || !toToken || !amount || Number(amount) <= 0) {
      return;
    }

    try {
      setIsSwapping(true);
      await swapTokens(fromToken, toToken, Number(amount));
      setAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setIsSwapping(false);
    }
  };

  const swapTokens_ui = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const setMaxAmount = () => {
    setAmount(fromTokenBalance.toString());
  };

  const canSwap = fromToken && toToken && amount && 
    Number(amount) > 0 && Number(amount) <= fromTokenBalance &&
    fromToken !== toToken;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          تبديل سريع
        </CardTitle>
        <CardDescription>
          تبديل فوري بين العملات الداخلية بدون رسوم
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* العملة المرسلة */}
        <div className="space-y-2">
          <Label>من</Label>
          <div className="space-y-2">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger>
                <SelectValue placeholder="اختر العملة" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                        {token.symbol.slice(0, 2)}
                      </div>
                      <span>{token.name}</span>
                      <span className="text-muted-foreground">({token.symbol})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
                onClick={setMaxAmount}
                disabled={!fromToken}
              >
                الكل
              </Button>
            </div>
            
            {fromToken && (
              <div className="text-sm text-muted-foreground">
                الرصيد المتاح: {fromTokenBalance.toLocaleString('ar-SA', { maximumFractionDigits: 4 })} {fromToken}
              </div>
            )}
          </div>
        </div>

        {/* زر تبديل الاتجاه */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={swapTokens_ui}
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>

        {/* العملة المستلمة */}
        <div className="space-y-2">
          <Label>إلى</Label>
          <Select value={toToken} onValueChange={setToToken}>
            <SelectTrigger>
              <SelectValue placeholder="اختر العملة" />
            </SelectTrigger>
            <SelectContent>
              {tokens.filter(token => token.symbol !== fromToken).map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                      {token.symbol.slice(0, 2)}
                    </div>
                    <span>{token.name}</span>
                    <span className="text-muted-foreground">({token.symbol})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {toToken && fromToken && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-sm font-medium text-green-800 mb-1">
                <Calculator className="w-4 h-4" />
                التقدير
              </div>
              <div className="text-lg font-bold text-green-700">
                {estimatedOutput} {toToken}
              </div>
              <div className="text-xs text-green-600">
                معدل التبديل: 1 {fromToken} = {exchangeRate.toFixed(4)} {toToken}
              </div>
            </div>
          )}
        </div>

        {/* زر التبديل */}
        <Button 
          onClick={handleSwap}
          disabled={!canSwap || isSwapping || isLoading}
          className="w-full"
          size="lg"
        >
          {isSwapping ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري التبديل...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              تبديل فوري
            </div>
          )}
        </Button>

        {/* معلومات إضافية */}
        <div className="text-xs text-center text-muted-foreground space-y-1">
          <div className="flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span>تبديل فوري بدون رسوم</span>
          </div>
          <div>تتم العملية داخل النظام بدون الحاجة لشبكة البلوك تشين</div>
        </div>
      </CardContent>
    </Card>
  );
};