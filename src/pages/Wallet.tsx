import React from 'react';
import { ModernWalletView } from '@/components/wallet/ModernWalletView';
import { useAuth } from '@/hooks/useAuth';
import { SolanaWalletProvider } from '@/components/wallet/SolanaWalletProvider';
import { useLanguage } from '@/contexts/LanguageContext';

const WalletPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">{t("يرجى تسجيل الدخول")}</h2>
          <p className="text-muted-foreground">{t("للوصول إلى المحفظة")}</p>
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
