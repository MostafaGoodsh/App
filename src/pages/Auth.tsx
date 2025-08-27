import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/lib/auth";

const Auth = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/auth";
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: 'global' }); } catch {}

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      window.location.href = "/";
    } catch (error: any) {
      toast({ title: "فشل تسجيل الدخول", description: error?.message || "تحقق من البيانات", variant: "destructive" });
    } finally {
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

  return (
    <>
      <Helmet>
        <title>{mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'} — منصة العملات الرقمية</title>
        <meta name="description" content="تسجيل الدخول أو إنشاء حساب للوصول إلى المحفظة وتوثيق الهوية والاستبيانات." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <section className="container mx-auto px-4 py-16 max-w-md">
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6">
          {mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'}
        </h1>

        <div className="mb-6 flex gap-2">
          <Button variant={mode === 'signin' ? 'default' : 'outline'} onClick={() => setMode('signin')}>دخول</Button>
          <Button variant={mode === 'signup' ? 'default' : 'outline'} onClick={() => setMode('signup')}>تسجيل</Button>
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
          </form>
        )}
      </section>
    </>
  );
};

export default Auth;
