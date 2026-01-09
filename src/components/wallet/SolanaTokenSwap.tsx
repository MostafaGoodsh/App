import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { 
  ArrowLeftRight, TrendingUp, RefreshCw, Plus, Trash2,
  Coins, Zap, AlertTriangle, ExternalLink, Search
} from "lucide-react";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface SwapToken {
  symbol: string;
  name: string;
  mintAddress: string;
  decimals: number;
  balance: string;
  icon: string;
  verified: boolean;
}

// العملات الأساسية المدعومة
const DEFAULT_TOKENS: SwapToken[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mintAddress: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    balance: '0',
    icon: '◎',
    verified: true
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    balance: '0',
    icon: '💵',
    verified: true
  },
  {
    symbol: 'USDT',
    name: 'Tether USD', 
    mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    balance: '0',
    icon: '💰',
    verified: true
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    balance: '0',
    icon: '🐶',
    verified: true
  }
];

export const SolanaTokenSwap = () => {
  const { toast } = useToast();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  
  const [fromToken, setFromToken] = useState<SwapToken | null>(null);
  const [toToken, setToToken] = useState<SwapToken | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [tokens, setTokens] = useState<SwapToken[]>(DEFAULT_TOKENS);
  
  // إضافة عقد جديد
  const [newContractAddress, setNewContractAddress] = useState('');
  const [isAddingToken, setIsAddingToken] = useState(false);

  // تحميل العملات المحفوظة
  useEffect(() => {
    const savedTokens = localStorage.getItem('solanaSwapTokens');
    if (savedTokens) {
      const parsed = JSON.parse(savedTokens);
      setTokens([...DEFAULT_TOKENS, ...parsed]);
    }
  }, []);

  // محاكاة أسعار الصرف
  const getExchangeRate = (from: string, to: string): number => {
    const rates: Record<string, number> = {
      'SOL': 100,
      'USDC': 1,
      'USDT': 0.99,
      'BONK': 0.00001
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
        const calculatedAmount = (parseFloat(fromAmount) * rate * 0.97).toFixed(6);
        
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

  // إضافة عقد عملة جديد
  const handleAddToken = async () => {
    if (!newContractAddress.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان العقد",
        variant: "destructive"
      });
      return;
    }

    // التحقق من عدم وجود العملة مسبقاً
    if (tokens.find(t => t.mintAddress === newContractAddress)) {
      toast({
        title: "موجودة مسبقاً",
        description: "هذه العملة مضافة بالفعل",
        variant: "destructive"
      });
      return;
    }

    setIsAddingToken(true);
    try {
      // محاولة جلب معلومات العملة من Jupiter API
      const response = await fetch(`https://tokens.jup.ag/token/${newContractAddress}`);
      
      let newToken: SwapToken;
      
      if (response.ok) {
        const data = await response.json();
        newToken = {
          symbol: data.symbol || 'UNKNOWN',
          name: data.name || 'Unknown Token',
          mintAddress: newContractAddress,
          decimals: data.decimals || 9,
          balance: '0',
          icon: '🪙',
          verified: !!data.tags?.includes('verified')
        };
      } else {
        // إضافة كعملة غير موثقة
        newToken = {
          symbol: 'UNKNOWN',
          name: 'Custom Token',
          mintAddress: newContractAddress,
          decimals: 9,
          balance: '0',
          icon: '🪙',
          verified: false
        };
      }

      const customTokens = tokens.filter(t => !DEFAULT_TOKENS.find(d => d.mintAddress === t.mintAddress));
      localStorage.setItem('solanaSwapTokens', JSON.stringify([...customTokens, newToken]));
      
      setTokens([...tokens, newToken]);
      setNewContractAddress('');
      
      toast({
        title: "✅ تمت الإضافة",
        description: `تم إضافة ${newToken.symbol} بنجاح`,
      });
    } catch (error) {
      console.error('Error adding token:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة العملة",
        variant: "destructive"
      });
    } finally {
      setIsAddingToken(false);
    }
  };

  // حذف عملة مخصصة
  const handleRemoveToken = (mintAddress: string) => {
    const updatedTokens = tokens.filter(t => t.mintAddress !== mintAddress);
    const customTokens = updatedTokens.filter(t => !DEFAULT_TOKENS.find(d => d.mintAddress === t.mintAddress));
    localStorage.setItem('solanaSwapTokens', JSON.stringify(customTokens));
    setTokens(updatedTokens);
    
    toast({
      title: "تم الحذف",
      description: "تم حذف العملة من القائمة",
    });
  };

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

  // تنفيذ التبديل
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
        description: "يرجى ملء جميع الحقول",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    
    try {
      // محاكاة التبديل
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // تحديث الأرصدة محلياً
      setTokens(prevTokens => 
        prevTokens.map(token => {
          if (token.symbol === fromToken.symbol) {
            const newBalance = Math.max(0, parseFloat(token.balance) - parseFloat(fromAmount));
            return { ...token, balance: newBalance.toFixed(4) };
          } else if (token.symbol === toToken.symbol) {
            const newBalance = parseFloat(token.balance) + parseFloat(toAmount);
            return { ...token, balance: newBalance.toFixed(4) };
          }
          return token;
        })
      );

      window.dispatchEvent(new CustomEvent('solana-swap-completed', {
        detail: { fromToken: fromToken.symbol, toToken: toToken.symbol, fromAmount, toAmount }
      }));
      
      toast({
        title: "✅ تم التبادل بنجاح!",
        description: `${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol}`,
      });
      
      setFromAmount('');
      setToAmount('');
      
    } catch (error: any) {
      toast({
        title: "فشل التبادل",
        description: error.message || "حدث خطأ",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  // تحديث الأرصدة
  const updateBalances = async () => {
    if (!publicKey) return;
    
    try {
      const solBalance = await connection.getBalance(publicKey);
      const solBalanceInSol = (solBalance / LAMPORTS_PER_SOL).toFixed(4);
      
      setTokens(prevTokens => 
        prevTokens.map(token => 
          token.symbol === 'SOL' 
            ? { ...token, balance: solBalanceInSol }
            : token
        )
      );
      
      toast({ title: "تم التحديث", description: "تم تحديث الأرصدة" });
    } catch (error) {
      console.error('Balance update error:', error);
    }
  };

  const fee = fromAmount ? (parseFloat(fromAmount) * 0.003).toFixed(6) : '0';
  const fromTokenData = tokens.find(t => t.symbol === fromToken?.symbol);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            <div className="space-y-1">
              <span className="font-cairo" dir="rtl">تبادل العملات</span>
              <span className="text-sm font-normal text-muted-foreground block font-playfair" dir="ltr">
                Token Swap
              </span>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={updateBalances} disabled={!publicKey}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          تبادل العملات على شبكة Solana مع إضافة عقود مخصصة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* إضافة عقد جديد */}
        <div className="space-y-2">
          <Label className="text-sm">إضافة عقد عملة | Add Token Contract</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Mint Address..."
              value={newContractAddress}
              onChange={(e) => setNewContractAddress(e.target.value)}
              className="font-mono text-xs"
              dir="ltr"
            />
            <Button onClick={handleAddToken} disabled={isAddingToken} size="sm">
              {isAddingToken ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <Separator />

        {!publicKey ? (
          <div className="text-center py-4 space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800 dark:text-orange-200">
                  اتصل بمحفظة Phantom أولاً
                </span>
              </div>
            </div>
            <WalletMultiButton className="!bg-primary hover:!bg-primary/80 !rounded-md !h-10 !mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* From Token */}
            <div className="space-y-2">
              <Label>من العملة</Label>
              <div className="flex gap-2">
                <Select 
                  value={fromToken?.symbol || ''} 
                  onValueChange={(value) => setFromToken(tokens.find(t => t.symbol === value) || null)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.mintAddress} value={token.symbol}>
                        <div className="flex items-center gap-2">
                          <span>{token.icon}</span>
                          <span>{token.symbol}</span>
                          {!token.verified && <span className="text-xs text-yellow-500">⚠</span>}
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
                  <span>الرصيد: {fromTokenData.balance} {fromToken?.symbol}</span>
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => setFromAmount(fromTokenData.balance)}
                    disabled={parseFloat(fromTokenData.balance) === 0}
                    className="h-auto p-0 text-xs"
                  >
                    استخدام الكل
                  </Button>
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button size="sm" variant="ghost" onClick={handleSwapTokens} className="rounded-full h-10 w-10 p-0">
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <Label>إلى العملة</Label>
              <div className="flex gap-2">
                <Select 
                  value={toToken?.symbol || ''} 
                  onValueChange={(value) => setToToken(tokens.find(t => t.symbol === value) || null)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.filter(token => token.symbol !== fromToken?.symbol).map((token) => (
                      <SelectItem key={token.mintAddress} value={token.symbol}>
                        <div className="flex items-center gap-2">
                          <span>{token.icon}</span>
                          <span>{token.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="0.0" value={toAmount} disabled className="flex-1" />
              </div>
            </div>

            {/* Exchange Info */}
            {fromToken && toToken && exchangeRate > 0 && (
              <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>سعر التبديل</span>
                  <span className="flex items-center gap-1">
                    1 {fromToken.symbol} = {exchangeRate.toFixed(4)} {toToken.symbol}
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>الرسوم (0.3%)</span>
                  <span>{fee} {fromToken.symbol}</span>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <Button 
              onClick={handleSwap}
              disabled={!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0 || isSwapping}
              className="w-full"
            >
              {isSwapping ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />جاري التبادل...</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" />تبادل</>
              )}
            </Button>
          </div>
        )}

        <Separator />

        {/* قائمة العملات */}
        <div className="space-y-2">
          <Label className="text-sm">العملات المتاحة</Label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {tokens.map(token => (
              <div key={token.mintAddress} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                <div className="flex items-center gap-2">
                  <span>{token.icon}</span>
                  <span className="font-medium">{token.symbol}</span>
                  {token.verified ? (
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">موثق</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600">غير موثق</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6"
                    onClick={() => window.open(`https://solscan.io/token/${token.mintAddress}`, '_blank')}>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                  {!DEFAULT_TOKENS.find(d => d.mintAddress === token.mintAddress) && (
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive"
                      onClick={() => handleRemoveToken(token.mintAddress)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Badge variant="outline" className="px-3 py-1">
            <Coins className="w-3 h-3 mr-1" />
            شبكة Solana
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};