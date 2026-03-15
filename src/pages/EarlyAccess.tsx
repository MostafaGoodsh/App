import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const EarlyAccess = () => {
  const { isAdmin, loading } = useAuth();
  const { t } = useLanguage();
  
  if (!loading && isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="arabic-text">{t("جاري التحميل...")}</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{t("قريباً")} - Crypto-MSR</title>
        <meta name="description" content={t("شكراً لتسجيلك في منصة مصر")} />
      </Helmet>
      <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden flex items-center justify-center p-4 relative"
        style={{ backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-background/90" />
        <Card className="w-full max-w-sm sm:max-w-md relative z-10">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl arabic-text">{t("قريباً")}</CardTitle>
            <CardDescription className="arabic-text text-base">
              {t("شكراً لتسجيلك في منصة مصر")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground arabic-text leading-relaxed">
              {t("نحن نعمل حالياً على الإطلاق الرسمي للمنصة. سيتم إشعارك عبر البريد الإلكتروني فور إتاحة الوصول الكامل.")}
            </p>
            <p className="text-sm text-muted-foreground arabic-text">
              {t("نقدر صبرك وثقتك بنا")}
            </p>
            <Button onClick={signOut} variant="outline" className="w-full arabic-text">
              {t("تسجيل الخروج")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EarlyAccess;
