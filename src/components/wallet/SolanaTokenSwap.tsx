import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { 
  ArrowLeftRight, TrendingUp, RefreshCw, 
  Coins, Zap, AlertTriangle, CheckCircle 
} from "lucide-react";
import { 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';

interface DevnetToken {
  symbol: string;
  name: string;
  mintAddress: string;
  decimals: number;
  balance: string;
  icon: string;
}

// Devnet test tokens - هذه عملات حقيقية على Devnet
const DEVNET_TOKENS: DevnetToken[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mintAddress: 'So11111111111111111111111111111111111111112', // Wrapped SOL
    decimals: 9,
    balance: '0',
    icon: '◎'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (Devnet)',
    mintAddress: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // USDC Devnet
    decimals: 6,
    balance: '0',
    icon: '💵'
  },
  {
    symbol: 'USDT',
    name: 'Tether USD (Devnet)', 
    mintAddress: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS', // USDT Devnet
    decimals: 6,
    balance: '0',
    icon: '💰'
  },
  {
    symbol: 'BONK',
    name: 'Bonk (Devnet)',
    mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK Devnet
    decimals: 5,
    balance: '0',
    icon: '🐶'
  }
];

export const SolanaTokenSwap = () => {
  const { toast } = useToast();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [fromToken, setFromToken] = useState<DevnetToken | null>(null);
  const [toToken, setToToken] = useState<DevnetToken | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [tokens, setTokens] = useState<DevnetToken[]>(DEVNET_TOKENS);

  // محاكاة أسعار الصرف
  const getExchangeRate = (from: string, to: string): number => {
    const rates: Record<string, number> = {
      'SOL': 50, // 1 SOL = 50 USDC
      'USDC': 1,
      'USDT': 0.99, // 1 USDT = 0.99 USDC
      'BONK': 0.00001 // 1 BONK = 0.00001 USDC
    };
    
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    
    return fromRate / toRate;
  };

  // حساب المقدار المستلم
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      setIsCalculating(true);
      
      const timer = setTimeout(() => {
        const rate = getExchangeRate(fromToken.symbol, toToken.symbol);
        const calculatedAmount = (parseFloat(fromAmount) * rate * 0.97).toFixed(6); // 3% slippage
        
        setExchangeRate(rate);
        setToAmount(calculatedAmount);
        setIsCalculating(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setToAmount('');
      setExchangeRate(0);
    }
  }, [fromToken, toToken, fromAmount]);

  // تبديل العملات
  const handleSwapTokens = () => {
    if (!fromToken || !toToken) return;
    
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  // تنفيذ التبديل (محاكاة)
  const handleSwap = async () => {
    if (!publicKey) {
      toast({
        title: "غير متصل",
        description: "يرجى الاتصال بالمحفظة أولاً",
        variant: "destructive"
      });
      return;
    }

    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى ملء جميع الحقول بقيم صحيحة",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    
    try {
      // هذا مجرد محاكاة - في التطبيق الحقيقي ستحتاج إلى DEX مثل Jupiter
      toast({
        title: "تبديل تجريبي",
        description: "هذا تبديل تجريبي على Devnet",
      });

      // محاكاة وقت المعاملة
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "تم التبديل بنجاح! 🎉",
        description: `تم تبديل ${fromAmount} ${fromToken.symbol} إلى ${toAmount} ${toToken.symbol}`,
      });
      
      // إعادة تعيين النموذج
      setFromAmount('');
      setToAmount('');
      
    } catch (error: any) {
      console.error('Swap error:', error);
      toast({
        title: "فشل في التبديل",
        description: error.message || "حدث خطأ أثناء عملية التبديل",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  // تحديث أرصدة العملات (محاكاة)
  const updateBalances = async () => {
    if (!publicKey) return;
    
    try {
      // الحصول على رصيد SOL
      const solBalance = await connection.getBalance(publicKey);
      const solBalanceInSol = (solBalance / LAMPORTS_PER_SOL).toFixed(4);
      
      // تحديث الأرصدة
      setTokens(prevTokens => 
        prevTokens.map(token => 
          token.symbol === 'SOL' 
            ? { ...token, balance: solBalanceInSol }
            : { ...token, balance: Math.random() > 0.5 ? (Math.random() * 100).toFixed(2) : '0' } // محاكاة أرصدة
        )
      );
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث أرصدة العملات"
      });
      
    } catch (error) {
      console.error('Balance update error:', error);
      toast({
        title: "خطأ في التحديث",
        description: "فشل في تحديث الأرصدة",
        variant: "destructive"
      });
    }
  };

  const fee = fromAmount ? (parseFloat(fromAmount) * 0.003).toFixed(6) : '0'; // 0.3% fee
  const fromTokenData = tokens.find(t => t.symbol === fromToken?.symbol);
  const toTokenData = tokens.find(t => t.symbol === toToken?.symbol);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            تبديل العملات - Devnet
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={updateBalances}
            disabled={!publicKey}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          تبديل العملات الرقمية على Solana Devnet (تجريبي)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!publicKey && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                يرجى الاتصال بمحفظة Phantom أولاً لبدء التبديل
              </span>
            </div>
          </div>
        )}

        {/* From Token */}
        <div className="space-y-3">
          <Label>من العملة</Label>
          <div className="flex gap-3">
            <Select 
              value={fromToken?.symbol || ''} 
              onValueChange={(value) => setFromToken(tokens.find(t => t.symbol === value) || null)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="اختر" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
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
              disabled={!publicKey}
            />
          </div>
          {fromTokenData && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>الرصيد: {fromTokenData.balance} {fromToken?.symbol}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFromAmount(fromTokenData.balance)}
                disabled={!publicKey || parseFloat(fromTokenData.balance) === 0}
                className="h-auto p-0 text-xs"
              >
                استخدام الكل
              </Button>
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
            disabled={!fromToken || !toToken || !publicKey}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-3">
          <Label>إلى العملة</Label>
          <div className="flex gap-3">
            <Select 
              value={toToken?.symbol || ''} 
              onValueChange={(value) => setToToken(tokens.find(t => t.symbol === value) || null)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="اختر" />
              </SelectTrigger>
              <SelectContent>
                {tokens
                  .filter(token => token.symbol !== fromToken?.symbol)
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
              <span>{toAmount} {toToken?.symbol}</span>
            </div>
          )}
        </div>

        {/* Exchange Rate & Details */}
        {fromToken && toToken && exchangeRate > 0 && (
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">سعر التبديل</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}
                </span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>رسوم التبديل (0.3%)</span>
              <span>{fee} {fromToken.symbol}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>الحد الأدنى المستلم</span>
              <span>{(parseFloat(toAmount) * 0.97).toFixed(6)} {toToken.symbol}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-orange-600 mt-2">
              <AlertTriangle className="w-3 h-3" />
              <span>هذا تطبيق تجريبي على Devnet - لا يتم تنفيذ معاملات حقيقية</span>
            </div>
          </div>
        )}

        {/* Warning */}
        {fromTokenData && parseFloat(fromAmount || '0') > parseFloat(fromTokenData.balance) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">الرصيد غير كافي لإتمام هذه المعاملة</span>
          </div>
        )}

        {/* Swap Button */}
        <Button 
          onClick={handleSwap}
          disabled={
            !publicKey ||
            !fromToken || 
            !toToken || 
            !fromAmount || 
            parseFloat(fromAmount) <= 0 ||
            (fromTokenData && parseFloat(fromAmount) > parseFloat(fromTokenData.balance)) ||
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
          ) : !publicKey ? (
            <>
              <AlertTriangle className="w-4 h-4 mr-2" />
              اتصل بالمحفظة أولاً
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              تبديل {fromToken?.symbol} إلى {toToken?.symbol}
            </>
          )}
        </Button>

        {/* Network Badge */}
        <div className="text-center">
          <Badge variant="outline" className="px-3 py-1">
            <Coins className="w-3 h-3 mr-1" />
            شبكة Solana Devnet
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};