import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useInternalWallet } from "@/hooks/useInternalWallet";
import { ArrowRight, Zap, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const XpToMsRaConverter = () => {
  const { toast } = useToast();
  const { balances, swapTokens, isLoading, getTokenBalance } = useInternalWallet();
  const [xpAmount, setXpAmount] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const xpBalance = getTokenBalance('XP');
  const msraBalance = getTokenBalance('MSRA');
  
  // معدل التحويل: 1000 XP = 1 MSRA
  const conversionRate = 1000;
  const msraAmount = xpAmount ? (parseFloat(xpAmount) / conversionRate).toFixed(4) : "0";

  const handleConvert = async () => {
    const amount = parseFloat(xpAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كمية صحيحة",
        variant: "destructive"
      });
      return;
    }

    if (amount < conversionRate) {
      toast({
        title: "خطأ",
        description: `الحد الأدنى للتحويل ${conversionRate} XP`,
        variant: "destructive"
      });
      return;
    }

    if (amount > xpBalance) {
      toast({
        title: "رصيد غير كافي",
        description: "ليس لديك رصيد XP كافي للتحويل",
        variant: "destructive"
      });
      return;
    }

    setIsConverting(true);
    try {
      await swapTokens('XP', 'MSRA', amount);
      
      toast({
        title: "تم التحويل بنجاح! 🎉",
        description: `تم تحويل ${amount} XP إلى ${msraAmount} MSRA`,
      });
      
      setXpAmount("");
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "خطأ في التحويل",
        description: "فشل في تحويل XP إلى MSRA. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  const setMaxAmount = () => {
    if (xpBalance > 0) {
      // Round down to nearest 1000
      const maxConvertible = Math.floor(xpBalance / conversionRate) * conversionRate;
      setXpAmount(maxConvertible.toString());
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="space-y-3">
        <CardTitle className="flex items-center justify-center gap-3 text-lg sm:text-xl">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">XP</span>
            <span className="text-muted-foreground">⟷</span>
            <span className="text-primary font-bold">Ms-Ra</span>
          </div>
        </CardTitle>
        <CardDescription className="text-center space-y-1">
          <div className="text-sm sm:text-base">استبدال النقاط</div>
          <div className="text-xs text-muted-foreground">Points Swap</div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            معدل التحويل: <strong>1,000 XP = 1 MSRA</strong>
            <br />
            الحد الأدنى: 1,000 XP
            <br />
            <span className="text-xs text-muted-foreground">
              Conversion Rate: 1,000 XP = 1 MSRA | Minimum: 1,000 XP
            </span>
          </AlertDescription>
        </Alert>

        {/* Current Balances */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-black/50 rounded-lg border border-yellow-600/30">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">رصيد XP</div>
            <div className="text-base sm:text-lg font-bold text-primary">
              {xpBalance.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground">XP Balance</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">رصيد MSRA</div>
            <div className="text-base sm:text-lg font-bold text-primary">
              {msraBalance.toFixed(4)}
            </div>
            <div className="text-[10px] text-muted-foreground">MSRA Balance</div>
          </div>
        </div>

        {/* Conversion Input */}
        <div className="space-y-2">
          <Label htmlFor="xp-amount" className="text-sm sm:text-base text-center block">
            <div>كمية XP للتحويل</div>
            <div className="text-xs text-muted-foreground">XP Amount to Convert</div>
          </Label>
          <div className="flex gap-2">
            <Input
              id="xp-amount"
              type="number"
              placeholder="0"
              value={xpAmount}
              onChange={(e) => setXpAmount(e.target.value)}
              min={conversionRate}
              step={conversionRate}
              disabled={isConverting || isLoading}
              className="text-center text-base sm:text-lg"
            />
            <Button
              variant="outline"
              onClick={setMaxAmount}
              disabled={isConverting || isLoading || xpBalance < conversionRate}
              className="whitespace-nowrap px-3 sm:px-4"
            >
              <span className="hidden sm:inline">الكل</span>
              <span className="sm:hidden">Max</span>
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            <span>الرصيد المتاح: {xpBalance.toLocaleString()} XP</span>
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> | </span>
            <span>Available Balance</span>
          </p>
        </div>

        {/* Conversion Preview */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-black/50 rounded-lg border border-yellow-600/20">
          <div className="text-center flex-1">
            <div className="text-xs sm:text-sm text-muted-foreground">تحويل</div>
            <div className="text-base sm:text-xl font-bold break-all">{xpAmount || "0"} XP</div>
            <div className="text-[10px] text-muted-foreground">Convert</div>
          </div>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <div className="text-center flex-1">
            <div className="text-xs sm:text-sm text-muted-foreground">تحصل على</div>
            <div className="text-base sm:text-xl font-bold text-primary break-all">{msraAmount} MSRA</div>
            <div className="text-[10px] text-muted-foreground">You Get</div>
          </div>
        </div>

        {/* Convert Button */}
        <Button
          onClick={handleConvert}
          disabled={isConverting || isLoading || !xpAmount || parseFloat(xpAmount) < conversionRate}
          className="w-full text-sm sm:text-base"
          size="lg"
        >
          <Zap className="w-4 h-4 ml-2 flex-shrink-0" />
          <span>{isConverting ? "جاري التحويل..." : "تحويل إلى MSRA"}</span>
        </Button>

        <p className="text-xs text-center text-muted-foreground space-y-1">
          <div>التحويل فوري وبدون رسوم</div>
          <div>Instant Conversion with No Fees</div>
        </p>
      </CardContent>
    </Card>
  );
};