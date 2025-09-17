import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, Zap, ExternalLink } from 'lucide-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { LedgerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const SolanaWalletContent = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const fetchBalance = async () => {
    if (!publicKey || !connection) return;
    
    try {
      setIsLoadingBalance(true);
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  React.useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(0);
    }
  }, [connected, publicKey, connection]);

  return (
    <Card className="border-2 border-orange-200">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8 text-orange-600" />
        </div>
        <CardTitle className="text-2xl text-orange-700">محفظة Solana</CardTitle>
        <CardDescription>
          اتصل بمحفظة Ledger على شبكة Solana Mainnet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <Shield className="w-8 h-8 mx-auto text-green-500" />
            <h3 className="font-semibold">آمن</h3>
            <p className="text-sm text-muted-foreground">
              محفظة أجهزة آمنة
            </p>
          </div>
          <div className="text-center space-y-2">
            <Zap className="w-8 h-8 mx-auto text-blue-500" />
            <h3 className="font-semibold">سريع</h3>
            <p className="text-sm text-muted-foreground">
              معاملات فورية
            </p>
          </div>
          <div className="text-center space-y-2">
            <ExternalLink className="w-8 h-8 mx-auto text-purple-500" />
            <h3 className="font-semibold">Mainnet</h3>
            <p className="text-sm text-muted-foreground">
              الشبكة الرئيسية
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {!connected ? (
            <>
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-orange-600 hover:!bg-orange-700 !rounded-lg" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                قم بتوصيل محفظة Ledger الخاصة بك
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-green-700 font-medium mb-2">محفظة Solana متصلة!</p>
                <p className="text-sm text-green-600 font-mono break-all">
                  {publicKey?.toString()}
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    محتويات المحفظة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-semibold mb-2">الرصيد الحالي</h3>
                    {isLoadingBalance ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري التحميل...</span>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-orange-700">{balance.toFixed(4)} SOL</p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">الشبكة</h3>
                    <p className="text-lg font-medium text-blue-700">Solana Mainnet</p>
                  </div>
                  
                  <Button 
                    onClick={fetchBalance}
                    variant="outline"
                    className="w-full"
                    disabled={isLoadingBalance}
                  >
                    تحديث الرصيد
                  </Button>
                </CardContent>
              </Card>
              
              <div className="flex justify-center">
                <WalletDisconnectButton className="!bg-gray-600 hover:!bg-gray-700 !rounded-lg" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SolanaWallet = () => {
  // استخدام Mainnet
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = 'https://api.mainnet-beta.solana.com';
  
  const wallets = useMemo(() => [
    new LedgerWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaWalletContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWallet;