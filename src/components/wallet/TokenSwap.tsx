import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { useToast } from "@/hooks/use-toast";

interface TokenSwapProps {
  wallet: ConnectedWallet;
}

interface SwapToken {
  symbol: string;
  name: string;
  balance: string;
}

export const TokenSwap = ({ wallet }: TokenSwapProps) => {
  const { toast } = useToast();
  const [fromToken, setFromToken] = useState<string>("ETH");
  const [toToken, setToToken] = useState<string>("USDT");
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [isSwapping, setIsSwapping] = useState(false);

  // Available tokens for swapping
  const availableTokens: SwapToken[] = [
    { symbol: "ETH", name: "Ethereum", balance: wallet.balance },
    { symbol: "USDT", name: "Tether USD", balance: "0.0" },
    { symbol: "USDC", name: "USD Coin", balance: "0.0" },
    { symbol: "AAVE", name: "Aave", balance: "0.0" },
  ];

  const handleSwapTokens = () => {
    const tempFrom = fromToken;
    const tempFromAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempFrom);
    setFromAmount(toAmount);
    setToAmount(tempFromAmount);
  };

  const calculateToAmount = (amount: string) => {
    if (!amount || parseFloat(amount) === 0) {
      setToAmount("");
      return;
    }
    
    // Mock exchange rate calculation (1 ETH = 2500 USDT)
    let rate = 1;
    if (fromToken === "ETH" && toToken === "USDT") {
      rate = 2500;
    } else if (fromToken === "USDT" && toToken === "ETH") {
      rate = 1 / 2500;
    }
    
    const result = (parseFloat(amount) * rate).toFixed(6);
    setToAmount(result);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    calculateToAmount(value);
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صالح",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    
    try {
      // Mock swap implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "تم التبادل بنجاح",
        description: `تم تبديل ${fromAmount} ${fromToken} إلى ${toAmount} ${toToken}`,
      });
      
      setFromAmount("");
      setToAmount("");
    } catch (error) {
      toast({
        title: "فشل التبادل",
        description: "حدث خطأ أثناء عملية التبادل",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="arabic-text">تبادل الرموز المميزة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <label className="text-sm font-medium arabic-text">من</label>
          <div className="flex gap-2">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
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
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            الرصيد المتاح: {availableTokens.find(t => t.symbol === fromToken)?.balance || "0.0"} {fromToken}
          </p>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapTokens}
            className="rounded-full w-10 h-10 p-0"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <label className="text-sm font-medium arabic-text">إلى</label>
          <div className="flex gap-2">
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
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
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
              className="flex-1 bg-muted"
            />
          </div>
        </div>

        {/* Exchange Rate */}
        {fromAmount && toAmount && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <span className="arabic-text">سعر الصرف:</span> 1 {fromToken} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken}
            </p>
          </div>
        )}

        {/* Swap Button */}
        <Button 
          onClick={handleSwap}
          disabled={!fromAmount || parseFloat(fromAmount) === 0 || isSwapping}
          className="w-full"
          size="lg"
        >
          {isSwapping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="arabic-text">جاري التبادل...</span>
            </>
          ) : (
            <span className="arabic-text">تبديل الرموز</span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};