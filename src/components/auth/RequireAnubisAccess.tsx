import { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Shield, Clock } from "lucide-react";

interface RequireAnubisAccessProps {
  children: ReactNode;
}

const RequireAnubisAccess = ({ children }: RequireAnubisAccessProps) => {
  const { user, loading, isAdmin } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [subscriptionType, setSubscriptionType] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAnubisAccess = async () => {
      if (!user) {
        setCheckingAccess(false);
        return;
      }

      try {
        // Get settings to check if free tier is enabled
        const { data: settingsData } = await supabase
          .from("anubis_settings")
          .select("*")
          .limit(1)
          .single();

        // Check using RPC function
        const { data: accessData, error: accessError } = await supabase.rpc(
          'check_anubis_subscription_access',
          { user_uuid: user.id }
        );

        if (accessError) {
          console.error("Error checking anubis access:", accessError);
          setHasAccess(false);
          setCheckingAccess(false);
          return;
        }

        setHasAccess(Boolean(accessData));

        // Get subscription details
        const { data: subData } = await supabase
          .from("anubis_subscriptions")
          .select("subscription_type, end_date")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (subData) {
          setSubscriptionType(subData.subscription_type);
          setExpiresAt(subData.end_date);
        }
      } catch (error) {
        console.error("Error in checkAnubisAccess:", error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAnubisAccess();
  }, [user]);

  if (loading || checkingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admins always have access
  if (isAdmin) {
    return <>{children}</>;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/50 to-background">
        <Card className="max-w-2xl w-full shadow-2xl border-2 border-primary/20">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              خزانة أنوبيس الرقمية
            </CardTitle>
            <CardDescription className="text-lg">
              خدمة تخزين آمنة ومشفرة لملفاتك الشخصية
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  خدمة حصرية
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  هذه الخدمة تتطلب تسجيل خاص. اضغط على الزر أدناه للتسجيل والحصول على وصول فوري.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  مجاني لفترة محدودة
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  سجل الآن واستمتع بالخدمة مجاناً. ستصبح الخدمة مدفوعة لاحقاً.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="font-semibold text-lg">المزايا المتوفرة:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>تشفير قوي لجميع ملفاتك</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>مساحة تخزين آمنة</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>وصول سريع من أي مكان</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>حماية ضد الفقدان والاختراق</span>
                </li>
              </ul>
            </div>

            <Button
              size="lg"
              className="w-full text-lg h-12"
              onClick={() => navigate("/anubis-subscription")}
            >
              سجل الآن للوصول الفوري
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptionType && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">
                لديك وصول نشط إلى خزانة أنوبيس
              </p>
              {expiresAt && (
                <p className="text-sm text-green-800 dark:text-green-200">
                  ينتهي في: {new Date(expiresAt).toLocaleDateString('ar-EG')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default RequireAnubisAccess;