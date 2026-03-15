import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

const Auth = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/auth";
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: t("تم تسجيل الدخول بنجاح"), description: t("مرحباً بك في منصة مصر") });
    } catch (error: any) {
      toast({ title: t("فشل تسجيل الدخول"), description: error?.message || t("تحقق من البيانات"), variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName, phone: phone }
        }
      });
      if (error) throw error;
      toast({ title: t("تم إنشاء الحساب"), description: t("تحقق من بريدك لتفعيل الحساب") });
      if (data.session?.user) {
        await (supabase as any).from('profiles').upsert({
          user_id: data.session.user.id,
          full_name: fullName || null,
          phone: phone || null,
          email,
        });
      }
    } catch (error: any) {
      toast({ title: t("تعذر إنشاء الحساب"), description: error?.message || t("تحقق من البيانات"), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: t("فشل تسجيل الدخول بـ Google"), description: error?.message || t("حدث خطأ، حاول مرة أخرى"), variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{mode === 'signin' ? t('تسجيل الدخول') : t('إنشاء حساب')} — Crypto-MSR</title>
        <meta name="description" content={t("تسجيل الدخول") + " - Crypto-MSR"} />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <div className="min-h-screen" style={{ backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="min-h-screen bg-background/90">
          <section className="container mx-auto px-4 py-16 max-w-md" dir="rtl">
            <h1 className="font-cairo text-3xl md:text-5xl font-bold mb-6 text-right">
              {mode === 'signin' ? t('تسجيل الدخول') : t('إنشاء حساب')}
            </h1>

            <div className="mb-6 flex gap-3 bg-muted/50 p-1 rounded-lg font-cairo">
              <Button variant={mode === 'signin' ? 'default' : 'ghost'} onClick={() => setMode('signin')} className="flex-1">
                {t('تسجيل الدخول')}
              </Button>
              <Button variant={mode === 'signup' ? 'default' : 'ghost'} onClick={() => setMode('signup')} className="flex-1">
                {t('حساب جديد')}
              </Button>
            </div>

            {mode === 'signin' ? (
              <form onSubmit={onSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-cairo">{t('البريد الإلكتروني')}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-cairo">{t('كلمة المرور')}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
                </div>
                <Button size="lg" type="submit" disabled={isSubmitting} className="w-full font-cairo">
                  {isSubmitting ? t('جاري الدخول...') : t('دخول')}
                </Button>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">{t('أو')}</span>
                  </div>
                </div>

                <Button type="button" variant="outline" size="lg" onClick={onGoogleSignIn} disabled={isSubmitting} className="w-full font-cairo">
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('تسجيل الدخول بـ Google')}
                </Button>

                <Button type="button" variant="outline" size="lg" disabled={isSubmitting} className="w-full font-cairo"
                  onClick={() => toast({ title: t("قريباً"), description: t("تسجيل الدخول عبر تيليجرام سيكون متاحاً قريباً") })}>
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="#229ED9">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  {t('تسجيل الدخول عبر Telegram')}
                </Button>

                <div className="space-y-2">
                  <p className="text-xs text-center text-muted-foreground font-cairo">{t('أو الدخول بالمحفظة')}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={isSubmitting} className="font-cairo text-xs"
                      onClick={() => toast({ title: t("قريباً"), description: t("ربط محفظة Solana سيكون متاحاً قريباً") })}>Solana</Button>
                    <Button type="button" variant="outline" size="sm" disabled={isSubmitting} className="font-cairo text-xs"
                      onClick={() => toast({ title: t("قريباً"), description: t("ربط محفظة EVM سيكون متاحاً قريباً") })}>EVM</Button>
                    <Button type="button" variant="outline" size="sm" disabled={isSubmitting} className="font-cairo text-xs"
                      onClick={() => toast({ title: t("قريباً"), description: t("ربط محفظة TON سيكون متاحاً قريباً") })}>TON</Button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={onSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-cairo">{t('الاسم الكامل')}</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="font-cairo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-cairo">{t('رقم الهاتف')}</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+20 XXX XXX XXXX" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-cairo">{t('البريد الإلكتروني')}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-cairo">{t('كلمة المرور')}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
                </div>
                <Button size="lg" type="submit" disabled={isSubmitting} className="w-full font-cairo">
                  {isSubmitting ? t('جاري إنشاء الحساب...') : t('إنشاء حساب')}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground font-cairo">{t('أو')}</span>
                  </div>
                </div>

                <Button type="button" variant="outline" size="lg" onClick={onGoogleSignIn} disabled={isSubmitting} className="w-full font-cairo">
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('التسجيل بـ Google')}
                </Button>

                <Button type="button" variant="outline" size="lg" disabled={isSubmitting} className="w-full font-cairo"
                  onClick={() => toast({ title: t("قريباً"), description: t("التسجيل عبر تيليجرام سيكون متاحاً قريباً") })}>
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="#229ED9">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  {t('التسجيل عبر Telegram')}
                </Button>

                <div className="space-y-2">
                  <p className="text-xs text-center text-muted-foreground font-cairo">{t('أو التسجيل بالمحفظة')}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={isSubmitting} className="font-cairo text-xs"
                      onClick={() => toast({ title: t("قريباً"), description: t("ربط محفظة Solana") })}>Solana</Button>
                    <Button type="button" variant="outline" size="sm" disabled={isSubmitting} className="font-cairo text-xs"
                      onClick={() => toast({ title: t("قريباً"), description: t("ربط محفظة EVM") })}>EVM</Button>
                    <Button type="button" variant="outline" size="sm" disabled={isSubmitting} className="font-cairo text-xs"
                      onClick={() => toast({ title: t("قريباً"), description: t("ربط محفظة TON") })}>TON</Button>
                  </div>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default Auth;
