import { useState, useEffect, useCallback } from 'react';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import { WALLETCONNECT_CONFIG } from '@/config/wallet';

export interface ConnectedWallet {
  id: string;
  type: 'WalletConnect' | 'MetaMask' | 'Phantom';
  address: string;
  balance: string;
  currency: string;
  network: 'Ethereum' | 'Solana';
  name?: string;
  provider?: any;
}

export const useWalletConnect = () => {
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wcProvider, setWcProvider] = useState<any>(null);

  // Load saved wallets from localStorage
  useEffect(() => {
    const savedWallets = localStorage.getItem('connectedWallets');
    if (savedWallets) {
      try {
        const loadedWallets = JSON.parse(savedWallets);
        setConnectedWallets(loadedWallets);
      } catch (error) {
        console.error('Error loading saved wallets:', error);
      }
    }
  }, []);

  // Save wallets to localStorage
  useEffect(() => {
    const walletsToSave = connectedWallets.map(wallet => ({
      ...wallet,
      provider: undefined
    }));
    localStorage.setItem('connectedWallets', JSON.stringify(walletsToSave));
  }, [connectedWallets]);

  const getBalance = useCallback(async (address: string, provider?: any) => {
    try {
      if (provider) {
        const ethersProvider = new ethers.BrowserProvider(provider);
        const balance = await ethersProvider.getBalance(address);
        return ethers.formatEther(balance);
      }
      return "0.0";
    } catch (error) {
      console.error('Error getting balance:', error);
      return "0.0";
    }
  }, []);

  const connectWalletConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      if (wcProvider) {
        try {
          await wcProvider.disconnect();
        } catch (e) {
          console.warn('Error disconnecting existing provider:', e);
        }
      }

      const provider = await EthereumProvider.init({
        chains: WALLETCONNECT_CONFIG.chains,
        optionalChains: [137], // Polygon as optional chain
        projectId: WALLETCONNECT_CONFIG.projectId,
        showQrModal: true,
        qrModalOptions: WALLETCONNECT_CONFIG.qrModalOptions,
        metadata: {
          ...WALLETCONNECT_CONFIG.metadata,
          url: window.location.origin,
          icons: [window.location.origin + '/favicon.ico']
        }
      });

      provider.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setConnectedWallets(prev => prev.filter(w => w.type !== 'WalletConnect'));
        }
      });

      provider.on('disconnect', () => {
        setConnectedWallets(prev => prev.filter(w => w.type !== 'WalletConnect'));
        setWcProvider(null);
      });

      setWcProvider(provider);

      await provider.connect();
      
      const accounts = provider.accounts;
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        const balance = await getBalance(address, provider);
        
        const newWallet: ConnectedWallet = {
          id: Date.now().toString(),
          type: 'WalletConnect',
          address,
          balance,
          currency: 'ETH',
          network: 'Ethereum',
          provider
        };

        setConnectedWallets(prev => {
          const exists = prev.find(w => w.address === address && w.type === 'WalletConnect');
          if (exists) return prev;
          return [...prev, newWallet];
        });

        return newWallet;
      }
      return null;
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      if (wcProvider) {
        try {
          await wcProvider.disconnect();
        } catch (e) {
          console.warn('Error cleaning up provider:', e);
        }
        setWcProvider(null);
      }
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [getBalance, wcProvider]);

  const connectMetaMask = useCallback(async () => {
    if (!(window as any).ethereum?.isMetaMask) {
      window.open('https://metamask.io/download/', '_blank');
      throw new Error('يرجى تثبيت محفظة MetaMask أولاً');
    }

    setIsConnecting(true);
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const balance = await getBalance(accounts[0], (window as any).ethereum);
      
      const newWallet: ConnectedWallet = {
        id: Date.now().toString(),
        type: 'MetaMask',
        address: accounts[0],
        balance,
        currency: 'ETH',
        network: 'Ethereum',
        provider: (window as any).ethereum
      };

      setConnectedWallets(prev => {
        const exists = prev.find(w => w.address === accounts[0] && w.type === 'MetaMask');
        if (exists) return prev;
        return [...prev, newWallet];
      });

      return newWallet;
    } catch (error) {
      console.error('MetaMask connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [getBalance]);

  const connectPhantom = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      // Check for Phantom wallet in browser
      const getPhantom = () => {
        if (typeof window === 'undefined') return null;
        
        // Primary check for Phantom
        if ((window as any).phantom?.solana?.isPhantom) {
          return (window as any).phantom.solana;
        }
        
        // Secondary check for direct solana provider
        if ((window as any).solana?.isPhantom) {
          return (window as any).solana;
        }
        
        return null;
      };

      let phantomProvider = getPhantom();
      
      // Wait a bit for injection if not immediately available
      if (!phantomProvider) {
        await new Promise(resolve => setTimeout(resolve, 100));
        phantomProvider = getPhantom();
      }
      
      console.log('Phantom detection:', {
        found: !!phantomProvider,
        isPhantom: phantomProvider?.isPhantom,
        phantom: !!(window as any).phantom,
        solana: !!(window as any).solana
      });
      
      if (!phantomProvider) {
        window.open('https://phantom.app/', '_blank');
        throw new Error('يرجى تثبيت محفظة Phantom أولاً');
      }

      console.log('Attempting Phantom connection...');
      
      const response = await phantomProvider.connect({ onlyIfTrusted: false });
      const address = response.publicKey.toString();
      
      console.log('Phantom connected successfully:', address);
      
      // Get Solana balance
      let balance = "0.0";
      try {
        const connection = new (await import('@solana/web3.js')).Connection(
          'https://api.mainnet-beta.solana.com',
          'confirmed'
        );
        const publicKey = new (await import('@solana/web3.js')).PublicKey(address);
        const balanceResponse = await connection.getBalance(publicKey);
        balance = (balanceResponse / 1000000000).toFixed(4);
      } catch (error) {
        console.error("Error fetching Solana balance:", error);
      }

      const newWallet: ConnectedWallet = {
        id: Date.now().toString(),
        type: 'Phantom',
        address,
        balance,
        currency: 'SOL',
        network: 'Solana',
        provider: phantomProvider
      };

      setConnectedWallets(prev => {
        const exists = prev.find(w => w.address === address && w.type === 'Phantom');
        if (exists) return prev;
        return [...prev, newWallet];
      });

      return newWallet;
    } catch (error) {
      console.error('Phantom connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback((walletId: string) => {
    setConnectedWallets(prev => prev.filter(w => w.id !== walletId));
  }, []);

  const refreshBalance = useCallback(async (wallet: ConnectedWallet) => {
    const newBalance = await getBalance(wallet.address, wallet.provider);
    setConnectedWallets(prev => 
      prev.map(w => w.id === wallet.id ? { ...w, balance: newBalance } : w)
    );
    return newBalance;
  }, [getBalance]);

  const sendTransaction = useCallback(async (
    wallet: ConnectedWallet,
    toAddress: string,
    amount: string
  ) => {
    if (!wallet.provider) {
      throw new Error('No provider available');
    }

    if (wallet.network === 'Ethereum') {
      const ethersProvider = new ethers.BrowserProvider(wallet.provider);
      const signer = await ethersProvider.getSigner();
      
      const transaction = {
        to: toAddress,
        value: ethers.parseEther(amount)
      };
      
      const tx = await signer.sendTransaction(transaction);
      await tx.wait();
      
      await refreshBalance(wallet);
      
      return tx.hash;
    } else {
      throw new Error('Solana transactions not yet implemented');
    }
  }, [refreshBalance]);

  return {
    connectedWallets,
    isConnecting,
    connectWalletConnect,
    connectMetaMask,
    connectPhantom,
    disconnectWallet,
    refreshBalance,
    sendTransaction
  };
};