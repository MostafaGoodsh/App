import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // استخدام sessionStorage للـ caching
  const getCachedAdminStatus = () => {
    try {
      const cached = sessionStorage.getItem('isAdmin');
      return cached ? JSON.parse(cached) : false;
    } catch {
      return false;
    }
  };
  
  const [isAdmin, setIsAdmin] = useState(getCachedAdminStatus());
  const [adminLoading, setAdminLoading] = useState(false);

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
      console.log('[useAuth] Checking admin status for user:', user?.id);
      if (!user?.id) {
        if (mounted) {
          setIsAdmin(false);
          setAdminLoading(false);
          try {
            sessionStorage.removeItem('isAdmin');
          } catch (e) {
            console.error('[useAuth] Failed to clear admin cache:', e);
          }
        }
        return;
      }

      // التحقق من الـ cache أولاً
      try {
        const cached = sessionStorage.getItem('isAdmin');
        if (cached !== null) {
          // استخدام الـ cached value دون الحاجة لفحص الـ server
          setIsAdmin(JSON.parse(cached));
          setAdminLoading(false);
          console.log('[useAuth] Using cached admin status:', cached);
          return;
        }
      } catch (e) {
        console.error('[useAuth] Failed to read admin cache:', e);
      }

      if (mounted) {
        setAdminLoading(true);
      }

      try {
        const { data, error } = await supabase.rpc("is_admin", {
          _user_id: user.id,
        });

        console.log('[useAuth] Admin check result:', data, error);
        if (mounted) {
          const adminStatus = data === true;
          setIsAdmin(adminStatus);
          // حفظ في sessionStorage
          try {
            sessionStorage.setItem('isAdmin', JSON.stringify(adminStatus));
          } catch (e) {
            console.error('[useAuth] Failed to cache admin status:', e);
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

    checkAdminStatus();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return { 
    session, 
    user, 
    loading, 
    isAdmin, 
    adminLoading 
  };
};
