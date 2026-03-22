import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  getPiNetworkLabel,
  getPiNetworkMode,
  getPiSdkConfig,
  setPiNetworkMode as persistPiNetworkMode,
  type PiNetworkMode,
} from '@/config/pi';

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
  const [networkMode, setNetworkModeState] = useState<PiNetworkMode>(() => getPiNetworkMode());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [piUser, setPiUser] = useState<PiAuthResult['user'] | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const { user } = useAuth();
  const hasMountedRef = useRef(false);
  const PI_AUTH_STORAGE_KEY = 'pi_auth_state';

  const isPiBrowser = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.Pi !== 'undefined';
  }, []);

  const clearStoredAuth = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(PI_AUTH_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!isPiBrowser()) return;

    try {
      window.Pi.init(getPiSdkConfig(networkMode));
      console.log('Pi SDK initialized:', networkMode);
    } catch (error) {
      console.error('Pi SDK init error:', error);
    }
  }, [isPiBrowser, networkMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = window.sessionStorage.getItem(PI_AUTH_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        networkMode: PiNetworkMode;
        accessToken: string;
        user: PiAuthResult['user'];
      };

      if (parsed.networkMode === networkMode && parsed.accessToken && parsed.user) {
        setAccessToken(parsed.accessToken);
        setPiUser(parsed.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to restore Pi auth state:', error);
      clearStoredAuth();
    }
  }, [clearStoredAuth, networkMode]);

  useEffect(() => {
    persistPiNetworkMode(networkMode);

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    setIsAuthenticated(false);
    setPiUser(null);
    setAccessToken(null);
    clearStoredAuth();
    toast.info(`تم التحويل إلى ${getPiNetworkLabel(networkMode)} / Switched to ${getPiNetworkLabel(networkMode)}`);
  }, [clearStoredAuth, networkMode]);

  const setNetworkMode = useCallback((mode: PiNetworkMode) => {
    setNetworkModeState(mode);
  }, []);

  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined;
  }, []);

  const handleIncompletePayment = useCallback(async (payment: PiPaymentDTO) => {
    console.log('Incomplete payment found:', payment);
    // Try to complete the incomplete payment
    if (payment.transaction?.txid) {
      try {
        const headers = await getAuthHeaders();
        const { error } = await supabase.functions.invoke('pi-payment-complete', {
          body: { 
            paymentId: payment.identifier, 
            txid: payment.transaction.txid,
            accessToken,
            networkMode,
          },
          headers,
        });
        if (!error) {
          toast.success('تم إتمام الدفعة المعلقة / Pending payment completed');
        }
      } catch (err) {
        console.error('Error completing incomplete payment:', err);
      }
    }
    toast.info('تم العثور على دفعة غير مكتملة / Incomplete payment found');
  }, [accessToken, getAuthHeaders, networkMode]);

  const authenticate = useCallback(async () => {
    if (!isPiBrowser()) {
      toast.error('يرجى فتح التطبيق من Pi Browser / Please open from Pi Browser');
      return null;
    }

    setIsInitializing(true);
    
    try {
      const scopes = ['username', 'payments'];
      console.log('Starting Pi authentication with scopes:', scopes);
      
      const authResult = await window.Pi.authenticate(scopes, handleIncompletePayment);
      
      console.log('Pi authentication successful:', authResult);
      setIsAuthenticated(true);
      setPiUser(authResult.user);
      setAccessToken(authResult.accessToken);

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(PI_AUTH_STORAGE_KEY, JSON.stringify({
          networkMode,
          accessToken: authResult.accessToken,
          user: authResult.user,
        }));
      }
      
      toast.success(`مرحباً ${authResult.user.username || 'Pioneer'}! / Welcome!`);
      return authResult;
    } catch (error: any) {
      console.error('Pi authentication error:', error);
      const errorMessage = error?.message || 'Unknown error';
      toast.error(`فشل المصادقة: ${errorMessage} / Authentication failed`);
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, [handleIncompletePayment, isPiBrowser, networkMode]);

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
          piUserUid: piUser?.uid,
          piUsername: piUser?.username,
          networkMode,
          networkLabel: getPiNetworkLabel(networkMode),
          timestamp: new Date().toISOString(),
        },
      };

      const paymentCallbacks: PiPaymentCallbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('Payment ready for server approval:', paymentId);
          
          // Call your backend to approve the payment
          try {
            const headers = await getAuthHeaders();
            const { error } = await supabase.functions.invoke('pi-payment-approve', {
              body: { paymentId, accessToken, networkMode },
              headers,
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
            const headers = await getAuthHeaders();
            const { data, error } = await supabase.functions.invoke('pi-payment-complete', {
              body: { paymentId, txid, accessToken, networkMode },
              headers,
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
  }, [accessToken, getAuthHeaders, isAuthenticated, isPiBrowser, networkMode, piUser, user]);

  return {
    isPiBrowser: isPiBrowser(),
    isAuthenticated,
    piUser,
    accessToken,
    networkMode,
    networkLabel: getPiNetworkLabel(networkMode),
    isProcessing,
    isInitializing,
    setNetworkMode,
    authenticate,
    createPayment,
  };
};
