import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface RequireAdminProps {
  children: ReactNode;
}

const RequireAdmin = ({ children }: RequireAdminProps) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdminStatus = async () => {
      if (!user?.id) {
        if (mounted) {
          setIsAdmin(false);
          setCheckingAdmin(false);
        }
        return;
      }

      if (mounted) {
        setCheckingAdmin(true);
      }

      try {
        const { data, error } = await supabase.rpc("is_admin", {
          _user_id: user.id,
        });

        if (mounted) {
          if (error) {
            setIsAdmin(false);
          } else {
            setIsAdmin(data);
          }
          setCheckingAdmin(false);
        }
      } catch (error) {
        if (mounted) {
          setIsAdmin(false);
          setCheckingAdmin(false);
        }
      }
    };

    checkAdminStatus();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (loading || checkingAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        جاري التحقق من الصلاحيات...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">غير مصرح</h1>
        <p className="text-muted-foreground">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;