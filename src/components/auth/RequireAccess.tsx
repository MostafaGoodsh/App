import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface RequireAccessProps {
  children: ReactNode;
}

const RequireAccess = ({ children }: RequireAccessProps) => {
  const { user, loading, isAdmin, adminLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        console.log('RequireAccess: No user');
        setHasAccess(false);
        setChecking(false);
        return;
      }

      // انتظر حتى ينتهي فحص الأدمن
      if (adminLoading) {
        console.log('RequireAccess: Waiting for admin check to complete');
        return;
      }

      console.log('RequireAccess check:', { isAdmin, adminLoading, userId: user.id });

      // المدراء لهم وصول دائماً
      if (isAdmin) {
        console.log('RequireAccess: Admin access granted');
        setHasAccess(true);
        setChecking(false);
        return;
      }

      // التحقق من has_access للمستخدمين العاديين
      const { data, error } = await supabase
        .from("profiles")
        .select("has_access")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error checking access:", error);
        setHasAccess(false);
      } else {
        console.log('RequireAccess: User access:', data?.has_access);
        setHasAccess(data?.has_access || false);
      }
      
      setChecking(false);
    };

    checkAccess();
  }, [user, isAdmin, adminLoading]);

  // عرض شاشة التحميل
  if (loading || adminLoading || checking) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="arabic-text">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // إعادة التوجيه لصفحة تسجيل الدخول إذا لم يكن مسجلاً
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // إعادة التوجيه لصفحة الوصول المبكر إذا لم يكن لديه صلاحية
  if (hasAccess === false) {
    return <Navigate to="/early-access" replace />;
  }

  return <>{children}</>;
};

export default RequireAccess;
