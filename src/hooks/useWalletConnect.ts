import { useState, useEffect, useCallback } from 'react';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WALLETCONNECT_CONFIG, NETWORK_CONFIG, WALLET_TYPES } from '@/config/wallet';

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

  const connectWallet = useCallback(async (walletType: string = WALLET_TYPES.WALLETCONNECT) => {
    setIsConnecting(true);
    try {
      if (walletType === WALLET_TYPES.PHANTOM) {
        // Connect to Phantom wallet
        if (typeof window !== 'undefined' && 'solana' in window) {
          const solana = (window as any).solana;
          
          if (solana && solana.isPhantom) {
            await solana.connect();
            const address = solana.publicKey.toString();
            const balance = await getSolanaBalance(address);
            
            const newWallet: ConnectedWallet = {
              id: Date.now().toString(),
              type: 'Phantom',
              address,
              balance,
              currency: 'SOL',
              network: 'Solana',
              name: 'Phantom',
              provider: solana
            };

            setConnectedWallets([newWallet]);
            return newWallet;
          }
        }
        throw new Error('محفظة Phantom غير متوفرة. تأكد من تثبيت إضافة Phantom في المتصفح.');
      }

      // WalletConnect flow
      if (wcProvider) {
        try {
          await wcProvider.disconnect();
        } catch (e) {
          console.warn('Error disconnecting existing provider:', e);
        }
      }

      const provider = await EthereumProvider.init({
        chains: [1], // Ethereum mainnet
        optionalChains: [137], // Polygon
        projectId: WALLETCONNECT_CONFIG.projectId,
        showQrModal: WALLETCONNECT_CONFIG.showQrModal,
        qrModalOptions: WALLETCONNECT_CONFIG.qrModalOptions,
        metadata: {
          ...WALLETCONNECT_CONFIG.metadata,
          url: window.location.origin,
          icons: [window.location.origin + '/favicon.ico']
        }
      });

      provider.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setConnectedWallets([]);
        }
      });

      provider.on('disconnect', () => {
        setConnectedWallets([]);
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

        setConnectedWallets([newWallet]);
        return newWallet;
      }
      return null;
    } catch (error) {
      console.error('Wallet connection error:', error);
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
  }, [getBalance, getSolanaBalance, wcProvider]);

  const disconnectWallet = useCallback((walletId: string) => {
    setConnectedWallets([]);
    if (wcProvider) {
      wcProvider.disconnect();
      setWcProvider(null);
    }
  }, [wcProvider]);

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