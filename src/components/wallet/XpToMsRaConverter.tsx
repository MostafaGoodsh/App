import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useInternalWallet } from "@/hooks/useInternalWallet";
import { ArrowRight, Zap, Info, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface ConversionSettings {
  points_to_token_rate: number;
  minimum_conversion_points: number;
  maximum_conversion_points: number;
  daily_conversion_limit: number;
  token_symbol: string;
  token_name: string;
}

export const XpToMsRaConverter = () => {
  const { toast } = useToast();
  const { balances, swapTokens, isLoading: walletLoading, getTokenBalance, getExchangeRate } = useInternalWallet();
  const [xpAmount, setXpAmount] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [settings, setSettings] = useState<ConversionSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const xpBalance = getTokenBalance('XP');
  const msraBalance = getTokenBalance('MSRA');

  // جلب الإعدادات من DB
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('conversion_settings')
          .select('*')
          .eq('is_active', true)
          .single();

        if (error) throw error;
        setSettings(data);
      } catch (err) {
        console.error('Error fetching conversion settings:', err);
        // Fallback: use exchange rate from internal_tokens
        const rate = getExchangeRate('XP', 'MSRA');
        setSettings({
          points_to_token_rate: rate > 0 ? 1 / rate : 100,
          minimum_conversion_points: 50,
          maximum_conversion_points: 5000,
          daily_conversion_limit: 2000,
          token_symbol: 'MSRA',
          token_name: 'Ms-Ra Token'
        });
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [getExchangeRate]);

  const conversionRate = settings?.points_to_token_rate || 100;
  const minimumPoints = settings?.minimum_conversion_points || 50;
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

    if (amount < minimumPoints) {
      toast({
        title: "خطأ",
        description: `الحد الأدنى للتحويل ${minimumPoints} XP`,
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
        description: `تم تحويل XP ${amount} إلى $MS-RA ${msraAmount}`,
      });
      
      setXpAmount("");
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "خطأ في التحويل",
        description: "فشل في تحويل XP إلى $MS-RA. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  const setMaxAmount = () => {
    if (xpBalance > 0) {
      // Round down to nearest conversionRate
      const maxConvertible = Math.floor(xpBalance / conversionRate) * conversionRate;
      setXpAmount(Math.max(maxConvertible, 0).toString());
    }
  };

  if (loadingSettings) {
    return (
      <Card className="border-primary/20 bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url('/lovable-uploads/73294275-1418-4174-b109-0f587abab976.png')` }}
      />
      <CardHeader className="space-y-3 relative z-10 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b border-primary/20">
        <CardTitle className="flex items-center justify-center gap-3 text-lg sm:text-xl">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
          <div className="flex items-center gap-2" dir="ltr">
            <span className="text-primary font-bold">XP</span>
            <span className="text-muted-foreground">⟷</span>
            <span className="text-primary font-bold">$MS-RA</span>
          </div>
        </CardTitle>
        <CardDescription className="text-center space-y-1">
          <div className="text-sm sm:text-base font-cairo" dir="rtl">استبدال النقاط</div>
          <div className="text-xs text-muted-foreground font-playfair" dir="ltr">Points Swap</div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="space-y-1">
            <div className="font-cairo font-bold text-center" dir="ltr">
              {conversionRate} XP = 1 $MS-RA :معدل التحويل
            </div>
            <div className="text-xs text-muted-foreground font-playfair text-center" dir="ltr">
              Conversion Rate
            </div>
            <div className="text-xs text-muted-foreground font-cairo text-center mt-2" dir="rtl">
              الحد الأدنى: {minimumPoints} XP
            </div>
          </AlertDescription>
        </Alert>

        {/* Current Balances */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg border border-primary/20">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1 font-cairo" dir="rtl">رصيد XP</div>
            <div className="text-base sm:text-lg font-bold text-primary">
              {xpBalance.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground font-playfair" dir="ltr">XP Balance</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1 font-cairo" dir="rtl">رصيد $MS-RA</div>
            <div className="text-base sm:text-lg font-bold text-primary">
              {msraBalance.toFixed(4)}
            </div>
            <div className="text-[10px] text-muted-foreground font-playfair" dir="ltr">$MS-RA Balance</div>
          </div>
        </div>

        {/* Conversion Input */}
        <div className="space-y-2">
          <Label htmlFor="xp-amount" className="text-sm sm:text-base text-center block space-y-1">
            <div className="font-cairo" dir="rtl">كمية XP للتحويل</div>
            <div className="text-xs text-muted-foreground font-playfair" dir="ltr">XP Amount to Convert</div>
          </Label>
          <div className="flex gap-2">
            <Input
              id="xp-amount"
              type="number"
              placeholder="0"
              value={xpAmount}
              onChange={(e) => setXpAmount(e.target.value)}
              min={minimumPoints}
              step={1}
              disabled={isConverting || walletLoading}
              className="text-center text-base sm:text-lg"
            />
            <Button
              variant="outline"
              onClick={setMaxAmount}
              disabled={isConverting || walletLoading || xpBalance < minimumPoints}
              className="whitespace-nowrap px-3 sm:px-4"
            >
              <span className="hidden sm:inline font-cairo">الكل</span>
              <span className="sm:hidden font-playfair">Max</span>
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground space-y-1">
            <span className="font-cairo block" dir="rtl">الرصيد المتاح: {xpBalance.toLocaleString()} XP</span>
            <span className="font-playfair block" dir="ltr">Available Balance</span>
          </p>
        </div>

        {/* Conversion Preview */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg border border-primary/20">
          <div className="text-center flex-1">
            <div className="text-xs sm:text-sm text-muted-foreground font-cairo" dir="rtl">تحويل</div>
            <div className="text-base sm:text-xl font-bold break-all">{xpAmount || "0"} XP</div>
            <div className="text-[10px] text-muted-foreground font-playfair" dir="ltr">Convert</div>
          </div>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <div className="text-center flex-1">
            <div className="text-xs sm:text-sm text-muted-foreground font-cairo" dir="rtl">تحصل على</div>
            <div className="text-base sm:text-xl font-bold text-primary break-all" dir="ltr">{msraAmount} $MS-RA</div>
            <div className="text-[10px] text-muted-foreground font-playfair" dir="ltr">You Get</div>
          </div>
        </div>

        {/* Convert Button */}
        <Button
          onClick={handleConvert}
          disabled={isConverting || walletLoading || !xpAmount || parseFloat(xpAmount) < minimumPoints}
          className="w-full text-sm sm:text-base font-cairo"
          size="lg"
        >
          <Zap className="w-4 h-4 ml-2 flex-shrink-0" />
          <span>{isConverting ? "جاري التحويل..." : "تحويل إلى"} <span dir="ltr">$MS-RA</span></span>
        </Button>

        <p className="text-xs text-center text-muted-foreground space-y-1">
          <span className="font-cairo block" dir="rtl">التحويل فوري وبدون رسوم</span>
          <span className="font-playfair block" dir="ltr">Instant Conversion with No Fees</span>
        </p>
      </CardContent>
    </Card>
  );
};
