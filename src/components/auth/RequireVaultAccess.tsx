import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useVaultSubscription } from "@/hooks/useVaultSubscription";

interface RequireVaultAccessProps {
  children: ReactNode;
}

const RequireVaultAccess = ({ children }: RequireVaultAccessProps) => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { hasAccess, isLoading: subscriptionLoading } = useVaultSubscription();

  // Show loading while checking
  if (authLoading || subscriptionLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="arabic-text">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admins always have access
  if (isAdmin) {
    return <>{children}</>;
  }

  // Redirect to subscription page if no access
  if (!hasAccess) {
    return <Navigate to="/vault-subscription" replace />;
  }

  return <>{children}</>;
};

export default RequireVaultAccess;
