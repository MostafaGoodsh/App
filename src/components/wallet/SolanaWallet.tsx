import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, Zap, ExternalLink, Coins } from 'lucide-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
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
  const [tokens, setTokens] = useState<Array<{symbol: string, balance: string, mint: string}>>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Popular SPL tokens on Solana
  const popularTokens = [
    { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
    { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
    { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  ];

  const fetchBalance = async () => {
    if (!publicKey || !connection) return;
    
    try {
      setIsLoadingBalance(true);
      console.log('جاري جلب الأرصدة...');
      
      // جلب رصيد SOL
      const solBalance = await connection.getBalance(publicKey);
      setBalance(solBalance / LAMPORTS_PER_SOL);
      console.log('رصيد SOL:', solBalance / LAMPORTS_PER_SOL);
      
      // جلب رصيد الرموز المميزة
      const tokenBalances = [];
      
      for (const token of popularTokens) {
        try {
          if (token.mint === 'So11111111111111111111111111111111111111112') {
            // SOL نفسه
            tokenBalances.push({
              symbol: 'SOL',
              balance: (solBalance / LAMPORTS_PER_SOL).toFixed(4),
              mint: token.mint
            });
          } else {
            // الرموز المميزة SPL
            const tokenAccount = await getAssociatedTokenAddress(
              new PublicKey(token.mint),
              publicKey
            );
            
            const accountInfo = await connection.getAccountInfo(tokenAccount);
            
            if (accountInfo) {
              const accountData = accountInfo.data;
              // قراءة الرصيد من البيانات (64 بت في البايت 64-71)
              const balanceBuffer = accountData.slice(64, 72);
              const balance = Buffer.from(balanceBuffer).readBigUInt64LE();
              const formattedBalance = (Number(balance) / Math.pow(10, token.decimals)).toFixed(4);
              
              if (parseFloat(formattedBalance) > 0) {
                tokenBalances.push({
                  symbol: token.symbol,
                  balance: formattedBalance,
                  mint: token.mint
                });
              }
            }
          }
        } catch (tokenError) {
          console.log(`لم يتم العثور على رمز ${token.symbol}`);
        }
      }
      
      setTokens(tokenBalances);
      console.log('الرموز المميزة:', tokenBalances);
      
    } catch (error) {
      console.error('خطأ في جلب الرصيد:', error);
      setBalance(0);
      setTokens([]);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  React.useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(0);
      setTokens([]);
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
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Coins className="w-5 h-5" />
                      الأرصدة الحالية
                    </h3>
                    {isLoadingBalance ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري التحميل...</span>
                      </div>
                    ) : tokens.length > 0 ? (
                      <div className="space-y-3">
                        {tokens.map((token, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {token.symbol.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold">{token.symbol}</p>
                                <p className="text-xs text-muted-foreground">
                                  {token.mint.slice(0, 8)}...{token.mint.slice(-8)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-orange-700">{token.balance}</p>
                              <p className="text-sm text-muted-foreground">{token.symbol}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">لا توجد رموز مميزة</p>
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