import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useSolanaWalletData = () => {
  const { publicKey, connected } = useWallet();
  const { user } = useAuth();
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // حفظ محفظة Solana في قاعدة البيانات
  const saveSolanaWallet = async () => {
    if (!publicKey || !user?.id) return;

    setLoading(true);
    try {
      // التحقق من وجود المحفظة
      const { data: existingWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('wallet_address', publicKey.toString())
        .eq('cryptocurrency', 'SOL')
        .single();

      if (!existingWallet) {
        // إنشاء محفظة جديدة
        const { data: newWallet, error } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            wallet_address: publicKey.toString(),
            wallet_type: 'crypto',
            cryptocurrency: 'SOL',
            networks: ['solana'],
            wallet_name: 'محفظة Solana',
            is_active: true,
            balance: 0
          })
          .select()
          .single();

        if (error) throw error;
        setWalletData(newWallet);
        toast.success('تم حفظ المحفظة بنجاح');
      } else {
        setWalletData(existingWallet);
      }
    } catch (error) {
      console.error('Error saving wallet:', error);
      toast.error('خطأ في حفظ المحفظة');
    } finally {
      setLoading(false);
    }
  };

  // تحديث رصيد المحفظة
  const updateWalletBalance = async (balance: number) => {
    if (!walletData) return;

    try {
      const { error } = await supabase
        .from('wallets')
        .update({ balance, updated_at: new Date().toISOString() })
        .eq('id', walletData.id);

      if (error) throw error;
      setWalletData({ ...walletData, balance });
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  // إضافة مكافأة airdrop
  const addAirdropReward = async (amount: number) => {
    if (!user?.id || !walletData) return;

    try {
      // إضافة معاملة الـ airdrop
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: walletData.id,
          user_id: user.id,
          amount,
          transaction_type: 'airdrop',
          description: 'مكافأة Solana Airdrop',
          status: 'completed',
          network: 'solana'
        });

      if (transactionError) throw transactionError;

      // تحديث الرصيد
      await updateWalletBalance(walletData.balance + amount);
      
      toast.success(`تم إضافة ${amount} SOL كمكافأة!`);
    } catch (error) {
      console.error('Error adding airdrop reward:', error);
      toast.error('خطأ في إضافة المكافأة');
    }
  };

  // جلب تاريخ المعاملات
  const getTransactionHistory = async () => {
    if (!walletData) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', walletData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  };

  useEffect(() => {
    if (connected && publicKey && user?.id) {
      saveSolanaWallet();
    }
  }, [connected, publicKey, user?.id]);

  return {
    walletData,
    loading,
    updateWalletBalance,
    addAirdropReward,
    getTransactionHistory,
    saveSolanaWallet
  };
};