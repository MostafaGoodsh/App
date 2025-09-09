import { useState, useEffect, useCallback } from 'react';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import { WALLETCONNECT_CONFIG, WALLET_TYPES } from '@/config/wallet';

export interface ConnectedWallet {
  id: string;
  type: 'WalletConnect';
  address: string;
  balance: string;
  currency: string;
  network: 'Polygon';
  name?: string;
  provider?: any;
}

export const useWalletConnect = () => {
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
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

  const connectToWalletConnect = useCallback(async () => {
    try {
      const provider = await EthereumProvider.init({
        projectId: WALLETCONNECT_CONFIG.projectId,
        chains: [137], // Polygon mainnet only
        showQrModal: true,
        metadata: WALLETCONNECT_CONFIG.metadata
      });

      await provider.connect();
      
      const accounts = provider.accounts;
      if (!accounts || accounts.length === 0) {
        throw new Error('فشل في الحصول على حسابات المحفظة');
      }

      // Ensure we're on Polygon network
      const chainId = await provider.request({ method: 'eth_chainId' });
      if (chainId !== '0x89') { // 0x89 is hex for 137 (Polygon)
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }],
          });
        } catch (error: any) {
          if (error.code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x89',
                chainName: 'Polygon Mainnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://polygon-rpc.com/'],
                blockExplorerUrls: ['https://polygonscan.com/'],
              }],
            });
          } else {
            throw error;
          }
        }
      }

      const address = accounts[0];
      const balance = await getBalance(address, provider);
      
      const newWallet: ConnectedWallet = {
        id: Date.now().toString(),
        type: 'WalletConnect',
        address,
        balance,
        currency: 'MATIC',
        network: 'Polygon',
        name: 'WalletConnect',
        provider
      };

      setConnectedWallets([newWallet]);
      return newWallet;
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      throw new Error('فشل في الاتصال بـ WalletConnect: ' + (error as Error).message);
    }
  }, [getBalance]);

  const connectWallet = useCallback(async (walletType: string = WALLET_TYPES.WALLETCONNECT) => {
    setIsConnecting(true);
    try {
      return await connectToWalletConnect();
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [connectToWalletConnect]);

  const disconnectWallet = useCallback((walletId: string) => {
    const wallet = connectedWallets.find(w => w.id === walletId);
    if (wallet?.provider) {
      wallet.provider.disconnect();
    }
    setConnectedWallets([]);
  }, [connectedWallets]);

  const refreshBalance = useCallback(async (wallet: ConnectedWallet) => {
    const newBalance = await getBalance(wallet.address, wallet.provider);
    const updatedWallet = { ...wallet, balance: newBalance };
    setConnectedWallets([updatedWallet]);
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