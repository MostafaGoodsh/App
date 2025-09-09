import { useState, useCallback } from 'react';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import { WALLETCONNECT_CONFIG, SUPPORTED_NETWORKS } from '@/config/wallet';

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
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null);
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
      const provider = await EthereumProvider.init({
        projectId: WALLETCONNECT_CONFIG.projectId,
        chains: [1], // Ethereum by default
        optionalChains: Object.values(SUPPORTED_NETWORKS).map(network => network.chainId),
        showQrModal: true,
        metadata: WALLETCONNECT_CONFIG.metadata
      });

      await provider.connect();
      
      const accounts = provider.accounts;
      if (!accounts || accounts.length === 0) {
        throw new Error('فشل في الحصول على حسابات المحفظة');
      }

      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex as string, 16);
      const currentNetwork = Object.values(SUPPORTED_NETWORKS).find(n => n.chainId === chainId) || SUPPORTED_NETWORKS.ethereum;
      
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
        provider
      };

      setConnectedWallet(wallet);
      return wallet;
    } catch (error) {
      console.error('WalletConnect connection error:', error);
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
    if (connectedWallet?.provider) {
      connectedWallet.provider.disconnect();
    }
    setConnectedWallet(null);
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