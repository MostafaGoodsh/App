import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface LiquidityPool {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  pool_type: string;
  description: string | null;
  description_en: string | null;
  total_value_locked: number;
  total_volume_24h: number;
  apy_percentage: number;
  providers_count: number;
  min_deposit: number;
  max_deposit: number | null;
  fee_percentage: number;
  is_active: boolean;
  token_a_symbol: string | null;
  token_b_symbol: string | null;
}

export interface LiquidityPosition {
  id: string;
  pool_id: string;
  deposited_amount: number;
  lp_tokens: number;
  current_value: number;
  earned_rewards: number;
  is_staked: boolean;
  staking_plan_id: string | null;
  staked_at: string | null;
  stake_unlock_at: string | null;
  auto_compound_enabled: boolean;
  status: string;
}

export interface StakingPlan {
  id: string;
  pool_id: string;
  name: string;
  name_en: string | null;
  duration_days: number;
  apy_bonus: number;
  min_amount: number;
  max_amount: number | null;
}

export interface AutoRouting {
  id: string;
  source_type: string;
  routing_percentage: number;
  description: string | null;
  is_active: boolean;
}

export interface CharityProgram {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  allocation_percentage: number;
  total_distributed: number;
  beneficiaries_count: number;
  is_active: boolean;
}

export interface LiquidityTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  fee_amount: number;
  source_type: string | null;
  status: string;
  created_at: string;
  notes: string | null;
}

export const useLiquidityPool = (poolSlug?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [activePool, setActivePool] = useState<LiquidityPool | null>(null);
  const [positions, setPositions] = useState<LiquidityPosition[]>([]);
  const [stakingPlans, setStakingPlans] = useState<StakingPlan[]>([]);
  const [autoRouting, setAutoRouting] = useState<AutoRouting[]>([]);
  const [charityPrograms, setCharityPrograms] = useState<CharityProgram[]>([]);
  const [transactions, setTransactions] = useState<LiquidityTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPools();
  }, []);

  useEffect(() => {
    if (activePool) {
      fetchPoolDetails(activePool.id);
    }
  }, [activePool?.id, user?.id]);

  // Real-time subscriptions for pool updates
  useEffect(() => {
    if (!activePool) return;

    const poolChannel = supabase
      .channel(`pool-realtime-${activePool.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'liquidity_pools',
        filter: `id=eq.${activePool.id}`,
      }, (payload) => {
        if (payload.new) {
          setActivePool(payload.new as unknown as LiquidityPool);
          // Also update in pools array
          setPools(prev => prev.map(p => p.id === activePool.id ? payload.new as unknown as LiquidityPool : p));
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'liquidity_transactions',
        filter: `pool_id=eq.${activePool.id}`,
      }, (payload) => {
        if (payload.new) {
          setTransactions(prev => [payload.new as unknown as LiquidityTransaction, ...prev].slice(0, 50));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(poolChannel);
    };
  }, [activePool?.id]);

  const fetchPools = async () => {
    const { data } = await supabase
      .from('liquidity_pools')
      .select('*')
      .eq('is_active', true)
      .order('created_at');
    
    if (data) {
      setPools(data as unknown as LiquidityPool[]);
      const target = poolSlug 
        ? data.find((p: any) => p.slug === poolSlug) 
        : data[0];
      if (target) setActivePool(target as unknown as LiquidityPool);
    }
    setLoading(false);
  };

  const fetchPoolDetails = async (poolId: string) => {
    const promises: any[] = [
      supabase.from('pool_staking_plans').select('*').eq('pool_id', poolId).eq('is_active', true),
      supabase.from('pool_auto_routing').select('*').eq('pool_id', poolId),
      supabase.from('pool_charity_programs').select('*').eq('pool_id', poolId).eq('is_active', true),
      // Fetch ALL pool transactions (not just user's) to show platform deposits, wheel taxes, etc.
      supabase.from('liquidity_transactions').select('*').eq('pool_id', poolId).order('created_at', { ascending: false }).limit(50),
    ];

    if (user?.id) {
      promises.push(
        supabase.from('liquidity_positions').select('*').eq('pool_id', poolId).eq('user_id', user.id),
      );
    }

    const results = await Promise.all(promises);
    
    setStakingPlans((results[0].data || []) as unknown as StakingPlan[]);
    setAutoRouting((results[1].data || []) as unknown as AutoRouting[]);
    setCharityPrograms((results[2].data || []) as unknown as CharityProgram[]);
    setTransactions((results[3].data || []) as unknown as LiquidityTransaction[]);
    
    if (user?.id && results[4]) {
      setPositions((results[4].data || []) as unknown as LiquidityPosition[]);
    }
  };

  const addLiquidity = async (amount: number, stakingPlanId?: string) => {
    if (!user?.id || !activePool) return false;
    
    try {
      const existingPosition = positions.find(p => p.status === 'active' && !p.is_staked);
      const lpTokens = amount * (1 - activePool.fee_percentage / 100);
      
      if (existingPosition) {
        await supabase.from('liquidity_positions').update({
          deposited_amount: existingPosition.deposited_amount + amount,
          lp_tokens: existingPosition.lp_tokens + lpTokens,
          current_value: existingPosition.current_value + amount,
          is_staked: !!stakingPlanId,
          staking_plan_id: stakingPlanId || existingPosition.staking_plan_id,
          staked_at: stakingPlanId ? new Date().toISOString() : existingPosition.staked_at,
        }).eq('id', existingPosition.id);
      } else {
        await supabase.from('liquidity_positions').insert({
          user_id: user.id,
          pool_id: activePool.id,
          deposited_amount: amount,
          lp_tokens: lpTokens,
          current_value: amount,
          is_staked: !!stakingPlanId,
          staking_plan_id: stakingPlanId,
          staked_at: stakingPlanId ? new Date().toISOString() : null,
        });
      }

      await supabase.from('liquidity_transactions').insert({
        user_id: user.id,
        pool_id: activePool.id,
        transaction_type: stakingPlanId ? 'stake' : 'deposit',
        amount,
        fee_amount: amount * activePool.fee_percentage / 100,
      });

      toast({ title: 'تمت إضافة السيولة بنجاح', description: `تم إضافة ${amount} للمجمع` });
      fetchPoolDetails(activePool.id);
      return true;
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في إضافة السيولة', variant: 'destructive' });
      return false;
    }
  };

  const removeLiquidity = async (positionId: string, amount: number) => {
    if (!user?.id || !activePool) return false;
    
    try {
      const position = positions.find(p => p.id === positionId);
      if (!position) return false;

      if (position.is_staked && position.stake_unlock_at && new Date(position.stake_unlock_at) > new Date()) {
        toast({ title: 'السيولة مقفلة', description: 'لا يمكن السحب قبل انتهاء فترة القفل', variant: 'destructive' });
        return false;
      }

      const remaining = position.deposited_amount - amount;
      
      if (remaining <= 0) {
        await supabase.from('liquidity_positions').update({ status: 'withdrawn', deposited_amount: 0, lp_tokens: 0, current_value: 0 }).eq('id', positionId);
      } else {
        const ratio = remaining / position.deposited_amount;
        await supabase.from('liquidity_positions').update({
          deposited_amount: remaining,
          lp_tokens: position.lp_tokens * ratio,
          current_value: position.current_value * ratio,
        }).eq('id', positionId);
      }

      await supabase.from('liquidity_transactions').insert({
        user_id: user.id,
        pool_id: activePool.id,
        position_id: positionId,
        transaction_type: 'withdraw',
        amount,
        fee_amount: amount * activePool.fee_percentage / 100,
      });

      toast({ title: 'تم سحب السيولة', description: `تم سحب ${amount}` });
      fetchPoolDetails(activePool.id);
      return true;
    } catch {
      toast({ title: 'خطأ', description: 'فشل في سحب السيولة', variant: 'destructive' });
      return false;
    }
  };

  const totalDeposited = positions.filter(p => p.status === 'active').reduce((s, p) => s + p.deposited_amount, 0);
  const totalRewards = positions.reduce((s, p) => s + p.earned_rewards, 0);
  const totalLpTokens = positions.filter(p => p.status === 'active').reduce((s, p) => s + p.lp_tokens, 0);

  return {
    pools, activePool, setActivePool,
    positions, stakingPlans, autoRouting, charityPrograms, transactions,
    loading, addLiquidity, removeLiquidity,
    totalDeposited, totalRewards, totalLpTokens,
    refreshPool: () => activePool && fetchPoolDetails(activePool.id),
  };
};
