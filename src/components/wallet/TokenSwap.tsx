import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { useToast } from "@/hooks/use-toast";

interface SwapToken {
  symbol: string;
  name: string;
  balance: string;
}

interface TokenSwapProps {
  wallet: ConnectedWallet;
}

// Available tokens for swapping by network
const SWAP_TOKENS: Record<string, SwapToken[]> = {
  Ethereum: [
    { symbol: "ETH", name: "Ethereum", balance: "0.0" },
    { symbol: "USDT", name: "Tether USD", balance: "0.0" },
    { symbol: "USDC", name: "USD Coin", balance: "0.0" },
    { symbol: "AAVE", name: "Aave", balance: "0.0" },
  ],
  Polygon: [
    { symbol: "MATIC", name: "Polygon", balance: "0.0" },
    { symbol: "USDT", name: "Tether USD", balance: "0.0" },
    { symbol: "USDC", name: "USD Coin", balance: "0.0" },
    { symbol: "WMATIC", name: "Wrapped Matic", balance: "0.0" },
  ],
  BSC: [
    { symbol: "BNB", name: "BNB", balance: "0.0" },
    { symbol: "USDT", name: "Tether USD", balance: "0.0" },
    { symbol: "BUSD", name: "Binance USD", balance: "0.0" },
    { symbol: "WBNB", name: "Wrapped BNB", balance: "0.0" },
  ],
  Arbitrum: [
    { symbol: "ETH", name: "Ethereum", balance: "0.0" },
    { symbol: "USDT", name: "Tether USD", balance: "0.0" },
    { symbol: "USDC", name: "USD Coin", balance: "0.0" },
    { symbol: "WETH", name: "Wrapped Ether", balance: "0.0" },
  ]
};

export const TokenSwap = ({ wallet }: TokenSwapProps) => {
  const { toast } = useToast();
  const [fromToken, setFromToken] = useState<SwapToken | null>(null);
  const [toToken, setToToken] = useState<SwapToken | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);

  const availableTokens = SWAP_TOKENS[wallet.network] || [];

  const calculateToAmount = (amount: string) => {
    if (!amount || !fromToken || !toToken) return "0.0";
    
    // Mock exchange rate calculation
    const mockRate = 0.998; // 0.2% slippage
    const calculatedAmount = (parseFloat(amount) * mockRate).toFixed(6);
    return calculatedAmount;
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateToAmount(value));
  };

  const handleSwapTokens = () => {
    if (fromToken && toToken) {
      setFromToken(toToken);
      setToToken(fromToken);
      setFromAmount(toAmount);
      setToAmount(fromAmount);
    }
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) === 0) {
      toast({
        title: "خطأ في التبديل",
        description: "يرجى تحديد الرموز والمقدار",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    
    try {
      // Mock swap execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "تم التبديل بنجاح",
        description: `تم تبديل ${fromAmount} ${fromToken.symbol} إلى ${toAmount} ${toToken.symbol}`,
      });
      
      // Reset form
      setFromAmount("");
      setToAmount("");
    } catch (error) {
      toast({
        title: "خطأ في التبديل",
        description: "فشل في تنفيذ عملية التبديل",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5" />
          <span className="arabic-text">تبديل الرموز المميزة</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* From Token */}
        <div className="space-y-2">
          <Label className="arabic-text">من</Label>
          <div className="flex gap-2">
            <Select onValueChange={(value) => setFromToken(availableTokens.find(t => t.symbol === value) || null)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="اختر رمز" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="flex-1"
            />
          </div>
          {fromToken && (
            <p className="text-sm text-muted-foreground">
              الرصيد المتاح: {fromToken.symbol === wallet.currency ? wallet.balance : fromToken.balance} {fromToken.symbol}
            </p>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapTokens}
            disabled={!fromToken || !toToken}
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <Label className="arabic-text">إلى</Label>
          <div className="flex gap-2">
            <Select onValueChange={(value) => setToToken(availableTokens.find(t => t.symbol === value) || null)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="اختر رمز" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="flex-1 bg-muted"
            />
          </div>
        </div>

        {/* Exchange Rate */}
        {fromToken && toToken && fromAmount && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground arabic-text">
              معدل التبديل: 1 {fromToken.symbol} = 0.998 {toToken.symbol} (رسوم 0.2%)
            </p>
          </div>
        )}

        {/* Swap Button */}
        <Button 
          onClick={handleSwap}
          disabled={!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) === 0 || isSwapping}
          className="w-full"
          size="lg"
        >
          {isSwapping ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              <span className="arabic-text">جاري التبديل...</span>
            </>
          ) : (
            <span className="arabic-text">تبديل الرموز</span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};