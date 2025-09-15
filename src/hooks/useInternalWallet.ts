import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface InternalToken {
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  logoUri?: string;
  isNative?: boolean;
}

const DEFAULT_TOKENS: InternalToken[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    balance: 2.5,
    decimals: 9,
    isNative: true,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 100.0,
    decimals: 6,
  },
  {
    symbol: 'MSRA',
    name: 'MsRa Token',
    balance: 50.0,
    decimals: 9,
  }
];

export const useInternalWallet = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<InternalToken[]>(DEFAULT_TOKENS);
  const [isLoading, setIsLoading] = useState(false);

  // تحميل أرصدة المحفظة من التخزين المحلي
  const loadWalletBalances = useCallback(() => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const savedBalances = localStorage.getItem(`wallet_balances_${user.id}`);
      if (savedBalances) {
        const balances = JSON.parse(savedBalances);
        const updatedTokens = DEFAULT_TOKENS.map(token => {
          const savedBalance = balances[token.symbol];
          return savedBalance !== undefined 
            ? { ...token, balance: savedBalance }
            : token;
        });
        setTokens(updatedTokens);
      }
    } catch (error) {
      console.error('Error loading wallet balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // حفظ أرصدة المحفظة في التخزين المحلي
  const saveWalletBalances = useCallback((updatedTokens: InternalToken[]) => {
    if (!user) return;

    try {
      const balances: Record<string, number> = {};
      updatedTokens.forEach(token => {
        balances[token.symbol] = token.balance;
      });
      localStorage.setItem(`wallet_balances_${user.id}`, JSON.stringify(balances));
    } catch (error) {
      console.error('Error saving wallet balances:', error);
    }
  }, [user]);

  // تحديث رصيد عملة معينة
  const updateTokenBalance = useCallback((symbol: string, newBalance: number) => {
    setTokens(prevTokens => {
      const updatedTokens = prevTokens.map(token =>
        token.symbol === symbol 
          ? { ...token, balance: Math.max(0, newBalance) }
          : token
      );
      
      // حفظ في قاعدة البيانات
      saveWalletBalances(updatedTokens);
      
      return updatedTokens;
    });
  }, [saveWalletBalances]);

  // تبديل العملات
  const swapTokens = useCallback((
    fromSymbol: string,
    toSymbol: string,
    fromAmount: number,
    exchangeRate: number
  ) => {
    const toAmount = fromAmount * exchangeRate;
    
    setTokens(prevTokens => {
      const updatedTokens = prevTokens.map(token => {
        if (token.symbol === fromSymbol) {
          return { ...token, balance: Math.max(0, token.balance - fromAmount) };
        }
        if (token.symbol === toSymbol) {
          return { ...token, balance: token.balance + toAmount };
        }
        return token;
      });
      
      // حفظ في قاعدة البيانات
      saveWalletBalances(updatedTokens);
      
      return updatedTokens;
    });

    return { fromAmount, toAmount };
  }, [saveWalletBalances]);

  // إضافة عملة جديدة
  const addToken = useCallback((token: InternalToken) => {
    setTokens(prevTokens => {
      const exists = prevTokens.find(t => t.symbol === token.symbol);
      if (exists) return prevTokens;
      
      const updatedTokens = [...prevTokens, token];
      saveWalletBalances(updatedTokens);
      return updatedTokens;
    });
  }, [saveWalletBalances]);

  // طلب airdrop (إضافة SOL مجاني)
  const requestAirdrop = useCallback((amount: number = 1) => {
    updateTokenBalance('SOL', 
      tokens.find(t => t.symbol === 'SOL')?.balance + amount || amount
    );
    
    // إرسال حدث مخصص
    window.dispatchEvent(new CustomEvent('wallet-airdrop-completed', {
      detail: { amount, symbol: 'SOL' }
    }));
  }, [tokens, updateTokenBalance]);

  useEffect(() => {
    loadWalletBalances();
  }, [loadWalletBalances]);

  return {
    tokens,
    isLoading,
    updateTokenBalance,
    swapTokens,
    addToken,
    requestAirdrop,
    refreshBalances: loadWalletBalances
  };
};