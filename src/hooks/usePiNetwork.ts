import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

declare global {
  interface Window {
    Pi: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: PiPaymentDTO) => void
      ) => Promise<PiAuthResult>;
      createPayment: (
        paymentData: PiPaymentData,
        callbacks: PiPaymentCallbacks
      ) => Promise<PiPaymentDTO>;
    };
  }
}

interface PiAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username?: string;
  };
}

interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, any>;
}

interface PiPaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  from_address: string;
  to_address: string;
  direction: string;
  created_at: string;
  network: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: {
    txid: string;
    verified: boolean;
    _link: string;
  } | null;
}

interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PiPaymentDTO) => void;
}

export const usePiNetwork = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [piUser, setPiUser] = useState<PiAuthResult['user'] | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const isPiBrowser = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.Pi !== 'undefined';
  }, []);

  const handleIncompletePayment = useCallback(async (payment: PiPaymentDTO) => {
    console.log('Incomplete payment found:', payment);
    // Handle incomplete payment - you may want to complete or cancel it
    toast.info('تم العثور على دفعة غير مكتملة / Incomplete payment found');
  }, []);

  const authenticate = useCallback(async () => {
    if (!isPiBrowser()) {
      toast.error('يرجى فتح التطبيق من Pi Browser / Please open from Pi Browser');
      return null;
    }

    try {
      const scopes = ['username', 'payments'];
      const authResult = await window.Pi.authenticate(scopes, handleIncompletePayment);
      
      setIsAuthenticated(true);
      setPiUser(authResult.user);
      setAccessToken(authResult.accessToken);
      
      toast.success(`مرحباً ${authResult.user.username || 'Pioneer'}!`);
      return authResult;
    } catch (error) {
      console.error('Pi authentication error:', error);
      toast.error('فشل المصادقة / Authentication failed');
      return null;
    }
  }, [isPiBrowser, handleIncompletePayment]);

  const createPayment = useCallback(async (
    amount: number,
    memo: string,
    metadata: Record<string, any> = {}
  ) => {
    if (!isPiBrowser()) {
      toast.error('يرجى فتح التطبيق من Pi Browser / Please open from Pi Browser');
      return null;
    }

    if (!isAuthenticated) {
      toast.error('يرجى تسجيل الدخول أولاً / Please authenticate first');
      return null;
    }

    setIsProcessing(true);

    try {
      const paymentData: PiPaymentData = {
        amount,
        memo,
        metadata: {
          ...metadata,
          userId: user?.id,
          timestamp: new Date().toISOString(),
        },
      };

      const paymentCallbacks: PiPaymentCallbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('Payment ready for server approval:', paymentId);
          
          // Call your backend to approve the payment
          try {
            const { error } = await supabase.functions.invoke('pi-payment-approve', {
              body: { paymentId, accessToken }
            });
            
            if (error) {
              console.error('Server approval error:', error);
              toast.error('فشل الموافقة على الدفع / Payment approval failed');
            }
          } catch (err) {
            console.error('Server approval exception:', err);
          }
        },
        
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('Payment ready for completion:', paymentId, txid);
          
          // Call your backend to complete the payment
          try {
            const { data, error } = await supabase.functions.invoke('pi-payment-complete', {
              body: { paymentId, txid, accessToken }
            });
            
            if (error) {
              console.error('Server completion error:', error);
              toast.error('فشل إتمام الدفع / Payment completion failed');
            } else {
              toast.success('تم الدفع بنجاح! / Payment successful!');
            }
          } catch (err) {
            console.error('Server completion exception:', err);
          }
          
          setIsProcessing(false);
        },
        
        onCancel: (paymentId: string) => {
          console.log('Payment cancelled:', paymentId);
          toast.info('تم إلغاء الدفع / Payment cancelled');
          setIsProcessing(false);
        },
        
        onError: (error: Error, payment?: PiPaymentDTO) => {
          console.error('Payment error:', error, payment);
          toast.error(`خطأ في الدفع: ${error.message}`);
          setIsProcessing(false);
        },
      };

      const payment = await window.Pi.createPayment(paymentData, paymentCallbacks);
      console.log('Payment created:', payment);
      return payment;
    } catch (error) {
      console.error('Create payment error:', error);
      toast.error('فشل إنشاء الدفع / Failed to create payment');
      setIsProcessing(false);
      return null;
    }
  }, [isPiBrowser, isAuthenticated, user, accessToken]);

  return {
    isPiBrowser: isPiBrowser(),
    isAuthenticated,
    piUser,
    accessToken,
    isProcessing,
    authenticate,
    createPayment,
  };
};
