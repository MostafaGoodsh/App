import { useState, useEffect, useCallback } from 'react';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WALLETCONNECT_CONFIG, NETWORK_CONFIG, WALLET_TYPES } from '@/config/wallet';

declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom: boolean;
        connect: () => Promise<{ publicKey: any }>;
        disconnect: () => Promise<void>;
        publicKey?: any;
      };
    };
    solana?: {
      isPhantom: boolean;
      connect: () => Promise<{ publicKey: any }>;
      disconnect: () => Promise<void>;
      publicKey?: any;
    };
  }
}

export interface ConnectedWallet {
  id: string;
  type: 'WalletConnect' | 'Phantom';
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

  // Load saved wallets from localStorage and reconnect
  useEffect(() => {
    const checkPhantomConnection = async () => {
      if (typeof window !== 'undefined') {
        const phantom = (window as any).phantom?.solana || (window as any).solana;
        
        if (phantom?.isPhantom && phantom.publicKey) {
          console.log('Found existing Phantom connection');
          try {
            const address = phantom.publicKey.toString();
            const balance = await getSolanaBalance(address);
            
            const existingWallet: ConnectedWallet = {
              id: Date.now().toString(),
              type: 'Phantom',
              address,
              balance,
              currency: 'SOL',
              network: 'Solana',
              name: 'Phantom',
              provider: phantom
            };
            
            setConnectedWallets([existingWallet]);
          } catch (error) {
            console.error('Error reconnecting to Phantom:', error);
          }
        }
      }
    };
    
    checkPhantomConnection();
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

  const getSolanaBalance = useCallback(async (address: string) => {
    try {
      const connection = new Connection(NETWORK_CONFIG.solana.rpcUrl);
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return (balance / LAMPORTS_PER_SOL).toFixed(4);
    } catch (error) {
      console.error('Error getting Solana balance:', error);
      return "0.0";
    }
  }, []);

  const connectToPhantom = useCallback(async () => {
    if (typeof window === 'undefined') {
      throw new Error('غير متاح في بيئة الخادم');
    }

    const phantom = (window as any).phantom?.solana || (window as any).solana;
    
    if (!phantom) {
      window.open('https://phantom.app/', '_blank');
      throw new Error('يرجى تثبيت امتداد Phantom أولاً');
    }

    if (!phantom.isPhantom) {
      throw new Error('محفظة Phantom غير صالحة');
    }

    try {
      console.log('Attempting to connect to Phantom...');
      const response = await phantom.connect();
      console.log('Phantom connection response:', response);
      
      if (!response || !response.publicKey) {
        throw new Error('فشل في الحصول على عنوان المحفظة');
      }

      const address = response.publicKey.toString();
      console.log('Successfully connected to Phantom:', address);
      
      const balance = await getSolanaBalance(address);
      
      const newWallet: ConnectedWallet = {
        id: Date.now().toString(),
        type: 'Phantom',
        address,
        balance,
        currency: 'SOL',
        network: 'Solana',
        name: 'Phantom',
        provider: phantom
      };

      setConnectedWallets([newWallet]);
      return newWallet;
    } catch (error) {
      console.error('Phantom connection error:', error);
      throw new Error('فشل في الاتصال بمحفظة Phantom: ' + (error as Error).message);
    }
  }, [getSolanaBalance]);

  const connectWallet = useCallback(async (walletType: string = WALLET_TYPES.PHANTOM) => {
    setIsConnecting(true);
    try {
      return await connectToPhantom();
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [connectToPhantom]);

  const disconnectWallet = useCallback((walletId: string) => {
    setConnectedWallets([]);
    
    // Disconnect from Phantom if connected
    if (typeof window !== 'undefined') {
      const phantom = (window as any).phantom?.solana || (window as any).solana;
      if (phantom?.disconnect) {
        phantom.disconnect();
      }
    }
  }, []);

  const refreshBalance = useCallback(async (wallet: ConnectedWallet) => {
    let newBalance: string;
    if (wallet.type === 'Phantom') {
      newBalance = await getSolanaBalance(wallet.address);
    } else {
      newBalance = await getBalance(wallet.address, wallet.provider);
    }
    setConnectedWallets([{ ...wallet, balance: newBalance }]);
    return newBalance;
  }, [getBalance, getSolanaBalance]);

  const sendTransaction = useCallback(async (
    wallet: ConnectedWallet,
    toAddress: string,
    amount: string
  ) => {
    if (!wallet.provider) {
      throw new Error('No provider available');
    }

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
  }, [refreshBalance]);

  return {
    connectedWallets,
    isConnecting,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    sendTransaction
  };
};