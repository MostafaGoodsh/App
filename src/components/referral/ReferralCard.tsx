import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Users, Gift, Share2, CheckCircle, Sparkles } from 'lucide-react';

interface Referral {
  id: string;
  referred_id: string;
  tokens_rewarded: number;
  created_at: string;
}

export const ReferralCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [inputCode, setInputCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasBeenReferred, setHasBeenReferred] = useState(false);
  const MAX_REFERRALS = 10;
  const REWARD_PER_REFERRAL = 7;

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    // Get or generate referral code
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_code, referral_count, referred_by')
      .eq('user_id', user.id)
      .single();

    if (profile?.referral_code) {
      setReferralCode(profile.referral_code);
    } else {
      // Generate code
      const { data: code } = await supabase.rpc('generate_referral_code', { p_user_id: user.id });
      if (code) setReferralCode(code as string);
    }

    setReferralCount(profile?.referral_count || 0);
    setHasBeenReferred(!!profile?.referred_by);

    // Load referrals
    const { data: refs } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (refs) setReferrals(refs);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(referralCode);
    toast({ title: 'تم النسخ!', description: 'تم نسخ رمز الإحالة' });
  };

  const handleShare = async () => {
    const shareText = `انضم إلى Crypto-MSR واحصل على مكافآت! استخدم رمز الإحالة: ${referralCode}`;
    if (navigator.share) {
      await navigator.share({ title: 'Crypto-MSR', text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({ title: 'تم النسخ!', description: 'تم نسخ رابط المشاركة' });
    }
  };

  const handleSubmitReferral = async () => {
    if (!user || !inputCode.trim()) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('process_referral', {
        p_referral_code: inputCode.trim().toUpperCase(),
        p_referred_user_id: user.id
      });

      const result = data as any;
      if (error) throw error;

      if (result?.success) {
        toast({ title: '🎉 تم!', description: result.message });
        setHasBeenReferred(true);
        setInputCode('');
      } else {
        toast({ title: 'خطأ', description: result?.error, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalEarned = referralCount * REWARD_PER_REFERRAL;
  const progressPercent = (referralCount / MAX_REFERRALS) * 100;

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/15 to-transparent border-b border-primary/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Gift className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="arabic-text">نظام الإحالة</span>
            <span className="block text-xs font-normal text-muted-foreground" dir="ltr">Referral Program</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 pt-4">
        {/* Reward Info */}
        <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Sparkles className="w-5 h-5 text-primary" />
          <div className="text-center">
            <p className="text-sm font-medium arabic-text">
              احصل على <span className="text-primary font-bold" dir="ltr">7 $MS-RA</span> لكل إحالة
            </p>
            <p className="text-[10px] text-muted-foreground" dir="ltr">Earn 7 $MS-RA per referral</p>
          </div>
        </div>

        {/* Your Code */}
        <div className="space-y-2">
          <p className="text-sm font-medium arabic-text">رمز الإحالة الخاص بك</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-black/40 border border-primary/30 rounded-lg px-4 py-3 font-mono text-lg text-center text-primary font-bold tracking-wider" dir="ltr">
              {referralCode || '...'}
            </div>
            <Button variant="outline" size="icon" onClick={handleCopyCode} className="border-primary/30 h-auto">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare} className="border-primary/30 h-auto">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="arabic-text text-muted-foreground">الإحالات</span>
            <span className="font-bold">
              <span className="text-primary">{referralCount}</span>
              <span className="text-muted-foreground">/{MAX_REFERRALS}</span>
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="arabic-text">المكتسب</span>
            <span className="text-primary font-bold" dir="ltr">{totalEarned} $MS-RA</span>
          </div>
        </div>

        {/* Referral Slots */}
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: MAX_REFERRALS }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center border-2 transition-all ${
                i < referralCount
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-muted bg-muted/30 text-muted-foreground/30'
              }`}
            >
              {i < referralCount ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Users className="w-3 h-3" />
              )}
            </div>
          ))}
        </div>

        {/* Use Referral Code */}
        {!hasBeenReferred && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-sm font-medium arabic-text">لديك رمز إحالة؟</p>
            <div className="flex gap-2">
              <Input
                placeholder="MSR-XXXXXX"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="font-mono text-center"
                dir="ltr"
              />
              <Button
                onClick={handleSubmitReferral}
                disabled={isSubmitting || !inputCode.trim()}
                size="sm"
              >
                {isSubmitting ? '...' : 'تطبيق'}
              </Button>
            </div>
          </div>
        )}

        {hasBeenReferred && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="arabic-text text-green-500">تم تفعيل الإحالة</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
