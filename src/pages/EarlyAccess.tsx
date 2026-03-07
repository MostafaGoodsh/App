import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const EarlyAccess = () => {
  const { isAdmin, loading } = useAuth();
  
  console.log('[EarlyAccess] Render - isAdmin:', isAdmin, 'loading:', loading);
  
  // الأدمن يروح مباشرة للصفحة الرئيسية
  if (!loading && isAdmin) {
    console.log('[EarlyAccess] Redirecting admin to home');
    return <Navigate to="/" replace />;
  }
  
  // عرض loading أثناء التحقق
  if (loading) {
    console.log('[EarlyAccess] Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="arabic-text">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  
  console.log('[EarlyAccess] Showing early access page');
  
  return (
    <>
      <Helmet>
        <title>قريباً - منصة مصر</title>
        <meta name="description" content="شكراً لتسجيلك في منصة مصر. سيتم إشعارك فور إتاحة الوصول الكامل." />
      </Helmet>
      <div 
        className="min-h-[100dvh] flex items-center justify-center p-4"
        style={{
          backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/90" />
        <Card className="w-full max-w-md mx-4 relative z-10">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl arabic-text">قريباً</CardTitle>
              <CardDescription className="arabic-text text-base">
                شكراً لتسجيلك في منصة مصر
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground arabic-text leading-relaxed">
                نحن نعمل حالياً على الإطلاق الرسمي للمنصة. سيتم إشعارك عبر البريد الإلكتروني فور إتاحة الوصول الكامل.
              </p>
              <p className="text-sm text-muted-foreground arabic-text">
                نقدر صبرك وثقتك بنا
              </p>
              <Button 
                onClick={signOut}
                variant="outline"
                className="w-full arabic-text"
              >
                تسجيل الخروج
              </Button>
            </CardContent>
          </Card>
      </div>
    </>
  );
};

export default EarlyAccess;
