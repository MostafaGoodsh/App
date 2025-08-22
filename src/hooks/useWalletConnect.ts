import { useState, useEffect, useCallback } from 'react';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import { WALLETCONNECT_CONFIG, NETWORK_CONFIG } from '@/config/wallet';

export interface ConnectedWallet {
  id: string;
  type: 'WalletConnect' | 'MetaMask' | 'Phantom' | 'Internal' | 'Squads';
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
        console.log('Loading wallets from localStorage:', loadedWallets);
        setConnectedWallets(loadedWallets);
      } catch (error) {
        console.error('Error loading saved wallets:', error);
      }
    }
  }, []);

  // Save wallets to localStorage (without provider objects)
  useEffect(() => {
    const walletsToSave = connectedWallets.map(wallet => ({
      ...wallet,
      provider: undefined // Remove provider to avoid DataCloneError
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
      // Disconnect any existing provider first
      if (wcProvider) {
        try {
          await wcProvider.disconnect();
        } catch (e) {
          console.warn('Error disconnecting existing provider:', e);
        }
      }

      // Initialize WalletConnect provider
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

      // Set up event listeners
      provider.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // Handle disconnection
          setConnectedWallets(prev => prev.filter(w => w.type !== 'WalletConnect'));
        }
      });

      provider.on('disconnect', () => {
        setConnectedWallets(prev => prev.filter(w => w.type !== 'WalletConnect'));
        setWcProvider(null);
      });

      setWcProvider(provider);

      // Connect to wallet with timeout
      const connectPromise = provider.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 60000)
      );

      await Promise.race([connectPromise, timeoutPromise]);
      
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
      // Clean up on error
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
      return;
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
    if (!(window as any).phantom?.solana?.isPhantom) {
      // Open Phantom installation page
      window.open('https://phantom.app/', '_blank');
      throw new Error('Phantom wallet not installed. Please install Phantom wallet and refresh the page.');
    }

    setIsConnecting(true);
    try {
      // Request connection with specific permissions
      const response = await (window as any).phantom.solana.connect({ onlyIfTrusted: false });
      const address = response.publicKey.toString();
      
      console.log('Phantom connected:', address);
      
      // Verify connection by checking if we can sign a message
      const provider = (window as any).phantom.solana;
      if (!provider.isConnected) {
        throw new Error('Phantom connection failed');
      }
      
      // Get Solana balance using the connected provider
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
        // Fallback to RPC call
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
        } catch (fallbackError) {
          console.error("Fallback balance fetch failed:", fallbackError);
        }
      }

      const newWallet: ConnectedWallet = {
        id: Date.now().toString(),
        type: 'Phantom',
        address,
        balance,
        currency: 'SOL',
        network: 'Solana',
        provider: provider
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

  const connectSquads = useCallback(async () => {
    // Check if SquadsX extension is available
    if (!(window as any).squads?.isSquads) {
      // Open Chrome Web Store for SquadsX
      window.open('https://chrome.google.com/webstore/detail/squads-multisig/mccoklppdpbhceiflcjmapojohpphage', '_blank');
      throw new Error('SquadsX wallet not installed. Please install SquadsX extension and refresh the page.');
    }

    setIsConnecting(true);
    try {
      const response = await (window as any).squads.connect();
      const address = response.publicKey.toString();
      
      console.log('SquadsX connected:', address);
      
      // Verify connection
      const provider = (window as any).squads;
      if (!provider.isConnected) {
        throw new Error('SquadsX connection failed');
      }
      
      // Get Solana balance for multisig wallet using web3.js
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
        console.error("Error fetching Squads balance:", error);
        // Fallback to RPC call
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
        } catch (fallbackError) {
          console.error("Fallback balance fetch failed:", fallbackError);
        }
      }

      const newWallet: ConnectedWallet = {
        id: Date.now().toString(),
        type: 'Squads' as any,
        address,
        balance,
        currency: 'SOL',
        network: 'Solana',
        name: 'Squads MultiSig',
        provider: provider
      };

      setConnectedWallets(prev => {
        const exists = prev.find(w => w.address === address && w.type === 'Squads');
        if (exists) return prev;
        return [...prev, newWallet];
      });

      return newWallet;
    } catch (error) {
      console.error('Squads connection error:', error);
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

  const addInternalWallet = useCallback((wallet: ConnectedWallet) => {
    setConnectedWallets(prev => [...prev, wallet]);
  }, []);

  return {
    connectedWallets,
    isConnecting,
    connectWalletConnect,
    connectMetaMask,
    connectPhantom,
    connectSquads,
    disconnectWallet,
    refreshBalance,
    sendTransaction,
    addInternalWallet
  };
};