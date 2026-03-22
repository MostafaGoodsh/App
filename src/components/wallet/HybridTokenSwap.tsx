import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInternalWallet } from '@/hooks/useInternalWallet';
import { ArrowUpDown, Zap, Calculator, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { TokenContractManager } from './TokenContractManager';
import msraIcon from '@/assets/msra-token-icon.jpg';

interface HybridTokenSwapProps {
  solanaNetwork?: 'devnet' | 'mainnet';
}

export const HybridTokenSwap = ({ solanaNetwork = 'devnet' }: HybridTokenSwapProps) => {
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
  const [showContractManager, setShowContractManager] = useState(false);

  // Filter: only $MS-RA and network tokens (exclude XP and ANUBIS_ tokens)
  const swappableTokens = tokens.filter(t => 
    t.symbol === '$MS-RA' || 
    (!t.symbol.startsWith('ANUBIS_') && t.symbol !== 'XP')
  );

  const fromTokenBalance = getTokenBalance(fromToken);
  const exchangeRate = getExchangeRate(fromToken, toToken);
  const estimatedOutput = amount && !isNaN(Number(amount)) 
    ? (Number(amount) * exchangeRate).toFixed(4)
    : '0';

  const handleSwap = async () => {
    if (!fromToken || !toToken || !amount || Number(amount) <= 0) return;
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

  const swapDirection = () => {
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

  const getTokenIcon = (symbol: string) => {
    if (symbol === '$MS-RA') {
      return <img src={msraIcon} alt="$MS-RA" className="w-6 h-6 rounded-full object-cover" />;
    }
    return (
      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-[10px] font-bold">
        {symbol.replace('$', '').slice(0, 2)}
      </div>
    );
  };

  return (
    <div className="space-y-4" dir="rtl">
      <Card className="w-full max-w-full overflow-hidden border-primary/20">
        <CardHeader className="text-right">
          <CardTitle className="flex items-center gap-2 font-cairo">
            <Zap className="w-5 h-5 text-primary" />
            <div>
              <span className="font-cairo">تبديل سريع</span>
              <span className="text-xs text-muted-foreground/70 block font-normal" dir="ltr">Quick Swap</span>
            </div>
          </CardTitle>
          <CardDescription className="font-cairo text-right">
            تبديل فوري بين عملة المنصة وعملات الشبكة
            <span className="text-xs block opacity-70" dir="ltr">Swap platform token with network tokens</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* من - From */}
          <div className="space-y-2">
            <Label className="font-cairo text-sm block text-right">
              من <span className="text-xs text-muted-foreground opacity-70">From</span>
            </Label>
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="font-cairo text-right w-full" dir="rtl">
                <SelectValue placeholder="اختر العملة | Select token" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {swappableTokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center gap-2 font-cairo">
                      {getTokenIcon(token.symbol)}
                      <span>{token.name}</span>
                      <span className="text-muted-foreground text-xs" dir="ltr">({token.symbol})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative mt-2">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-left pr-3 pl-16"
                dir="ltr"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs font-cairo"
                onClick={setMaxAmount}
                disabled={!fromToken}
              >
                الكل <span className="text-[10px] opacity-70 mr-1">Max</span>
              </Button>
            </div>
            
            {fromToken && (
              <div className="text-sm text-muted-foreground font-cairo text-right">
                الرصيد <span className="text-[10px] opacity-70">Balance</span>: {' '}
                <span dir="ltr" className="font-mono">
                  {fromTokenBalance.toLocaleString('en', { maximumFractionDigits: 4 })}
                </span>{' '}
                <span dir="ltr">{fromToken}</span>
              </div>
            )}
          </div>

          {/* زر تبديل الاتجاه */}
          <div className="flex justify-center py-1">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-primary/30 hover:bg-primary/10"
              onClick={swapDirection}
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          {/* إلى - To */}
          <div className="space-y-2">
            <Label className="font-cairo text-sm block text-right">
              إلى <span className="text-xs text-muted-foreground opacity-70">To</span>
            </Label>
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="font-cairo text-right w-full" dir="rtl">
                <SelectValue placeholder="اختر العملة | Select token" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {swappableTokens.filter(t => t.symbol !== fromToken).map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center gap-2 font-cairo">
                      {getTokenIcon(token.symbol)}
                      <span>{token.name}</span>
                      <span className="text-muted-foreground text-xs" dir="ltr">({token.symbol})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {toToken && fromToken && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 mt-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2 font-cairo">
                  <Calculator className="w-4 h-4 shrink-0" />
                  <span>التقدير</span>
                  <span className="text-[10px] opacity-70">Estimate</span>
                </div>
                <div className="text-lg font-bold text-primary break-all" dir="ltr">
                  {estimatedOutput} {toToken}
                </div>
                <div className="text-xs text-muted-foreground font-cairo mt-1">
                  معدل التبديل <span className="opacity-70">Rate</span>:{' '}
                  <span dir="ltr" className="inline-block">1 {fromToken} = {exchangeRate.toFixed(4)} {toToken}</span>
                </div>
              </div>
            )}
          </div>

          {/* زر التبديل */}
          <Button 
            onClick={handleSwap}
            disabled={!canSwap || isSwapping || isLoading}
            className="w-full font-cairo"
            size="lg"
          >
            {isSwapping ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span className="font-cairo">جاري التبديل...</span>
                <span className="text-xs opacity-70">Swapping</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="font-cairo">تبديل فوري</span>
                <span className="text-xs opacity-70">Instant Swap</span>
              </div>
            )}
          </Button>

          {/* إضافة عقد */}
          <Button
            variant="outline"
            size="sm"
            className="w-full font-cairo border-primary/20 hover:bg-primary/5"
            onClick={() => setShowContractManager(!showContractManager)}
          >
            <FileText className="w-4 h-4 ml-2" />
            إضافة عقد عملة <span className="text-xs opacity-70 mr-1">Add Contract</span>
          </Button>

          {/* معلومات إضافية */}
          <div className="text-xs text-center text-muted-foreground space-y-1 font-cairo">
            <div className="flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-primary" />
              <span>تبديل فوري بدون رسوم</span>
              <span className="opacity-70" dir="ltr">• Zero Fees</span>
            </div>
            <div>
              تتم العملية داخل النظام بدون الحاجة لشبكة البلوك تشين
              <span className="block opacity-70 text-[10px]" dir="ltr">Internal system - No blockchain required</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Contract Manager */}
      {showContractManager && (
        <TokenContractManager 
            network={solanaNetwork === 'mainnet' ? 'solana-mainnet' : 'solana-devnet'}
          onTokenAdded={() => {
            setShowContractManager(false);
          }}
        />
      )}
    </div>
  );
};
