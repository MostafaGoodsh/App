import React from 'react';
import { ModernWalletView } from '@/components/wallet/ModernWalletView';
import { useAuth } from '@/hooks/useAuth';
import { SolanaWalletProvider } from '@/components/wallet/SolanaWalletProvider';

const WalletPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">يرجى تسجيل الدخول</h2>
          <p className="text-muted-foreground">للوصول إلى المحفظة</p>
        </div>
      </div>
    );
  }

  return (
    <SolanaWalletProvider>
      <ModernWalletView />
    </SolanaWalletProvider>
  );
};

export default WalletPage;
