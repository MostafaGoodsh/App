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

  const connectToPhantomApp = useCallback(async () => {
    // For mobile devices, create a deep link that requests connection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      try {
        // Create a connection request with proper parameters
        const appName = 'المحافظ الرقمية';
        const appUrl = encodeURIComponent(window.location.origin);
        const redirectLink = encodeURIComponent(`${window.location.origin}/wallet`);
        
        // Use Phantom's connect deep link format
        const phantomConnectUrl = `phantom://v1/connect?app_url=${appUrl}&dapp_encryption_public_key=&nonce=&redirect_link=${redirectLink}&cluster=mainnet-beta`;
        
        console.log('Opening Phantom with connect URL:', phantomConnectUrl);
        
        // Try to open with the connect URL first
        window.location.href = phantomConnectUrl;
        
        // Fallback: if the above doesn't work, try the browser approach
        setTimeout(() => {
          const browserUrl = `https://phantom.app/ul/browse/${appUrl}?cluster=mainnet-beta&connect=true`;
          console.log('Fallback: Opening Phantom browser with:', browserUrl);
          window.open(browserUrl, '_blank');
        }, 1000);
        
        // Store connection state
        localStorage.setItem('phantom-connection-attempt', JSON.stringify({
          timestamp: Date.now(),
          origin: window.location.origin,
          status: 'pending'
        }));
        
        // Return a placeholder
        const placeholder: ConnectedWallet = {
          id: Date.now().toString(),
          type: 'Phantom',
          address: 'تم فتح تطبيق Phantom...',
          balance: '0.0',
          currency: 'SOL',
          network: 'Solana',
          name: 'Phantom'
        };
        
        return placeholder;
      } catch (error) {
        console.error('Error opening Phantom app:', error);
        throw new Error('فشل في فتح تطبيق Phantom');
      }
    }
    
    throw new Error('Desktop Phantom detection required');
  }, []);

  const connectWallet = useCallback(async (walletType: string = WALLET_TYPES.PHANTOM) => {
    setIsConnecting(true);
    try {
      if (typeof window !== 'undefined') {
        const phantom = (window as any).phantom?.solana || (window as any).solana;
        
        if (phantom?.isPhantom) {
          try {
            // Request connection
            const response = await phantom.connect();
            console.log('Phantom connection response:', response);
            
            if (response && response.publicKey) {
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
            } else {
              throw new Error('فشل في الحصول على عنوان المحفظة من Phantom');
            }
          } catch (error) {
            console.error('Phantom connection error:', error);
            throw new Error('فشل في الاتصال بمحفظة Phantom: ' + (error as Error).message);
          }
        } else {
          // Check if we're on mobile for fallback options
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          
          if (isMobile) {
            // On mobile, redirect to Phantom app
            try {
              const appUrl = encodeURIComponent(window.location.origin);
              const redirectLink = encodeURIComponent(`${window.location.origin}/wallet`);
              const phantomConnectUrl = `phantom://v1/connect?app_url=${appUrl}&redirect_link=${redirectLink}&cluster=mainnet-beta`;
              
              window.location.href = phantomConnectUrl;
              
              setTimeout(() => {
                const browserUrl = `https://phantom.app/ul/browse/${appUrl}?cluster=mainnet-beta&connect=true`;
                window.open(browserUrl, '_blank');
              }, 1000);
              
              throw new Error('يتم فتح تطبيق Phantom...');
            } catch (error) {
              throw new Error('فشل في فتح تطبيق Phantom');
            }
          } else {
            // On desktop, redirect to install Phantom
            window.open('https://phantom.app/', '_blank');
            throw new Error('يرجى تثبيت امتداد Phantom أولاً');
          }
        }
      }
      
      throw new Error('غير قادر على الاتصال بـ Phantom');
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [getSolanaBalance]);

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