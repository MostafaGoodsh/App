import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentRequest {
  amount: number;
  payment_method: 'vodafone_cash' | 'orange_cash' | 'etisalat_cash' | 'fawry' | 'card';
  phone_number?: string;
  internal_token_symbol: string;
}

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  provider: string;
  provider_transaction_id: string | null;
  tokens_credited: number;
  created_at: string;
  completed_at: string | null;
}

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const { toast } = useToast();

  // Get payment history
  const getTransactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions((data || []) as PaymentTransaction[]);
      return data as PaymentTransaction[];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل سجل المعاملات",
        variant: "destructive"
      });
      return [];
    }
  }, [toast]);

  // Process payment
  const processPayment = useCallback(async (request: PaymentRequest) => {
    setLoading(true);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await supabase.functions.invoke('process-payment', {
        body: request,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Payment failed');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Payment failed');
      }

      toast({
        title: "تم بدء عملية الدفع",
        description: `سيتم إضافة ${response.data.tokens_to_credit.toFixed(2)} ${request.internal_token_symbol}`,
      });

      // فتح صفحة الدفع في نافذة جديدة
      if (response.data.payment_url) {
        window.open(response.data.payment_url, '_blank', 'width=600,height=800');
      }

      // Refresh transactions history
      await getTransactions();

      return response.data;

    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.message || 'فشل في عملية الدفع';
      
      toast({
        title: "خطأ في الدفع",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, getTransactions]);

  // Get supported payment methods
  const getSupportedMethods = useCallback(() => {
    return [
      { 
        id: 'vodafone_cash', 
        name: 'فودافون كاش', 
        name_en: 'Vodafone Cash',
        icon: '📱',
        color: 'from-red-500 to-red-600'
      },
      { 
        id: 'orange_cash', 
        name: 'أورانج كاش', 
        name_en: 'Orange Cash',
        icon: '🍊',
        color: 'from-orange-500 to-orange-600'
      },
      { 
        id: 'etisalat_cash', 
        name: 'اتصالات كاش', 
        name_en: 'Etisalat Cash',
        icon: '💚',
        color: 'from-green-500 to-green-600'
      },
      { 
        id: 'fawry', 
        name: 'فوري', 
        name_en: 'Fawry',
        icon: '🏪',
        color: 'from-yellow-500 to-yellow-600'
      },
      { 
        id: 'card', 
        name: 'بطاقة ائتمان', 
        name_en: 'Credit Card',
        icon: '💳',
        color: 'from-blue-500 to-blue-600'
      }
    ];
  }, []);

  // Check payment status
  const checkPaymentStatus = useCallback(async (transactionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: { transaction_id: transactionId }
      });

      if (error) throw error;

      toast({
        title: data.status === 'completed' ? '✅ تم الدفع بنجاح' : 
               data.status === 'failed' ? '❌ فشل الدفع' : 
               'ℹ️ الدفع قيد المعالجة',
        description: data.message
      });

      // Refresh transactions list
      await getTransactions();

      return data;
    } catch (error: any) {
      console.error('Check payment status error:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل التحقق من حالة الدفع",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast, getTransactions]);

  return {
    loading,
    transactions,
    getTransactions,
    processPayment,
    checkPaymentStatus,
    getSupportedMethods
  };
};
