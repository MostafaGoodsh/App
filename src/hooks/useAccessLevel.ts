import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AccessLevel = "none" | "early_access" | "kyc_verified" | "admin";

const RANK: Record<AccessLevel, number> = {
  none: 0,
  early_access: 1,
  kyc_verified: 2,
  admin: 3,
};

export const meetsAccess = (user: AccessLevel, required: AccessLevel) =>
  RANK[user] >= RANK[required];

export function useAccessLevel() {
  const { user, loading, isAdmin } = useAuth();
  const [level, setLevel] = useState<AccessLevel>("none");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchLevel = async () => {
      if (!user?.id) {
        if (mounted) { setLevel("none"); setChecking(false); }
        return;
      }
      if (isAdmin) {
        if (mounted) { setLevel("admin"); setChecking(false); }
        return;
      }
      try {
        const { data } = await supabase.rpc("get_user_access_level", { _user_id: user.id });
        if (mounted) setLevel((data as AccessLevel) || "none");
      } catch {
        if (mounted) setLevel("none");
      } finally {
        if (mounted) setChecking(false);
      }
    };
    if (!loading) fetchLevel();
    return () => { mounted = false; };
  }, [user?.id, loading, isAdmin]);

  return { level, loading: loading || checking, isAdmin };
}
