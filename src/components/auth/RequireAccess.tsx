import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface RequireAccessProps {
  children: ReactNode;
}

const RequireAccess = ({ children }: RequireAccessProps) => {
  const { user, loading, isAdmin } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const checkEarlyAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setCheckingAccess(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("check_early_access", {
          _user_id: user.id,
        });

        if (error) {
          console.error("Error checking early access:", error);
          setHasAccess(false);
        } else {
          setHasAccess(data === true);
        }
      } catch (error) {
        console.error("Error checking early access:", error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    setCheckingAccess(true);
    checkEarlyAccess();
  }, [user?.id]);

  // انتظر حتى ينتهي التحميل
  if (loading || checkingAccess) {
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

  // الأدمن لهم وصول دائماً
  if (isAdmin) {
    return <>{children}</>;
  }

  // التحقق من حالة الوصول المبكر
  if (!hasAccess) {
    return <Navigate to="/early-access" replace />;
  }

  return <>{children}</>;
};

export default RequireAccess;
