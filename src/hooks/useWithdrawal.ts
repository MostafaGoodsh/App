import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalRequest {
  internal_token_symbol: string;
  internal_amount: number;
  target_token: string;
  target_address: string;
}

interface WithdrawalRecord {
  id: string;
  internal_amount: number;
  target_amount: number;
  target_token: string;
  target_address: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transaction_hash: string | null;
  created_at: string;
  processed_at: string | null;
}

export const useWithdrawal = () => {
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const { toast } = useToast();

  // Get withdrawal history
  const getWithdrawals = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals((data || []) as WithdrawalRecord[]);
      return data as WithdrawalRecord[];
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل تاريخ السحب",
        variant: "destructive"
      });
      return [];
    }
  }, [toast]);

  // Process withdrawal
  const processWithdrawal = useCallback(async (request: WithdrawalRequest) => {
    setLoading(true);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await supabase.functions.invoke('process-withdrawal', {
        body: request,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Withdrawal failed');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Withdrawal failed');
      }

      toast({
        title: "تم السحب بنجاح",
        description: `تم سحب ${request.internal_amount} ${request.internal_token_symbol} إلى ${request.target_token}`,
      });

      // Refresh withdrawals history
      await getWithdrawals();

      // Trigger balance refresh in wallet components
      window.dispatchEvent(new CustomEvent('withdrawalCompleted', {
        detail: response.data
      }));

      return response.data;

    } catch (error: any) {
      console.error('Withdrawal error:', error);
      const errorMessage = error.message || 'فشل في عملية السحب';
      
      toast({
        title: "خطأ في السحب",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, getWithdrawals]);

  // Calculate estimated target amount - MUST match edge function logic!
  const calculateTargetAmount = useCallback((internalAmount: number, targetToken: string) => {
    // Token prices in USD (must match edge function process-withdrawal/index.ts)
    const tokenPricesUsd: Record<string, number> = {
      'SOL': 100,
      'USDC': 1,
      'BTC': 40000,
      'ETH': 2000
    };

    // Internal token exchange rate (MSRA = 0.01 USD per token)
    const internalTokenUsdRate = 0.01;
    
    // Calculate: (internal_amount * internal_usd_rate) / target_price
    const internalValueUsd = internalAmount * internalTokenUsdRate;
    const targetPrice = tokenPricesUsd[targetToken] || 1;
    
    return internalValueUsd / targetPrice;
  }, []);

  // Get supported target tokens
  const getSupportedTokens = useCallback(() => {
    return [
      { symbol: 'SOL', name: 'Solana', network: 'Solana' },
      { symbol: 'USDC', name: 'USD Coin', network: 'Solana' },
      { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin' },
      { symbol: 'ETH', name: 'Ethereum', network: 'Ethereum' }
    ];
  }, []);

  return {
    loading,
    withdrawals,
    getWithdrawals,
    processWithdrawal,
    calculateTargetAmount,
    getSupportedTokens
  };
};