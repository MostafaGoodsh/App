import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConversionSettings {
  id: string;
  points_to_token_rate: number;
  minimum_conversion_points: number;
  maximum_conversion_points: number;
  daily_conversion_limit: number;
  token_name: string;
  token_symbol: string;
  token_decimals: number;
}

interface PointsBalance {
  total_points: number;
  available_points: number;
  converted_points: number;
}

interface ConversionRecord {
  id: string;
  points_amount: number;
  token_amount: number;
  conversion_rate: number;
  token_mint_address: string;
  transaction_signature: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at: string;
}

export const usePointsConversion = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<ConversionSettings | null>(null);
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(null);
  const [conversions, setConversions] = useState<ConversionRecord[]>([]);
  const { toast } = useToast();

  // Get conversion settings
  const getConversionSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('conversion_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setSettings(data);
      return data;
    } catch (error) {
      console.error('Error fetching conversion settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل إعدادات التحويل",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Get user's points balance
  const getPointsBalance = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('update_user_points_balance', {
        p_user_id: user.user.id
      });

      if (error) throw error;
      setPointsBalance(data as unknown as PointsBalance);
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('pointsBalanceUpdated', {
        detail: data
      }));
      
      return data as unknown as PointsBalance;
    } catch (error) {
      console.error('Error fetching points balance:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل رصيد النقاط",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Get user's conversion history
  const getConversions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('point_to_token_conversions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversions((data || []) as ConversionRecord[]);
      return data as ConversionRecord[];
    } catch (error) {
      console.error('Error fetching conversions:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل تاريخ التحويلات",
        variant: "destructive"
      });
      return [];
    }
  }, [toast]);

  // Convert points to tokens
  const convertPointsToTokens = useCallback(async (pointsAmount: number, walletAddress: string) => {
    if (!settings || !pointsBalance) {
      throw new Error('Settings or balance not loaded');
    }

    if (pointsAmount < settings.minimum_conversion_points) {
      throw new Error(`الحد الأدنى للتحويل ${settings.minimum_conversion_points} نقطة`);
    }

    if (pointsAmount > settings.maximum_conversion_points) {
      throw new Error(`الحد الأقصى للتحويل ${settings.maximum_conversion_points} نقطة`);
    }

    if (pointsAmount > pointsBalance.available_points) {
      throw new Error('عدد النقاط المتاح غير كافي');
    }

    setLoading(true);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await supabase.functions.invoke('convert-points-to-tokens', {
        body: {
          points_amount: pointsAmount,
          user_wallet_address: walletAddress
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Conversion failed');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Conversion failed');
      }

      toast({
        title: "تم التحويل بنجاح",
        description: `تم تحويل ${pointsAmount} نقطة إلى ${response.data.data.tokens_received} ${settings.token_symbol}`,
      });

      // Refresh data
      await Promise.all([
        getPointsBalance(),
        getConversions()
      ]);

      // Trigger token refresh in wallet
      window.dispatchEvent(new CustomEvent('tokenConversionCompleted', {
        detail: {
          mintAddress: response.data.data.token_mint,
          tokenAmount: response.data.data.tokens_received,
          walletAddress: walletAddress
        }
      }));

      return response.data.data;

    } catch (error: any) {
      console.error('Conversion error:', error);
      const errorMessage = error.message || 'فشل في تحويل النقاط';
      
      toast({
        title: "خطأ في التحويل",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [settings, pointsBalance, toast, getPointsBalance, getConversions]);

  // Calculate token amount from points
  const calculateTokenAmount = useCallback((points: number) => {
    if (!settings) return 0;
    return points / settings.points_to_token_rate;
  }, [settings]);

  return {
    loading,
    settings,
    pointsBalance,
    conversions,
    getConversionSettings,
    getPointsBalance,
    getConversions,
    convertPointsToTokens,
    calculateTokenAmount
  };
};