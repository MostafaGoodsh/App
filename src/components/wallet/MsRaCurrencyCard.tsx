import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAppContent } from "@/hooks/useAppContent";
import { useInternalWallet } from "@/hooks/useInternalWallet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Zap, 
  Clock, 
  Wallet, 
  Shield, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ExternalLink
} from "lucide-react";

interface MsRaCurrencyCardProps {
  isVerified: boolean;
}

export const MsRaCurrencyCard = ({ isVerified }: MsRaCurrencyCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { getContentItem } = useAppContent();
  const { getTokenBalance } = useInternalWallet();
  const [solanaAddress, setSolanaAddress] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [miningProgress, setMiningProgress] = useState(0);
  const [lastMiningTime, setLastMiningTime] = useState<Date | null>(null);
  const [msRaBalance, setMsRaBalance] = useState(0);

  // Get custom content from admin panel
  const msRaContent = getContentItem('msra_mining_card_main');
  const cardTitle = msRaContent?.text_content || '$MS-RA Mining';
  const cardBackground = msRaContent?.image_url || '/lovable-uploads/73294275-1418-4174-b109-0f587abab976.png';

  // Get MSRA balance from internal wallet
  const internalMsraBalance = getTokenBalance('MSRA');
  
  // Calculate total MS-RA (mining + internal wallet)
  const totalMsRaBalance = msRaBalance + internalMsraBalance;

  // Mining timer effect (24-hour cycle)
  useEffect(() => {
    if (!isVerified || !isRegistered || !lastMiningTime) return;

    const checkMiningStatus = () => {
      const now = new Date();
      const timeDiff = now.getTime() - lastMiningTime.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (timeDiff >= twentyFourHours) {
        // Can mine again
        setMiningProgress(100);
      } else {
        // Calculate progress
        const progress = Math.min((timeDiff / twentyFourHours) * 100, 100);
        setMiningProgress(progress);
      }
    };

    checkMiningStatus();
    const interval = setInterval(checkMiningStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isVerified, isRegistered, lastMiningTime]);

  // Load user's mining data (combined effect)
  useEffect(() => {
    if (user) {
      loadUserMiningData();
    }
  }, [user]);

  const loadUserMiningData = async () => {
    try {
      console.log('Loading mining data for user:', user?.id);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profile?.solana_address) {
        setSolanaAddress(profile.solana_address);
        setIsRegistered(true);
        console.log('User registered with Solana address:', profile.solana_address);
      }

      // Load mining data (simulate with localStorage for now)
      const savedMiningData = localStorage.getItem(`msra_mining_${user?.id}`);
      console.log('Saved mining data:', savedMiningData);
      
      if (savedMiningData) {
        const data = JSON.parse(savedMiningData);
        console.log('Parsed mining data:', data);
        setLastMiningTime(new Date(data.lastMiningTime));
        setMsRaBalance(data.balance || 0);
        console.log('Set balance to:', data.balance || 0);
      } else {
        console.log('No saved mining data found, initializing...');
        // Initialize with some default data for testing
        const initialData = {
          lastMiningTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), // 23 hours ago
          balance: 15.5
        };
        localStorage.setItem(`msra_mining_${user?.id}`, JSON.stringify(initialData));
        setLastMiningTime(new Date(initialData.lastMiningTime));
        setMsRaBalance(initialData.balance);
        console.log('Initialized mining data:', initialData);
      }
    } catch (error) {
      console.error('Error loading mining data:', error);
    }
  };

  const handleRegisterSolanaAddress = async () => {
    console.log('Starting Solana address registration...', { solanaAddress, userId: user?.id });
    
    if (!solanaAddress.trim()) {
      console.log('Error: Empty Solana address');
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان Solana صحيح",
        variant: "destructive"
      });
      return;
    }

    // Basic Solana address validation (Solana addresses are typically 32-44 characters)
    if (solanaAddress.length < 32 || solanaAddress.length > 44 || !/^[1-9A-HJ-NP-Za-km-z]+$/.test(solanaAddress)) {
      toast({
        title: "خطأ",
        description: "عنوان Solana غير صحيح. يجب أن يكون بين 32-44 حرف ويحتوي على أحرف وأرقام صحيحة فقط",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Checking user profile...');
      
      // Check if user has profile first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      console.log('Profile query result:', { profile, profileError });

      if (profileError) {
        console.error('Profile query error:', profileError);
        throw profileError;
      }

      if (!profile) {
        console.log('Creating new profile...');
        // Create profile if it doesn't exist
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user?.id,
            email: user?.email,
            solana_address: solanaAddress
          });

        console.log('Profile creation result:', { createError });
        if (createError) throw createError;
      } else {
        console.log('Updating existing profile...');
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ solana_address: solanaAddress })
          .eq('user_id', user?.id);

        console.log('Profile update result:', { updateError });
        if (updateError) throw updateError;
      }

      setIsRegistered(true);
      toast({
        title: "تم التسجيل بنجاح",
        description: "تم تسجيل عنوان Solana وتفعيل التعدين"
      });
    } catch (error) {
      console.error('Error registering Solana address:', error);
      toast({
        title: "خطأ في التسجيل",
        description: "حدث خطأ أثناء تسجيل العنوان. يرجى المحاولة مرة أخرى",
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
      description: `حصلت على $MS-RA ${reward.toFixed(2)}`
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

  return (
    <Link to="/mining" className="block">
      <Card className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-card">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${cardBackground})` }}
        />
      <CardHeader className="relative z-10 pb-3 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b border-primary/20">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-right font-cairo" dir="rtl">تعدين <span dir="ltr">☥ $MS-RA</span></span>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription className="text-xs space-y-1">
          <div className="text-right font-cairo" dir="rtl">الأصل والمصير</div>
          <div className="text-left italic text-muted-foreground/80 font-playfair" dir="ltr">Origin & Fate</div>
        </CardDescription>
      </CardHeader>
      
      {/* Mining Stats - Only visible if verified */}
      {isVerified && (
        <div className="relative z-10 px-4 pb-3">
          <div className="bg-black/50 p-3 rounded-lg border border-primary/20">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1 text-right font-cairo" dir="rtl">التعدين</div>
                <div className="text-sm font-bold text-primary">{msRaBalance.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1 text-right font-cairo" dir="rtl">المحفظة</div>
                <div className="text-sm font-bold text-primary">{internalMsraBalance.toFixed(2)}</div>
              </div>
            </div>
            <div className="pt-2 border-t border-primary/30 text-center space-y-1">
              <div className="text-xs text-muted-foreground font-cairo" dir="rtl">الرصيد الكلي</div>
              <div className="text-xl font-bold text-primary">{totalMsRaBalance.toFixed(2)}</div>
              <div className="text-[10px] text-muted-foreground font-playfair" dir="ltr">Total Balance</div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-right font-cairo" dir="rtl">التعدين التالي</span>
                <span className="text-primary font-medium">{getTimeUntilNextMining()}</span>
              </div>
              <Progress value={miningProgress} className="h-1.5" />
            </div>
          </div>
        </div>
      )}

      <CardContent className="relative z-10 space-y-6">
        {/* Identity Verification Warning - Only if not verified */}
        {!isVerified && (
          <div className="bg-muted/50 border border-primary/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-primary mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium font-cairo" dir="rtl">تحقيق الهوية مطلوب</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3 font-cairo" dir="rtl">
              يجب إكمال عملية تحقيق الهوية أولاً لتفعيل ميزة التعدين
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/identity" onClick={(e) => e.stopPropagation()}>انتقل لتحقيق الهوية</Link>
            </Button>
          </div>
        )}

        {/* Solana Address Registration - Always visible */}
        {!isRegistered ? (
            <div 
            className="bg-black/60 p-4 rounded-lg space-y-4 border border-primary/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-primary font-cairo" dir="rtl">
              <Wallet className="w-4 h-4" />
              <span className="font-medium">تسجيل عنوان Solana</span>
            </div>
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <Label htmlFor="solana-address" className="font-cairo" dir="rtl">عنوان محفظة Solana</Label>
              <Input
                id="solana-address"
                placeholder="ادخل عنوان محفظة Solana..."
                value={solanaAddress}
                onChange={(e) => setSolanaAddress(e.target.value)}
                className="font-mono text-sm"
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
            <Button 
              onClick={(e) => { e.stopPropagation(); handleRegisterSolanaAddress(); }}
              disabled={isSubmitting || !solanaAddress.trim()}
              className="w-full"
            >
              {isSubmitting ? "جاري التسجيل..." : "تسجيل العنوان"}
            </Button>
          </div>
        ) : (
          <>
            {/* Balance Display - Only if verified */}
            {isVerified && (
              <div className="bg-black/60 p-4 rounded-lg border border-primary/20">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-cairo" dir="rtl">رصيد التعدين</span>
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-xl font-bold text-primary" dir="ltr">
                    {msRaBalance.toFixed(2)} $MS-RA
                  </div>
                  <div className="text-xs text-muted-foreground font-playfair" dir="ltr">Mining Balance</div>
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground font-cairo" dir="rtl">رصيد المحفظة</div>
                    <div className="text-lg font-medium" dir="ltr">{internalMsraBalance.toFixed(2)} $MS-RA</div>
                    <div className="text-xs text-muted-foreground font-playfair" dir="ltr">Wallet Balance</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-2 border-t-2 border-primary/30 space-y-1">
                    <div className="text-sm font-medium font-cairo" dir="rtl">الإجمالي</div>
                    <div className="text-2xl font-bold text-primary" dir="ltr">{totalMsRaBalance.toFixed(2)} $MS-RA</div>
                    <div className="text-xs text-muted-foreground font-playfair" dir="ltr">Total Balance</div>
                  </div>
                </div>
              </div>
            )}

            {isVerified && <Separator />}

            {/* Mining Section - Only if verified */}
            {isVerified && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-medium">مؤشر التعدين EVM</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
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
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {miningProgress >= 100 ? "بدء التعدين" : "انتظر 24 ساعة"}
                </Button>
              </div>
            )}

            {/* Registered Address Display */}
            <div className="bg-black/60 p-3 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-primary mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">عنوان Solana مسجل</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {solanaAddress}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </Link>
  );
};