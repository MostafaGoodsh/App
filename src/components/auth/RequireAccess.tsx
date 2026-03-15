import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface RequireAccessProps {
  children: ReactNode;
}

const RequireAccess = ({ children }: RequireAccessProps) => {
  const { user, loading, isAdmin, adminLoading } = useAuth();
  const { t } = useLanguage();
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

      if (mounted) setCheckingAccess(true);

      try {
        const { data, error } = await supabase.rpc("check_early_access", {
          _user_id: user.id,
        });

        if (mounted) {
          setHasAccess(error ? false : data === true);
          setCheckingAccess(false);
        }
      } catch {
        if (mounted) {
          setHasAccess(false);
          setCheckingAccess(false);
        }
      }
    };

    if (!loading && user?.id) checkEarlyAccess();

    return () => { mounted = false; };
  }, [user?.id, loading]);

  const LoadingSpinner = () => (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p>{t("جاري التحميل...")}</p>
      </div>
    </div>
  );

  if (loading || checkingAccess || adminLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  if (isAdmin) return <>{children}</>;
  if (hasAccess === false) return <Navigate to="/early-access" replace />;
  if (hasAccess === null) return <LoadingSpinner />;

  return <>{children}</>;
};

export default RequireAccess;
