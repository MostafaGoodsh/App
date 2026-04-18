import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InternalToken {
  id: string;
  symbol: string;
  name: string;
  description?: string;
  icon_url?: string;
  decimals: number;
  is_active: boolean;
  is_base_currency: boolean;
  exchange_rate_usd: number;
}

export interface InternalBalance {
  id: string;
  token_id: string;
  balance: number;
  locked_balance: number;
  token: InternalToken;
}

export interface InternalSwap {
  id: string;
  from_token_id: string;
  to_token_id: string;
  from_amount: number;
  to_amount: number;
  exchange_rate: number;
  fee_amount: number;
  status: string;
  created_at: string;
}

export const useInternalWallet = () => {
  const [tokens, setTokens] = useState<InternalToken[]>([]);
  const [balances, setBalances] = useState<InternalBalance[]>([]);
  const [swapHistory, setSwapHistory] = useState<InternalSwap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // تحميل العملات المتاحة
  const loadTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('internal_tokens')
        .select('*')
        .eq('is_active', true)
        .order('is_base_currency', { ascending: false })
        .order('symbol');

      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error('Error loading tokens:', error);
      toast({
        title: 'خطأ في تحميل العملات',
        description: 'حدث خطأ أثناء تحميل العملات المتاحة',
        variant: 'destructive',
      });
    }
  };

  // تحميل أرصدة المستخدم
  const loadBalances = async () => {
    try {
      const { data, error } = await supabase
        .from('internal_wallet_balances')
        .select(`
          *,
          token:internal_tokens(*)
        `)
        .order('balance', { ascending: false });

      if (error) throw error;
      setBalances(data || []);
    } catch (error) {
      console.error('Error loading balances:', error);
      toast({
        title: 'خطأ في تحميل الأرصدة',
        description: 'حدث خطأ أثناء تحميل أرصدة المحفظة',
        variant: 'destructive',
      });
    }
  };

  // تحميل تاريخ التبديل
  const loadSwapHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('internal_swaps')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSwapHistory(data || []);
    } catch (error) {
      console.error('Error loading swap history:', error);
    }
  };

  // تبديل العملات
  const swapTokens = async (
    fromTokenSymbol: string,
    toTokenSymbol: string,
    amount: number
  ) => {
    try {
      setIsLoading(true);

      const { data: result, error } = await supabase.rpc('internal_token_swap', {
        p_from_token_symbol: fromTokenSymbol,
        p_to_token_symbol: toTokenSymbol,
        p_from_amount: amount,
      });

      if (error) throw error;

      const data = result as any;
      
      if (!data?.success) {
        throw new Error(data?.error || 'حدث خطأ في التبديل');
      }

      toast({
        title: 'تم التبديل بنجاح!',
        description: `تم تبديل ${data.from_amount} ${data.from_token} إلى ${Number(data.to_amount || 0).toFixed(2)} ${data.to_token}`,
      });

      // إعادة تحميل البيانات
      await Promise.all([loadBalances(), loadSwapHistory()]);
      
      return data;
    } catch (error: any) {
      console.error('Swap error:', error);
      toast({
        title: 'فشل في التبديل',
        description: error.message || 'حدث خطأ أثناء عملية التبديل',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // الحصول على رصيد عملة معينة
  const getTokenBalance = (tokenSymbol: string): number => {
    const balance = balances.find(b => b.token.symbol === tokenSymbol);
    return balance?.balance || 0;
  };

  // الحصول على معدل التبديل بين عملتين
  const getExchangeRate = (fromSymbol: string, toSymbol: string): number => {
    const fromToken = tokens.find(t => t.symbol === fromSymbol);
    const toToken = tokens.find(t => t.symbol === toSymbol);
    
    if (!fromToken || !toToken) return 0;
    
    return fromToken.exchange_rate_usd / toToken.exchange_rate_usd;
  };

  // حساب القيمة بالدولار لرصيد معين
  const getUSDValue = (tokenSymbol: string, amount: number): number => {
    const token = tokens.find(t => t.symbol === tokenSymbol);
    if (!token) return 0;
    return amount * token.exchange_rate_usd;
  };

  // الحصول على إجمالي القيمة بالدولار
  const getTotalUSDValue = (): number => {
    return balances.reduce((total, balance) => {
      return total + getUSDValue(balance.token.symbol, balance.balance);
    }, 0);
  };

  useEffect(() => {
    const initializeWallet = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadTokens(),
          loadBalances(),
          loadSwapHistory(),
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeWallet();
  }, []);

  // Real-time balance updates
  useEffect(() => {
    const channel = supabase
      .channel(`wallet-balances-realtime-${crypto.randomUUID()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'internal_wallet_balances',
      }, () => {
        loadBalances();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    tokens,
    balances,
    swapHistory,
    isLoading,
    swapTokens,
    getTokenBalance,
    getExchangeRate,
    getUSDValue,
    getTotalUSDValue,
    refreshData: async () => {
      await Promise.all([loadTokens(), loadBalances(), loadSwapHistory()]);
    },
  };
};