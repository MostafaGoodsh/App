import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Zap, 
  Clock, 
  Wallet, 
  Shield, 
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";

interface MsRaCurrencyCardProps {
  isVerified: boolean;
}

export const MsRaCurrencyCard = ({ isVerified }: MsRaCurrencyCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [solanaAddress, setSolanaAddress] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [miningProgress, setMiningProgress] = useState(0);
  const [lastMiningTime, setLastMiningTime] = useState<Date | null>(null);
  const [msRaBalance, setMsRaBalance] = useState(0);

  // Mining timer effect (24-hour cycle)
  useEffect(() => {
    if (!isVerified || !isRegistered) return;

    const checkMiningStatus = () => {
      const now = new Date();
      const lastMining = lastMiningTime;
      
      if (!lastMining) {
        // First time mining
        setMiningProgress(0);
        return;
      }

      const timeDiff = now.getTime() - lastMining.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (timeDiff >= twentyFourHours) {
        // Can mine again
        setMiningProgress(100);
      } else {
        // Calculate progress
        const progress = (timeDiff / twentyFourHours) * 100;
        setMiningProgress(progress);
      }
    };

    checkMiningStatus();
    const interval = setInterval(checkMiningStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isVerified, isRegistered, lastMiningTime]);

  // Load user's Solana address and mining data
  useEffect(() => {
    if (user && isVerified) {
      loadUserMiningData();
    }
  }, [user, isVerified]);

  const loadUserMiningData = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profile?.phone) { // Using phone field to store Solana address temporarily
        setSolanaAddress(profile.phone);
        setIsRegistered(true);
      }

      // Load mining data (simulate with localStorage for now)
      const savedMiningData = localStorage.getItem(`msra_mining_${user?.id}`);
      if (savedMiningData) {
        const data = JSON.parse(savedMiningData);
        setLastMiningTime(new Date(data.lastMiningTime));
        setMsRaBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Error loading mining data:', error);
    }
  };

  const handleRegisterSolanaAddress = async () => {
    if (!solanaAddress.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان Solana صحيح",
        variant: "destructive"
      });
      return;
    }

    // Basic Solana address validation
    if (solanaAddress.length < 32 || solanaAddress.length > 44) {
      toast({
        title: "خطأ",
        description: "عنوان Solana غير صحيح",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Update profile with Solana address (using phone field temporarily)
      const { error } = await supabase
        .from('profiles')
        .update({ phone: solanaAddress })
        .eq('user_id', user?.id);

      if (error) throw error;

      setIsRegistered(true);
      toast({
        title: "تم التسجيل بنجاح",
        description: "تم تسجيل عنوان Solana وتفعيل التعدين"
      });
    } catch (error) {
      console.error('Error registering Solana address:', error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل عنوان Solana",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartMining = () => {
    if (miningProgress < 100) {
      toast({
        title: "انتظر",
        description: "يجب انتظار 24 ساعة بين كل عملية تعدين",
        variant: "destructive"
      });
      return;
    }

    const now = new Date();
    setLastMiningTime(now);
    setMiningProgress(0);
    
    // Simulate mining reward
    const reward = Math.random() * 10 + 5; // Random between 5-15 Ms-Ra
    const newBalance = msRaBalance + reward;
    setMsRaBalance(newBalance);

    // Save to localStorage
    const miningData = {
      lastMiningTime: now.toISOString(),
      balance: newBalance
    };
    localStorage.setItem(`msra_mining_${user?.id}`, JSON.stringify(miningData));

    toast({
      title: "تم التعدين بنجاح!",
      description: `حصلت على ${reward.toFixed(2)} Ms-Ra`
    });
  };

  const getTimeUntilNextMining = () => {
    if (!lastMiningTime) return "متاح الآن";
    
    const now = new Date();
    const nextMining = new Date(lastMiningTime.getTime() + 24 * 60 * 60 * 1000);
    const timeDiff = nextMining.getTime() - now.getTime();
    
    if (timeDiff <= 0) return "متاح الآن";
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}س ${minutes}د`;
  };

  if (!isVerified) {
    return (
      <Card className="relative overflow-hidden border-2 border-dashed border-muted-foreground/25">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url(/lovable-uploads/73294275-1418-4174-b109-0f587abab976.png)" }}
        />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            العملة القادمة - Ms-Ra
          </CardTitle>
          <CardDescription>
            عملة رقمية جديدة مع نظام تعدين مبتكر
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 text-center py-8">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">مطلوب تحقيق الهوية</h3>
          <p className="text-muted-foreground mb-4">
            يجب إكمال عملية تحقيق الهوية للوصول إلى ميزة تعدين Ms-Ra
          </p>
          <Badge variant="outline" className="px-4 py-2">
            <AlertCircle className="w-4 h-4 mr-2" />
            في انتظار التحقق
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url(/lovable-uploads/73294275-1418-4174-b109-0f587abab976.png)" }}
      />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          العملة القادمة - Ms-Ra
          <Badge variant="secondary" className="ml-auto">
            <CheckCircle className="w-4 h-4 mr-1" />
            مفعل
          </Badge>
        </CardTitle>
        <CardDescription>
          عملة رقمية مبتكرة مع نظام تعدين EVM كل 24 ساعة
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 space-y-6">
        {/* Solana Address Registration */}
        {!isRegistered ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <Wallet className="w-4 h-4" />
              <span className="font-medium">تسجيل عنوان Solana</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="solana-address">عنوان محفظة Solana</Label>
              <Input
                id="solana-address"
                placeholder="ادخل عنوان محفظة Solana..."
                value={solanaAddress}
                onChange={(e) => setSolanaAddress(e.target.value)}
                className="font-mono"
              />
            </div>
            <Button 
              onClick={handleRegisterSolanaAddress}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "جاري التسجيل..." : "تسجيل العنوان"}
            </Button>
          </div>
        ) : (
          <>
            {/* Balance Display */}
            <div className="bg-white/80 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">رصيد Ms-Ra</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {msRaBalance.toFixed(2)} MS-RA
              </div>
            </div>

            <Separator />

            {/* Mining Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-medium">مؤشر التعدين EVM</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>التقدم</span>
                  <span>{miningProgress.toFixed(1)}%</span>
                </div>
                <Progress value={miningProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>التعدين التالي: {getTimeUntilNextMining()}</span>
                </div>
                <div className="text-right">
                  <Badge variant={miningProgress >= 100 ? "default" : "secondary"}>
                    {miningProgress >= 100 ? "جاهز للتعدين" : "في الانتظار"}
                  </Badge>
                </div>
              </div>

              <Button 
                onClick={handleStartMining}
                disabled={miningProgress < 100}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Zap className="w-4 h-4 mr-2" />
                {miningProgress >= 100 ? "بدء التعدين" : "انتظر 24 ساعة"}
              </Button>
            </div>

            {/* Registered Address Display */}
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">عنوان Solana مسجل</span>
              </div>
              <p className="text-xs text-green-600 font-mono break-all">
                {solanaAddress}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};