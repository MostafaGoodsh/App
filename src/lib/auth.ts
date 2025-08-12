export const cleanupAuthState = () => {
  try {
    // Remove standard Supabase auth tokens
    localStorage.removeItem('supabase.auth.token');

    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });

    // Remove from sessionStorage as well
    try {
      Object.keys(sessionStorage || {}).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
};

import { supabase } from "@/integrations/supabase/client";

export const signOut = async () => {
  try {
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {
      // ignore errors
    }
  } finally {
    window.location.href = '/auth';
  }
};
