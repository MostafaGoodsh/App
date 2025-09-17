import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

interface EthereumWalletProps {
  onConnect: (account: string, balance: string, networkId: number) => void;
  onDisconnect: () => void;
}

export const EthereumWallet: React.FC<EthereumWalletProps> = ({ onConnect, onDisconnect }) => {
  const [provider, setProvider] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const clearWalletConnectStorage = () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('walletconnect') || key.includes('wc@2') || key.includes('-wc')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  };

  const fetchBalance = async (walletProvider: any, walletAccount: string) => {
    try {
      const balance = await walletProvider.request({
        method: 'eth_getBalance',
        params: [walletAccount, 'latest']
      });
      
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
      return balanceInEth.toFixed(4);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      clearWalletConnectStorage();
      
      const ethereumProvider = await EthereumProvider.init({
        projectId: '5cbecfb58785fd00d9c6f1825f993060',
        chains: [1, 137, 56, 10, 42161, 8453, 43114],
        showQrModal: true,
        qrModalOptions: {
          themeMode: 'dark',
          themeVariables: {
            '--wcm-font-family': 'system-ui, sans-serif',
            '--wcm-accent-color': 'hsl(var(--primary))',
            '--wcm-accent-fill-color': 'hsl(var(--primary-foreground))',
            '--wcm-background-color': 'hsl(var(--background))',
            '--wcm-background-border-radius': '8px',
            '--wcm-container-border-radius': '12px',
          }
        }
      });

      await ethereumProvider.enable();
      const accounts = await ethereumProvider.request({ method: 'eth_accounts' }) as string[];
      
      if (accounts && accounts.length > 0) {
        setProvider(ethereumProvider);
        const chainId = await ethereumProvider.request({ method: 'eth_chainId' }) as string;
        const networkId = parseInt(chainId, 16);
        const balance = await fetchBalance(ethereumProvider, accounts[0]);
        
        onConnect(accounts[0], balance, networkId);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (provider) {
        await provider.disconnect();
      }
      clearWalletConnectStorage();
      setProvider(null);
      onDisconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      clearWalletConnectStorage();
      setProvider(null);
      onDisconnect();
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
          <span className="text-2xl">Ξ</span>
        </div>
        <CardTitle>Ethereum & EVM</CardTitle>
        <CardDescription>اتصل بمحافظ Ethereum والشبكات المتوافقة</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleConnect}
          className="w-full"
          disabled={isConnecting}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? 'جاري الاتصال...' : 'اتصل بمحفظة Ethereum'}
        </Button>
      </CardContent>
    </Card>
  );
};