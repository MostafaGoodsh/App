import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface MiningProfile {
  id: string;
  user_id: string;
  current_level: number;
  account_strength: number;
  total_mined: number;
  mining_rate_per_hour: number;
  last_mining_update: string;
  is_mining_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MiningLevel {
  id: number;
  level_number: number;
  level_name: string;
  required_account_strength: number;
  mining_rate_per_hour: number;
  upgrade_cost: number;
  created_at: string;
}

interface MiningHistory {
  id: string;
  user_id: string;
  hour_timestamp: string;
  amount_mined: number;
  mining_rate: number;
  account_strength: number;
  level_number: number;
  created_at: string;
}

interface MiningProgress {
  mined_amount: number;
  total_mined: number;
  account_strength: number;
  current_level: number;
  mining_rate: number;
  hours_passed: number;
  is_active: boolean;
}

export const useMining = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MiningProfile | null>(null);
  const [levels, setLevels] = useState<MiningLevel[]>([]);
  const [history, setHistory] = useState<MiningHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch mining profile
  const fetchMiningProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_mining_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل ملف التعدين');
    }
  };

  // Fetch mining levels
  const fetchMiningLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('mining_levels')
        .select('*')
        .order('level_number');

      if (error) throw error;
      setLevels(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل مستويات التعدين');
    }
  };

  // Fetch mining history (last 24 hours)
  const fetchMiningHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mining_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('hour_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('hour_timestamp', { ascending: true });

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل تاريخ التعدين');
    }
  };

  // Update mining progress
  const updateMiningProgress = async (): Promise<MiningProgress | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('update-mining', {
        body: { userId: user.id }
      });

      if (error) throw error;
      
      if (data.success) {
        await fetchMiningProfile();
        await fetchMiningHistory();
        return data.data as MiningProgress;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث التعدين');
      return null;
    }
  };

  // Toggle mining status
  const toggleMining = async (active: boolean) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('user_mining_profiles')
        .update({ is_mining_active: active })
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchMiningProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تغيير حالة التعدين');
    }
  };

  // Get current level details
  const getCurrentLevel = () => {
    if (!profile) return null;
    return levels.find(level => level.level_number === profile.current_level);
  };

  // Get next level details
  const getNextLevel = () => {
    if (!profile) return null;
    return levels.find(level => level.level_number === profile.current_level + 1);
  };

  // Calculate progress to next level
  const getProgressToNextLevel = () => {
    if (!profile) return 0;
    
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    
    if (!currentLevel || !nextLevel) return 100;
    
    const progress = ((profile.account_strength - currentLevel.required_account_strength) / 
                     (nextLevel.required_account_strength - currentLevel.required_account_strength)) * 100;
    
    return Math.min(100, Math.max(0, progress));
  };

  // Get mining rate per minute for UI updates
  const getMiningRatePerMinute = () => {
    return profile ? profile.mining_rate_per_hour / 60 : 0;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchMiningProfile(),
        fetchMiningLevels(),
        fetchMiningHistory()
      ]);
      
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Auto-update mining progress every minute
  useEffect(() => {
    if (!user || !profile?.is_mining_active) return;

    const interval = setInterval(() => {
      updateMiningProgress();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [user, profile?.is_mining_active]);

  return {
    profile,
    levels,
    history,
    loading,
    error,
    updateMiningProgress,
    toggleMining,
    getCurrentLevel,
    getNextLevel,
    getProgressToNextLevel,
    getMiningRatePerMinute,
    refreshData: () => {
      fetchMiningProfile();
      fetchMiningHistory();
    }
  };
};