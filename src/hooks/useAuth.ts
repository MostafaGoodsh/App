import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[useAuth] Initial session loaded:', session?.user?.id);
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('[useAuth] Auth state changed:', event, newSession?.user?.id);
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // فحص حالة الإدارة
  useEffect(() => {
    let mounted = true;

    const checkAdminStatus = async () => {
      // Only check if we have a valid user ID
      if (!user?.id) {
        if (mounted) {
          setIsAdmin(false);
          setAdminLoading(false);
        }
        return;
      }

      if (mounted) {
        setAdminLoading(true);
      }

      try {
        console.log('[useAuth] Checking admin status for user:', user.id);
        const { data, error } = await supabase.rpc("is_admin", {
          _user_id: user.id,
        });

        console.log('[useAuth] Admin check result:', data, error);
        if (mounted) {
          if (error) {
            setIsAdmin(false);
          } else {
            setIsAdmin(data === true);
          }
          setAdminLoading(false);
        }
      } catch (error) {
        console.error('[useAuth] Admin check error:', error);
        if (mounted) {
          setIsAdmin(false);
          setAdminLoading(false);
        }
      }
    };

    // Only check admin if not loading session and user exists
    if (!loading && user?.id) {
      checkAdminStatus();
    } else if (!loading && !user) {
      // If not loading and no user, set admin to false
      setIsAdmin(false);
      setAdminLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [user?.id, loading]);

  return { 
    session, 
    user, 
    loading, 
    isAdmin, 
    adminLoading 
  };
};
