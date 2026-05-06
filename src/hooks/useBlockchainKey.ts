import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnubisAuth } from './useAnubisAuth';

interface BlockchainKey {
  id: string;
  user_id: string;
  firefly_key: string | null;
  firefly_identity: string | null;
  eth_address: string | null;
  status: string;
}

export const useBlockchainKey = () => {
  const { user } = useAnubisAuth();
  const [key, setKey] = useState<BlockchainKey | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const ensureKey = async () => {
      setLoading(true);
      try {
        // Check existing
        const { data: existing } = await supabase
          .from('blockchain_user_keys')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing && existing.status === 'active') {
          if (!cancelled) setKey(existing as BlockchainKey);
          return;
        }

        // Trigger registration
        const { data } = await supabase.functions.invoke('firefly-register-user', {
          body: { user_id: user.id },
        });
        if (data?.success && !cancelled) {
          const { data: refreshed } = await supabase
            .from('blockchain_user_keys')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          if (!cancelled) setKey(refreshed as BlockchainKey);
        }
      } catch (err) {
        console.error('useBlockchainKey error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    ensureKey();
    return () => { cancelled = true; };
  }, [user?.id]);

  return { key, loading };
};
