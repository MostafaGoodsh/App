import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface RequireAccessProps {
  children: ReactNode;
}

const RequireAccess = ({ children }: RequireAccessProps) => {
  const { user, loading, isAdmin, adminLoading } = useAuth();

  // انتظر حتى ينتهي التحميل
  if (loading || adminLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="arabic-text">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // لا يوجد مستخدم - اذهب لتسجيل الدخول
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // الأدمن له وصول دائماً
  if (isAdmin) {
    return <>{children}</>;
  }

  // المستخدمون العاديون - اذهب لصفحة الوصول المبكر
  return <Navigate to="/early-access" replace />;
};

export default RequireAccess;
