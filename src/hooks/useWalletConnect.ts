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

  const connectWallet = useCallback(async (walletType: string = WALLET_TYPES.WALLETCONNECT) => {
    setIsConnecting(true);
    try {
      if (walletType === WALLET_TYPES.PHANTOM) {
        // Check if we're on mobile or desktop
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // On mobile, use WalletConnect for Phantom or direct app connection
          try {
            // Try WalletConnect first for better mobile experience
            const wcProvider = await EthereumProvider.init({
              chains: [1],
              optionalChains: [137],
              projectId: WALLETCONNECT_CONFIG.projectId,
              showQrModal: true,
              qrModalOptions: {
                ...WALLETCONNECT_CONFIG.qrModalOptions,
                themeMode: 'dark',
                themeVariables: {
                  '--wcm-z-index': '1000'
                }
              },
              metadata: WALLETCONNECT_CONFIG.metadata
            });

            await wcProvider.connect();
            
            if (wcProvider.accounts && wcProvider.accounts.length > 0) {
              const address = wcProvider.accounts[0];
              const balance = await getBalance(address, wcProvider);
              
              const newWallet: ConnectedWallet = {
                id: Date.now().toString(),
                type: 'Phantom',
                address,
                balance,
                currency: 'ETH',
                network: 'Ethereum',
                name: 'Phantom (via WalletConnect)',
                provider: wcProvider
              };

              setConnectedWallets([newWallet]);
              return newWallet;
            }
          } catch (wcError) {
            console.log('WalletConnect failed, trying direct connection:', wcError);
            // Fallback to direct app connection
            const newWallet = await connectToPhantomApp();
            setConnectedWallets([newWallet]);
            return newWallet;
          }
        } else {
          // On desktop, try to detect browser extension
          if (typeof window !== 'undefined') {
            const phantom = (window as any).phantom?.solana || (window as any).solana;
            
            if (phantom?.isPhantom) {
              try {
                const response = await phantom.connect();
                const address = response.publicKey.toString();
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
                throw new Error('فشل في الاتصال بمحفظة Phantom');
              }
            } else {
              // If no extension, try WalletConnect as fallback
              throw new Error('يرجى تثبيت امتداد Phantom أو استخدام WalletConnect');
            }
          }
        }
        
        throw new Error('غير قادر على الاتصال بـ Phantom');
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