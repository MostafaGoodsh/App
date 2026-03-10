import { useState } from 'react';

interface PaymentState {
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
}

const usePayNetworkPayment = () => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    amount: 0,
    currency: 'USD',
    status: 'pending',
  });

  const processPayment = async (amount: number, currency: string) => {
    setPaymentState({ amount, currency, status: 'pending' });
    try {
      const response = await fakePaymentProcessor(amount, currency);
      setPaymentState({ amount, currency, status: response.status });
    } catch (error) {
      setPaymentState({ amount, currency, status: 'failed' });
      console.error('Payment processing failed:', error);
    }
  };

  return { paymentState, processPayment };
};

const fakePaymentProcessor = async (_amount: number, _currency: string): Promise<{ status: 'success' | 'failed' }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 'success' });
    }, 1000);
  });
};

export default usePayNetworkPayment;
