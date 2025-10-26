import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/auth";
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
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

      toast({ title: "تم تسجيل الدخول بنجاح", description: "مرحباً بك في منصة مصر" });
      // Navigation will happen automatically via useEffect
    } catch (error: any) {
      toast({ title: "فشل تسجيل الدخول", description: error?.message || "تحقق من البيانات", variant: "destructive" });
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

      toast({ title: "تم إنشاء الحساب", description: "تحقق من بريدك لتفعيل الحساب" });

      // Attempt to pre-create/update profile if session exists (in case email confirmation is disabled)
      if (data.session?.user) {
        await (supabase as any).from('profiles').upsert({
          user_id: data.session.user.id,
          full_name: fullName || null,
          phone: phone || null,
          email,
        });
      }
    } catch (error: any) {
      toast({ title: "تعذر إنشاء الحساب", description: error?.message || "تحقق من البيانات", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ 
        title: "فشل تسجيل الدخول بـ Google", 
        description: error?.message || "تأكد من تفعيل Google في إعدادات Supabase", 
        variant: "destructive" 
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'} — منصة العملات الرقمية</title>
        <meta name="description" content="تسجيل الدخول أو إنشاء حساب للوصول إلى المحفظة وتوثيق الهوية والاستبيانات." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <div 
        className="min-h-screen"
        style={{
          backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="min-h-screen bg-background/90">
          <section className="container mx-auto px-4 py-16 max-w-md">
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6">
          {mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'}
        </h1>

        <div className="mb-6 flex gap-3 bg-muted/50 p-1 rounded-lg">
          <Button 
            variant={mode === 'signin' ? 'default' : 'ghost'} 
            onClick={() => setMode('signin')}
            className="flex-1"
          >
            تسجيل الدخول
          </Button>
          <Button 
            variant={mode === 'signup' ? 'default' : 'ghost'} 
            onClick={() => setMode('signup')}
            className="flex-1"
          >
            حساب جديد
          </Button>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={onSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button size="lg" type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'جاري الدخول...' : 'دخول'}
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">أو</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={onGoogleSignIn} 
              disabled={isSubmitting}
              className="w-full"
            >
              <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              تسجيل الدخول بـ Google
            </Button>
          </form>
        ) : (
          <form onSubmit={onSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+20 XXX XXX XXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button size="lg" type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">أو</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={onGoogleSignIn} 
              disabled={isSubmitting}
              className="w-full"
            >
              <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              التسجيل بـ Google
            </Button>
          </form>
        )}
          </section>
        </div>
      </div>
    </>
  );
};

export default Auth;
