import React, { useState, useEffect } from 'react';
import { SolanaWalletProvider } from '@/components/wallet/SolanaWalletProvider';
import { WalletDashboard } from '@/components/wallet/WalletDashboard';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWalletConnect } from '@/hooks/useWalletConnect';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';

// Internal wallet content component that uses the wallet context
const WalletContent = () => {
  const { publicKey, connected } = useSolanaWallet();
  const { connectedWallet, refreshBalance, disconnectWallet } = useWalletConnect();

  // Create mock wallet for Solana connection
  const solanaWallets = connected && publicKey ? [{
    id: 'solana-phantom',
    name: 'Phantom Wallet',
    type: 'WalletConnect' as const,
    address: publicKey.toString(),
    balance: '0',
    currency: 'SOL',
    network: 'Solana',
    chainId: 999999, // Mock chainId for Solana devnet
  }] : [];

  const handleRefreshBalance = async (wallet: any) => {
    // Implementation for refreshing balance
    await refreshBalance();
  };

  const handleSendTransaction = async (wallet: any, toAddress: string, amount: string) => {
    // Implementation for sending transaction - placeholder
    console.log('Sending transaction:', { wallet, toAddress, amount });
    return 'mock-transaction-signature';
  };

  const handleDisconnect = (walletId: string) => {
    // Implementation for disconnecting wallet
    disconnectWallet();
  };

  return (
    <>
      {/* زر الاتصال بالمحفظة */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>اتصال المحفظة</CardTitle>
          <CardDescription>اتصل بمحفظة Phantom الخاصة بك</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !text-primary-foreground !border-0 !rounded-lg !px-6 !py-3 !text-base !font-medium !transition-colors" />
        </CardContent>
      </Card>

      {/* Dashboard */}
      <WalletDashboard
        wallets={solanaWallets}
        onRefreshBalance={handleRefreshBalance}
        onSendTransaction={handleSendTransaction}
        onDisconnect={handleDisconnect}
      />
    </>
  );
};

// Main wallet page component
const WalletPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent arabic-text">
            إدارة المحافظ الرقمية
          </h1>
          <p className="text-muted-foreground arabic-text">
            اتصل بمحافظك وأدر عملاتك الرقمية بأمان
          </p>
        </header>

        <SolanaWalletProvider network={WalletAdapterNetwork.Devnet}>
          <WalletContent />
        </SolanaWalletProvider>
      </div>
    </div>
  );
};

export default WalletPage;