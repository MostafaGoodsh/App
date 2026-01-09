import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { useAnubisSubscription } from "@/hooks/useAnubisSubscription";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AnubisSubscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasAccess, subscription, createSubscription } = useAnubisSubscription();
  const [registering, setRegistering] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Fetch settings
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("anubis_settings")
        .select("*")
        .limit(1)
        .single();
      
      if (data) setSettings(data);
    };

    fetchSettings();

    // If already has access, redirect
    if (hasAccess) {
      navigate("/anubis");
    }
  }, [user, hasAccess, navigate]);

  const handleRegister = async () => {
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    setRegistering(true);
    try {
      await createSubscription.mutateAsync({
        subscription_type: settings?.free_tier_enabled ? "free_trial" : "basic",
        status: "active"
      });
      
      toast.success("تم التسجيل بنجاح!");
      navigate("/anubis");
    } catch (error: any) {
      toast.error(error.message || "فشل التسجيل");
    } finally {
      setRegistering(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>تسجيل في الخزانة الرقمية | Digital Vault Registration</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/50 to-background">
        <Card className="max-w-3xl w-full shadow-2xl border-2 border-primary/20">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              الخزانة الرقمية
              <br />
              <span className="text-2xl">Digital Vault</span>
            </CardTitle>
            <CardDescription className="text-lg">
              {settings.free_tier_enabled ? (
                <>
                  مجاني في الفترة الحالية - سجل الآن واحصل على وصول فوري
                  <br />
                  Free for limited time - Register now for instant access
                </>
              ) : (
                <>
                  خدمة تخزين آمنة ومشفرة لملفاتك الشخصية
                  <br />
                  Secure and encrypted storage for your personal files
                </>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Features */}
            <div className="space-y-4">
              <h3 className="font-semibold text-xl text-center">
                المزايا المتوفرة | Available Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { ar: "تشفير قوي لجميع ملفاتك", en: "Strong encryption for all files" },
                  { ar: "مساحة تخزين آمنة", en: "Secure storage space" },
                  { ar: "وصول سريع من أي مكان", en: "Fast access from anywhere" },
                  { ar: "حماية ضد الفقدان والاختراق", en: "Protection against loss and hacking" }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">{feature.ar}</p>
                      <p className="text-muted-foreground">{feature.en}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Free Notice */}
            {settings.free_tier_enabled && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      مجاني الآن | Free Now
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      سجل الآن واستمتع بالخدمة مجاناً. ستصبح الخدمة مدفوعة لاحقاً.
                      <br />
                      Register now and enjoy the service for free. It will become paid later.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Info (if payment enabled) */}
            {settings.payment_enabled && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  خطط الاشتراك | Subscription Plans
                </h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {settings.monthly_price > 0 && (
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="font-bold text-lg">{settings.monthly_price} {settings.currency}</p>
                      <p className="text-muted-foreground">شهرياً | Monthly</p>
                    </div>
                  )}
                  {settings.quarterly_price > 0 && (
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="font-bold text-lg">{settings.quarterly_price} {settings.currency}</p>
                      <p className="text-muted-foreground">ربع سنوي | Quarterly</p>
                    </div>
                  )}
                  {settings.yearly_price > 0 && (
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="font-bold text-lg">{settings.yearly_price} {settings.currency}</p>
                      <p className="text-muted-foreground">سنوي | Yearly</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Register Button */}
            <Button
              size="lg"
              className="w-full text-lg h-14"
              onClick={handleRegister}
              disabled={registering || hasAccess}
            >
              {registering ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  جاري التسجيل... | Registering...
                </>
              ) : hasAccess ? (
                <>لديك وصول بالفعل | Already Registered</>
              ) : (
                <>سجل الآن للوصول الفوري | Register Now for Instant Access</>
              )}
            </Button>

            {/* Security Note */}
            <div className="text-center text-sm text-muted-foreground pt-4">
              <Lock className="h-4 w-4 inline-block mr-1" />
              جميع بياناتك محمية بتشفير من الدرجة العسكرية
              <br />
              All your data is protected with military-grade encryption
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}