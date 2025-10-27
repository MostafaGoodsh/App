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
  const [checkingAccess, setCheckingAccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkEarlyAccess = async () => {
      if (!user?.id) {
        if (mounted) {
          setHasAccess(false);
          setCheckingAccess(false);
        }
        return;
      }

      // التحقق من الـ cache أولاً
      try {
        const cached = sessionStorage.getItem(`hasAccess_${user.id}`);
        if (cached !== null) {
          // استخدام الـ cached value دون الحاجة لفحص الـ server
          if (mounted) {
            setHasAccess(JSON.parse(cached));
            setCheckingAccess(false);
          }
          return;
        }
      } catch (e) {
        console.error('Failed to read cached access:', e);
      }

      if (mounted) {
        setCheckingAccess(true);
      }

      try {
        const { data, error } = await supabase.rpc("check_early_access", {
          _user_id: user.id,
        });

        if (mounted) {
          const accessStatus = error ? false : (data === true);
          setHasAccess(accessStatus);
          // حفظ في sessionStorage
          try {
            sessionStorage.setItem(`hasAccess_${user.id}`, JSON.stringify(accessStatus));
          } catch (e) {
            console.error('Failed to cache access status:', e);
          }
          setCheckingAccess(false);
        }
      } catch (error) {
        if (mounted) {
          setHasAccess(false);
          setCheckingAccess(false);
        }
      }
    };

    checkEarlyAccess();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // انتظر حتى ينتهي التحميل (بما في ذلك فحص الأدمن)
  if (loading || checkingAccess || adminLoading) {
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
