import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnubisUser {
  id: string;
  email: string;
  full_name?: string;
  subscription_type: string;
}

interface AnubisAuthState {
  user: AnubisUser | null;
  loading: boolean;
  sessionToken: string | null;
}

export const useAnubisAuth = () => {
  const [state, setState] = useState<AnubisAuthState>({
    user: null,
    loading: true,
    sessionToken: null
  });

  useEffect(() => {
    // التحقق من الجلسة المحفوظة
    const checkSession = async () => {
      const sessionToken = localStorage.getItem('anubis_session_token');
      
      if (!sessionToken) {
        setState({ user: null, loading: false, sessionToken: null });
        return;
      }

      try {
        const { data, error } = await supabase.rpc('verify_anubis_session', {
          p_session_token: sessionToken
        });

        const result = data as any;

        if (error || !result?.valid) {
          localStorage.removeItem('anubis_session_token');
          setState({ user: null, loading: false, sessionToken: null });
          return;
        }

        setState({
          user: result.user,
          loading: false,
          sessionToken
        });
      } catch (error) {
        console.error('Error verifying session:', error);
        localStorage.removeItem('anubis_session_token');
        setState({ user: null, loading: false, sessionToken: null });
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('anubis-auth', {
        body: { action: 'login', email, password }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.requires_2fa) {
        return { success: true, requires_2fa: true, message: data.message };
      }

      localStorage.setItem('anubis_session_token', data.session_token);
      setState({
        user: data.user,
        loading: false,
        sessionToken: data.session_token
      });

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'فشل تسجيل الدخول' };
    }
  };

  const verify2FA = async (email: string, twofa_code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('anubis-auth', {
        body: { action: 'verify_2fa', email, twofa_code }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      localStorage.setItem('anubis_session_token', data.session_token);
      setState({
        user: data.user,
        loading: false,
        sessionToken: data.session_token
      });

      return { success: true };
    } catch (error: any) {
      console.error('2FA verification error:', error);
      return { success: false, error: error.message || 'فشل التحقق' };
    }
  };

  const register = async (email: string, password: string, full_name?: string, phone?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('anubis-auth', {
        body: { action: 'register', email, password, full_name, phone }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      localStorage.setItem('anubis_session_token', data.session_token);
      setState({
        user: data.user,
        loading: false,
        sessionToken: data.session_token
      });

      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'فشل التسجيل' };
    }
  };

  const logout = async () => {
    try {
      const sessionToken = localStorage.getItem('anubis_session_token');
      
      if (sessionToken) {
        await supabase.functions.invoke('anubis-auth', {
          body: { action: 'logout', session_token: sessionToken }
        });
      }

      localStorage.removeItem('anubis_session_token');
      setState({ user: null, loading: false, sessionToken: null });
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    sessionToken: state.sessionToken,
    isAuthenticated: !!state.user,
    login,
    verify2FA,
    register,
    logout
  };
};