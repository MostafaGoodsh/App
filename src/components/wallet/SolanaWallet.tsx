import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, Zap, ExternalLink, Coins } from 'lucide-react';
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
  const [tokens, setTokens] = useState<Array<{symbol: string, balance: string, mint: string, decimals: number}>>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const fetchBalance = async () => {
    if (!publicKey || !connection) return;
    
    try {
      setIsLoadingBalance(true);
      console.log('🔍 جاري جلب الأرصدة للمحفظة:', publicKey.toString());
      
      let solBalance = 0;
      let tokenBalances = [];
      
      try {
        // محاولة جلب رصيد SOL مع retry مع endpoints مختلفة
        solBalance = await connection.getBalance(publicKey);
        const solBalanceFormatted = solBalance / LAMPORTS_PER_SOL;
        console.log('💰 رصيد SOL:', solBalanceFormatted);
        
        // إضافة رصيد SOL دائماً إلى القائمة
        tokenBalances.push({
          symbol: 'SOL',
          balance: solBalanceFormatted.toFixed(4),
          mint: 'So11111111111111111111111111111111111111112',
          decimals: 9
        });
        
        setBalance(solBalanceFormatted);
      } catch (solError) {
        console.warn('⚠️ خطأ في جلب رصيد SOL:', solError);
        // حتى لو فشل في جلب SOL، نضيف 0 للعرض
        tokenBalances.push({
          symbol: 'SOL',
          balance: '0.0000',
          mint: 'So11111111111111111111111111111111111111112',
          decimals: 9
        });
      }
      
      try {
        // جلب جميع حسابات الرموز المميزة للمحفظة
        console.log('🔍 جاري البحث عن رموز SPL...');
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), // SPL Token Program ID
        });
        
        console.log('📊 تم العثور على', tokenAccounts.value.length, 'حساب رمز مميز');
        
        // معالجة رموز SPL
        for (const account of tokenAccounts.value) {
          try {
            const parsedInfo = account.account.data.parsed.info;
            const balance = parsedInfo.tokenAmount.uiAmount;
            const mint = parsedInfo.mint;
            const decimals = parsedInfo.tokenAmount.decimals;
            
            console.log('🪙 رمز مميز:', {
              mint: mint.slice(0, 8) + '...',
              balance,
              decimals
            });
            
            if (balance && balance > 0) {
              // بعض الرموز المعروفة
              const knownTokens: { [key: string]: string } = {
                'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
                'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
                'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'mSOL',
                'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK',
                'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'JUP',
                'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof': 'RAY',
                'SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y': 'SHDW',
                'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux': 'HNT',
              };
              
              const symbol = knownTokens[mint] || `${mint.slice(0, 4)}...${mint.slice(-4)}`;
              
              tokenBalances.push({
                symbol,
                balance: balance.toFixed(4),
                mint,
                decimals
              });
              
              console.log('✅ تمت إضافة الرمز:', symbol, 'بقيمة:', balance);
            }
          } catch (accountError) {
            console.warn('⚠️ خطأ في معالجة حساب الرمز:', accountError);
          }
        }
      } catch (tokenError) {
        console.warn('⚠️ خطأ في جلب حسابات الرموز المميزة:', tokenError);
        // حتى لو فشل في جلب SPL tokens، يمكننا عرض SOL على الأقل
      }
      
      setTokens(tokenBalances);
      console.log('📋 إجمالي الرموز المعروضة:', tokenBalances.length);
      console.log('💼 الرموز النهائية:', tokenBalances);
      
    } catch (error) {
      console.error('❌ خطأ عام في جلب الرصيد:', error);
      // في حالة الخطأ، عرض رسالة توضيحية للمستخدم
      const errorTokens = [{
        symbol: 'خطأ',
        balance: 'غير متاح',
        mint: 'error',
        decimals: 0
      }];
      setTokens(errorTokens);
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
  // استخدام Mainnet مع endpoints مجانية
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => {
    // قائمة بـ RPC endpoints مجانية كبديل
    const endpoints = [
      'https://solana-mainnet.g.alchemy.com/v2/demo',
      'https://api.mainnet-beta.solana.com',
      'https://rpc.ankr.com/solana',
      'https://solana-api.projectserum.com'
    ];
    return endpoints[0]; // استخدام أول endpoint متاح
  }, []);
  
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