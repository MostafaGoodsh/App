import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// استخدام معرف مشروع صالح للاختبار
const projectId = '4f7d8593f38a8e4c8d5f6d7c8b9a0e1c2';

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
        setConnectedWallets(JSON.parse(savedWallets));
      } catch (error) {
        console.error('Error loading saved wallets:', error);
      }
    }
  }, []);

  // Save wallets to localStorage
  useEffect(() => {
    localStorage.setItem('connectedWallets', JSON.stringify(connectedWallets));
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
      // حالياً سنركز على MetaMask و Phantom
      // WalletConnect سيتم إضافته لاحقاً مع معرف مشروع صحيح
      alert('WalletConnect قيد التطوير. يرجى استخدام MetaMask أو Phantom في الوقت الحالي.');
      return null;
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectMetaMask = useCallback(async () => {
    if (!window.ethereum?.isMetaMask) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const balance = await getBalance(accounts[0], window.ethereum);
      
      const newWallet: ConnectedWallet = {
        id: Date.now().toString(),
        type: 'MetaMask',
        address: accounts[0],
        balance,
        currency: 'ETH',
        network: 'Ethereum',
        provider: window.ethereum
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
    if (!window.phantom?.solana?.isPhantom) {
      window.open('https://phantom.app/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const response = await window.phantom.solana.connect();
      const address = response.publicKey.toString();
      
      // Get Solana balance
      let balance = "0.0";
      try {
        const solanaResponse = await fetch('https://api.mainnet-beta.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [address]
          })
        });
        const data = await solanaResponse.json();
        if (data.result) {
          balance = (data.result.value / 1000000000).toFixed(4);
        }
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
        provider: window.phantom.solana
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
      
      // Refresh balance after transaction
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