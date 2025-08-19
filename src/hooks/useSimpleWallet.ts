import { useState, useCallback, useEffect } from 'react';

export interface SimpleWallet {
  id: string;
  name: string;
  type: 'metamask' | 'phantom' | 'internal' | 'external';
  address: string;
  balance: string;
  currency: string;
  network: string;
  connected: boolean;
}

export const useSimpleWallet = () => {
  const [wallets, setWallets] = useState<SimpleWallet[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load wallets from localStorage on mount
  useEffect(() => {
    const savedWallets = localStorage.getItem('connected-wallets');
    if (savedWallets) {
      try {
        const parsed = JSON.parse(savedWallets);
        setWallets(parsed);
      } catch (error) {
        console.error('Failed to load wallets:', error);
        setWallets([]);
      }
    }
  }, []);

  // Save wallets to localStorage whenever wallets change
  useEffect(() => {
    localStorage.setItem('connected-wallets', JSON.stringify(wallets));
  }, [wallets]);

  const connectMetaMask = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('يرجى تثبيت MetaMask أولاً');
      }

      console.log('Connecting to MetaMask...');
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('لم يتم العثور على حسابات MetaMask');
      }

      const address = accounts[0];
      console.log('MetaMask connected:', address);
      
      const newWallet: SimpleWallet = {
        id: `metamask-${Date.now()}`,
        name: 'MetaMask',
        type: 'metamask',
        address,
        balance: '0.0',
        currency: 'ETH',
        network: 'Ethereum',
        connected: true
      };

      setWallets(prev => {
        const exists = prev.find(w => w.address === address && w.type === 'metamask');
        if (exists) {
          console.log('MetaMask wallet already exists');
          return prev;
        }
        console.log('Adding new MetaMask wallet');
        return [...prev, newWallet];
      });

      return newWallet;
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      throw new Error(error.message || 'فشل في الاتصال بـ MetaMask');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectPhantom = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Check if Phantom is installed
      if (typeof window.solana === 'undefined' || !window.solana.isPhantom) {
        throw new Error('يرجى تثبيت Phantom أولاً');
      }

      console.log('Connecting to Phantom...');
      const response = await window.solana.connect();
      
      if (!response.publicKey) {
        throw new Error('فشل في الحصول على المفتاح العام');
      }

      const address = response.publicKey.toString();
      console.log('Phantom connected:', address);

      const newWallet: SimpleWallet = {
        id: `phantom-${Date.now()}`,
        name: 'Phantom',
        type: 'phantom',
        address,
        balance: '0.0',
        currency: 'SOL',
        network: 'Solana',
        connected: true
      };

      setWallets(prev => {
        const exists = prev.find(w => w.address === address && w.type === 'phantom');
        if (exists) {
          console.log('Phantom wallet already exists');
          return prev;
        }
        console.log('Adding new Phantom wallet');
        return [...prev, newWallet];
      });

      return newWallet;
    } catch (error: any) {
      console.error('Phantom connection error:', error);
      throw new Error(error.message || 'فشل في الاتصال بـ Phantom');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const addInternalWallet = useCallback((walletData: {
    name: string;
    network: 'Ethereum' | 'Solana';
  }) => {
    const address = generateMockAddress(walletData.network);
    const newWallet: SimpleWallet = {
      id: `internal-${Date.now()}`,
      name: walletData.name,
      type: 'internal',
      address,
      balance: '0.0',
      currency: walletData.network === 'Ethereum' ? 'ETH' : 'SOL',
      network: walletData.network,
      connected: true
    };

    setWallets(prev => [...prev, newWallet]);
    return newWallet;
  }, []);

  const disconnectWallet = useCallback((walletId: string) => {
    setWallets(prev => prev.filter(w => w.id !== walletId));
  }, []);

  const refreshBalance = useCallback(async (walletId: string) => {
    // Simulate balance refresh
    const mockBalance = (Math.random() * 10).toFixed(3);
    setWallets(prev => 
      prev.map(w => 
        w.id === walletId 
          ? { ...w, balance: mockBalance }
          : w
      )
    );
  }, []);

  return {
    wallets,
    isConnecting,
    connectMetaMask,
    connectPhantom,
    addInternalWallet,
    disconnectWallet,
    refreshBalance
  };
};

// Helper function to generate mock addresses
function generateMockAddress(network: 'Ethereum' | 'Solana'): string {
  if (network === 'Ethereum') {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  } else {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789';
    let address = '';
    for (let i = 0; i < 44; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  }
}

// Type declarations for wallet providers
declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}