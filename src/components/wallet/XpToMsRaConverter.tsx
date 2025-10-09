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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          تحويل XP إلى Ms-Ra | XP to Ms-Ra Conversion
        </CardTitle>
        <CardDescription>
          حول نقاط XP الخاصة بك إلى عملة التعدين Ms-Ra
          <br />
          <span className="text-xs">Convert Your XP Points to Ms-Ra Mining Token</span>
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
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <div className="text-xs text-muted-foreground mb-1">رصيد XP | XP Balance</div>
            <div className="text-lg font-bold text-primary">
              {xpBalance.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">رصيد MSRA | MSRA Balance</div>
            <div className="text-lg font-bold text-primary">
              {msraBalance.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Conversion Input */}
        <div className="space-y-2">
          <Label htmlFor="xp-amount">
            كمية XP للتحويل | XP Amount to Convert
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
            />
            <Button
              variant="outline"
              onClick={setMaxAmount}
              disabled={isConverting || isLoading || xpBalance < conversionRate}
            >
              الكل | Max
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            الرصيد المتاح: {xpBalance.toLocaleString()} XP | Available Balance
          </p>
        </div>

        {/* Conversion Preview */}
        <div className="flex items-center justify-center gap-3 p-4 bg-primary/5 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">تحويل | Convert</div>
            <div className="text-xl font-bold">{xpAmount || "0"} XP</div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary" />
          <div className="text-center">
            <div className="text-sm text-muted-foreground">تحصل على | You Get</div>
            <div className="text-xl font-bold text-primary">{msraAmount} MSRA</div>
          </div>
        </div>

        {/* Convert Button */}
        <Button
          onClick={handleConvert}
          disabled={isConverting || isLoading || !xpAmount || parseFloat(xpAmount) < conversionRate}
          className="w-full"
          size="lg"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isConverting ? "جاري التحويل... | Converting..." : "تحويل إلى MSRA | Convert to MSRA"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          التحويل فوري وبدون رسوم
          <br />
          Instant Conversion with No Fees
        </p>
      </CardContent>
    </Card>
  );
};