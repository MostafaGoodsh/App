import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

interface RequireAdminProps {
  children: ReactNode;
}

// يستخدم isAdmin و adminLoading من useAuth مباشرةً بدلاً من استدعاء Supabase مرة ثانية
const RequireAdmin = ({ children }: RequireAdminProps) => {
  const { user, loading, isAdmin, adminLoading } = useAuth();
  const { t } = useLanguage();

  if (loading || adminLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p>{t("جاري التحقق من الصلاحيات...")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">{t("غير مصرح")}</h1>
        <p className="text-muted-foreground">{t("ليس لديك صلاحية للوصول إلى هذه الصفحة")}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;
