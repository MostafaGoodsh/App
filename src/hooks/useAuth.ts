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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.email);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session loaded:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // فحص حالة الإدارة
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        console.log('useAuth: No user, setting admin to false');
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      console.log('useAuth: Checking admin status for user:', user.id);

      try {
        const { data, error } = await supabase.rpc("is_admin", {
          _user_id: user.id,
        });

        console.log('useAuth: is_admin response:', { data, error });

        if (error) {
          console.error('useAuth: Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          console.log('useAuth: Setting isAdmin to:', data);
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error('useAuth: Exception checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    // ضبط adminLoading على true عند بدء الفحص
    if (user) {
      setAdminLoading(true);
    }
    
    checkAdminStatus();
  }, [user]);

  return { 
    session, 
    user, 
    loading, 
    isAdmin, 
    adminLoading 
  };
};
