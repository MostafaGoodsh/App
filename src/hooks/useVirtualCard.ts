import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VirtualCard {
  id: string;
  user_id: string;
  card_type: string;
  card_number_last4: string;
  card_holder_name: string | null;
  expiry_month: number;
  expiry_year: number;
  cvv_hash: string;
  status: string;
  card_color: string | null;
  daily_limit: number;
  monthly_limit: number;
  total_spent: number;
  currency: string;
  balance: number;
  is_contactless_enabled: boolean;
  is_online_enabled: boolean;
  is_international_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CardTransaction {
  id: string;
  card_id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  merchant_name: string | null;
  merchant_category: string | null;
  description: string | null;
  status: string;
  source_type: string | null;
  source_token_symbol: string | null;
  reference_id: string | null;
  created_at: string;
}

export const useVirtualCard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['virtual-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('virtual_cards')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as VirtualCard[];
    },
  });

  const activeCard = cards.find(c => c.status === 'active') || cards[0];

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['virtual-card-transactions', activeCard?.id],
    queryFn: async () => {
      if (!activeCard) return [];
      const { data, error } = await supabase
        .from('virtual_card_transactions')
        .select('*')
        .eq('card_id', activeCard.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as CardTransaction[];
    },
    enabled: !!activeCard,
  });

  const createCard = useMutation({
    mutationFn: async (cardType: 'visa' | 'mastercard') => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('virtual_cards')
        .insert({
          user_id: user.id,
          card_type: cardType,
          card_holder_name: profile?.full_name || 'Card Holder',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-cards'] });
      toast({ title: '✅ تم إنشاء الكارت بنجاح', description: 'الكارت الافتراضي جاهز للاستخدام' });
    },
    onError: (err: Error) => {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    },
  });

  const topupCard = useMutation({
    mutationFn: async ({ amount, tokenSymbol }: { amount: number; tokenSymbol: string }) => {
      if (!activeCard) throw new Error('No active card');
      const { data, error } = await supabase.rpc('topup_virtual_card', {
        p_card_id: activeCard.id,
        p_amount: amount,
        p_token_symbol: tokenSymbol,
      });
      if (error) throw error;
      return data as unknown as { success: boolean; error?: string; credited_usd?: number; new_balance?: number };
    },
    onSuccess: (data) => {
      if (data && typeof data === 'object' && 'success' in data) {
        const result = data as { success: boolean; error?: string; credited_usd?: number };
        if (result.success) {
          queryClient.invalidateQueries({ queryKey: ['virtual-cards'] });
          queryClient.invalidateQueries({ queryKey: ['virtual-card-transactions'] });
          queryClient.invalidateQueries({ queryKey: ['internal-wallet'] });
          toast({ title: '✅ تم الشحن', description: `تم إضافة $${result.credited_usd} للكارت` });
        } else {
          toast({ title: 'خطأ', description: result.error, variant: 'destructive' });
        }
      }
    },
    onError: (err: Error) => {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
    },
  });

  const toggleCardStatus = useMutation({
    mutationFn: async (newStatus: 'active' | 'frozen') => {
      if (!activeCard) throw new Error('No card');
      const { error } = await supabase
        .from('virtual_cards')
        .update({ status: newStatus })
        .eq('id', activeCard.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-cards'] });
      toast({ title: '✅ تم التحديث' });
    },
  });

  const updateCardSettings = useMutation({
    mutationFn: async (settings: Partial<VirtualCard>) => {
      if (!activeCard) throw new Error('No card');
      const { error } = await supabase
        .from('virtual_cards')
        .update(settings)
        .eq('id', activeCard.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-cards'] });
      toast({ title: '✅ تم حفظ الإعدادات' });
    },
  });

  return {
    cards,
    activeCard,
    transactions,
    cardsLoading,
    txLoading,
    createCard,
    topupCard,
    toggleCardStatus,
    updateCardSettings,
  };
};
