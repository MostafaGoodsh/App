import { useState, useCallback } from 'react';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import { WALLETCONNECT_CONFIG, SUPPORTED_NETWORKS, getWalletConnectProjectId } from '@/config/wallet';

// Singleton provider to avoid double-initialization (causes warnings + flaky modal behavior)
let wcProvider: any | null = null;
let wcProviderInitPromise: Promise<any> | null = null;
let wcProjectIdInUse: string | null = null;

const getOrInitProvider = async (projectId: string) => {
  if (wcProvider && wcProjectIdInUse === projectId) return wcProvider;

  // Project ID changed → reset
  if (wcProvider && wcProjectIdInUse && wcProjectIdInUse !== projectId) {
    try {
      await wcProvider.disconnect();
    } catch {
      // ignore
    }
    wcProvider = null;
    wcProjectIdInUse = null;
  }

  if (wcProviderInitPromise) return wcProviderInitPromise;

  wcProjectIdInUse = projectId;
  wcProviderInitPromise = EthereumProvider.init({
    projectId,
    chains: [1],
    optionalChains: Object.values(SUPPORTED_NETWORKS).map((network) => network.chainId),
    showQrModal: true,
    metadata: WALLETCONNECT_CONFIG.metadata,
  })
    .then((provider) => {
      wcProvider = provider;
      wcProviderInitPromise = null;
      return provider;
    })
    .catch((err) => {
      wcProviderInitPromise = null;
      wcProvider = null;
      wcProjectIdInUse = null;
      throw err;
    });

  return wcProviderInitPromise;
};

export interface ConnectedWallet {
  id: string;
  type: 'WalletConnect';
  address: string;
  balance: string;
  currency: string;
  network: string;
  chainId: number;
  name: string;
  provider?: any;
}

export const useWalletConnect = () => {
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(() => {
    const saved = localStorage.getItem('connectedWallet');
    return saved ? JSON.parse(saved) : null;
  });
  const [isConnecting, setIsConnecting] = useState(false);

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

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const projectId = getWalletConnectProjectId();
      if (!projectId) {
        throw new Error('WalletConnect Project ID غير مُعد. الرجاء إدخاله ثم إعادة المحاولة.');
      }

      const provider = await getOrInitProvider(projectId);

      await provider.connect();

      const accounts = provider.accounts;
      if (!accounts || accounts.length === 0) {
        throw new Error('فشل في الحصول على حسابات المحفظة');
      }

      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex as string, 16);
      const currentNetwork =
        Object.values(SUPPORTED_NETWORKS).find((n) => n.chainId === chainId) || SUPPORTED_NETWORKS.ethereum;

      const address = accounts[0];
      const balance = await getBalance(address, provider);

      const wallet: ConnectedWallet = {
        id: Date.now().toString(),
        type: 'WalletConnect',
        address,
        balance,
        currency: currentNetwork.currency,
        network: currentNetwork.name,
        chainId: currentNetwork.chainId,
        name: 'WalletConnect',
        provider,
      };

      setConnectedWallet(wallet);
      localStorage.setItem('connectedWallet', JSON.stringify({ ...wallet, provider: undefined }));
      return wallet;
    } catch (error) {
      console.error('WalletConnect connection error:', error);

      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('403') || msg.toLowerCase().includes('forbidden') || msg.toLowerCase().includes('project not found')) {
        throw new Error(
          'فشل تحميل WalletConnect (403/Project not found). تأكد أن Project ID صحيح وأن الدومين الحالي مسموح به داخل WalletConnect Cloud، ثم جرّب مرة أخرى.'
        );
      }

      if (error instanceof Error) throw error;
      throw new Error('فشل في الاتصال بـ WalletConnect');
    } finally {
      setIsConnecting(false);
    }
  }, [getBalance]);

  const switchNetwork = useCallback(async (networkKey: keyof typeof SUPPORTED_NETWORKS) => {
    if (!connectedWallet?.provider) return;
    
    const network = SUPPORTED_NETWORKS[networkKey];
    const chainIdHex = `0x${network.chainId.toString(16)}`;
    
    try {
      await connectedWallet.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await connectedWallet.provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdHex,
            chainName: network.name,
            nativeCurrency: {
              name: network.currency,
              symbol: network.currency,
              decimals: 18,
            },
            rpcUrls: network.rpcUrls,
            blockExplorerUrls: network.blockExplorerUrls,
          }],
        });
      }
    }

    // Update wallet state
    const balance = await getBalance(connectedWallet.address, connectedWallet.provider);
    setConnectedWallet({
      ...connectedWallet,
      network: network.name,
      currency: network.currency,
      chainId: network.chainId,
      balance
    });
  }, [connectedWallet, getBalance]);

  const disconnectWallet = useCallback(() => {
    const provider = connectedWallet?.provider || wcProvider;
    if (provider) {
      try {
        provider.disconnect();
      } catch {
        // ignore
      }
    }

    wcProvider = null;
    wcProviderInitPromise = null;
    wcProjectIdInUse = null;

    setConnectedWallet(null);
    localStorage.removeItem('connectedWallet');
    localStorage.removeItem('customTokens');
  }, [connectedWallet]);

  const refreshBalance = useCallback(async () => {
    if (!connectedWallet) return;
    
    const newBalance = await getBalance(connectedWallet.address, connectedWallet.provider);
    setConnectedWallet({
      ...connectedWallet,
      balance: newBalance
    });
    return newBalance;
  }, [connectedWallet, getBalance]);

  return {
    connectedWallet,
    isConnecting,
    connectWallet,
    switchNetwork,
    disconnectWallet,
    refreshBalance
  };
};