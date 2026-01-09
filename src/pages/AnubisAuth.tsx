import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnubisAuth } from "@/hooks/useAnubisAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, KeyRound } from "lucide-react";
import { toast } from "sonner";

const AnubisAuth = () => {
  const navigate = useNavigate();
  const { login, verify2FA, register, isAuthenticated } = useAnubisAuth();
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: ""
  });

  // إذا كان المستخدم مسجل دخول بالفعل، انتقل إلى صفحة أنوبيس
  if (isAuthenticated) {
    navigate("/anubis");
    return null;
  }

  const getErrorMessage = (error: string) => {
    // تحويل رسائل الخطأ التقنية إلى رسائل مفهومة
    if (error.includes('non-2xx') || error.includes('Edge Function')) {
      return 'خدمة المصادقة غير متاحة حالياً. يرجى المحاولة لاحقاً';
    }
    if (error.includes('password') || error.includes('email') || error.includes('credentials')) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    }
    if (error.includes('network') || error.includes('Network')) {
      return 'مشكلة في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت';
    }
    return error;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(loginData.email, loginData.password);
      
      if (result.success) {
        if (result.requires_2fa) {
          setRequires2FA(true);
          toast.success(result.message || "تم إرسال رمز التحقق");
        } else {
          toast.success("تم تسجيل الدخول بنجاح");
          navigate("/anubis");
        }
      } else {
        toast.error(getErrorMessage(result.error || "فشل تسجيل الدخول"));
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err?.message || "حدث خطأ غير متوقع"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFACode || twoFACode.length !== 6) {
      toast.error('الرجاء إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setLoading(true);
    try {
      const result = await verify2FA(loginData.email, twoFACode);
      
      if (result.success) {
        toast.success("تم التحقق بنجاح!");
        navigate("/anubis");
      } else {
        toast.error(result.error || "رمز التحقق غير صحيح");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }

    if (registerData.password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);

    try {
      const result = await register(
        registerData.email,
        registerData.password,
        registerData.full_name,
        registerData.phone
      );
      
      if (result.success) {
        toast.success("تم التسجيل بنجاح! مرحباً بك في الخزانة الرقمية");
        navigate("/anubis");
      } else {
        toast.error(getErrorMessage(result.error || "فشل التسجيل"));
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err?.message || "حدث خطأ غير متوقع"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/50 to-background">
      <Card className="max-w-2xl w-full shadow-2xl border-2 border-primary/20">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            الخزانة الرقمية
          </CardTitle>
          <CardDescription className="text-lg">
            خدمة تخزين آمنة ومشفرة لملفاتك الشخصية
          </CardDescription>
        </CardHeader>

        <CardContent>
          {requires2FA ? (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">التحقق الثنائي</h3>
                <p className="text-sm text-muted-foreground">
                  تم إرسال رمز التحقق إلى بريدك الإلكتروني<br />
                  يرجى إدخال الرمز المكون من 6 أرقام
                </p>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="2fa-code">رمز التحقق</Label>
                  <Input
                    id="2fa-code"
                    type="text"
                    placeholder="000000"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest font-mono"
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    الرمز صالح لمدة 10 دقائق
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || twoFACode.length !== 6}
                >
                  {loading ? "جاري التحقق..." : "تأكيد"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setRequires2FA(false);
                    setTwoFACode('');
                  }}
                  disabled={loading}
                >
                  رجوع
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register">حساب جديد</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-10"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">الاسم الكامل (اختياري)</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="أحمد محمد"
                    value={registerData.full_name}
                    onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-10"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone">رقم الهاتف (اختياري)</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+20 123 456 7890"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm">تأكيد كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-confirm"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    🎁 التسجيل مجاني حالياً! احصل على وصول فوري للخزانة الرقمية الآمنة
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "جاري التسجيل..." : "إنشاء حساب والوصول الفوري"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          )}

          {!requires2FA && (
            <div className="mt-6 space-y-3">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-semibold">
                🔒 تشفير عسكري من الدرجة الأولى لحماية ملفاتك
              </p>
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnubisAuth;