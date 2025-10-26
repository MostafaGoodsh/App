import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Shield, Crown } from "lucide-react";

interface RequireAnubisAccessProps {
  children: ReactNode;
}

const RequireAnubisAccess = ({ children }: RequireAnubisAccessProps) => {
  const { user, loading, isAdmin } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    const checkAnubisAccess = async () => {
      if (!user?.id) {
        setCheckingAccess(false);
        return;
      }

      try {
        // استدعاء دالة التحقق من الصلاحية
        const { data, error } = await supabase.rpc('check_anubis_access', {
          _user_id: user.id
        });

        if (error) throw error;

        setHasAccess(data || false);

        // جلب معلومات الاشتراك
        if (data) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('anubis_subscription_type, anubis_expires_at')
            .eq('user_id', user.id)
            .single();

          if (profileData) {
            setSubscriptionType(profileData.anubis_subscription_type);
            setExpiresAt(profileData.anubis_expires_at);
          }
        }
      } catch (error) {
        console.error('Error checking Anubis access:', error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAnubisAccess();
  }, [user?.id]);

  // عرض شاشة التحميل
  if (loading || checkingAccess) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // إعادة توجيه لصفحة تسجيل الدخول
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // الأدمن لديهم وصول كامل
  if (isAdmin) {
    return <>{children}</>;
  }

  // إذا لم يكن لديه صلاحية الوصول
  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="font-cairo text-3xl font-bold mb-3">
                الخزانة الرقمية - خدمة مميزة
              </CardTitle>
              <CardDescription className="text-lg">
                هذه الخدمة متاحة للمشتركين فقط
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">ما هي الخزانة الرقمية؟</h3>
                    <p className="text-muted-foreground">
                      خزنة رقمية آمنة لحفظ مستنداتك وصورك الشخصية مع تشفير من الدرجة العسكرية ومصادقة ثنائية
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Crown className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">المميزات الحصرية:</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• رفع ملفات بحجم حتى 50 ميجابايت</li>
                      <li>• تشفير من الدرجة العسكرية (AES-256)</li>
                      <li>• مصادقة ثنائية إلزامية</li>
                      <li>• نسخ احتياطية تلقائية</li>
                      <li>• حماية متقدمة من الاختراق</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
                <h3 className="font-bold text-xl mb-3">للحصول على الوصول</h3>
                <p className="text-muted-foreground mb-4">
                  اشترك الآن للحصول على وصول فوري للخزانة الرقمية
                </p>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto"
                  onClick={() => window.location.href = '/anubis-subscription'}
                >
                  عرض خطط الاشتراك
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>هذه خدمة مدفوعة ومتاحة بخطط اشتراك متنوعة</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // لديه صلاحية الوصول - عرض المحتوى
  return (
    <>
      {subscriptionType && (
        <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 text-center text-sm">
          <span className="font-medium">
            اشتراك: {subscriptionType === 'premium' ? 'بريميوم 👑' : subscriptionType === 'basic' ? 'أساسي' : 'مجاني'}
          </span>
          {expiresAt && (
            <span className="text-muted-foreground mr-2">
              • ينتهي في: {new Date(expiresAt).toLocaleDateString('ar-EG')}
            </span>
          )}
        </div>
      )}
      {children}
    </>
  );
};

export default RequireAnubisAccess;