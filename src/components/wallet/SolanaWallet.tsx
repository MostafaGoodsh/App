import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, Zap, ExternalLink, Coins } from 'lucide-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { LedgerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import AdvancedWalletInterface from './AdvancedWalletInterface';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const SolanaWalletContent = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [tokens, setTokens] = useState<Array<{symbol: string, balance: string, mint: string, decimals: number, usdValue?: number, change24h?: number}>>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [totalUsdValue, setTotalUsdValue] = useState<number>(0);

  const fetchBalance = async (retryCount = 0) => {
    console.log('🔄 بدء fetchBalance - محاولة رقم:', retryCount + 1);
    
    if (!publicKey || !connection) {
      console.log('❌ لا يمكن جلب الرصيد:', {
        hasPublicKey: !!publicKey,
        hasConnection: !!connection,
        publicKey: publicKey?.toString(),
        connectionEndpoint: connection?.rpcEndpoint
      });
      return;
    }
    
    try {
      setIsLoadingBalance(true);
      console.log('🔍 جاري جلب الأرصدة للمحفظة:', publicKey.toString());
      console.log('🌐 RPC Endpoint:', connection.rpcEndpoint);
      console.log('⏰ وقت البدء:', new Date().toISOString());
      
      let tokenBalances = [];
      
      // استخدام connection مخصص إذا فشل الحالي
      let workingConnection = connection;
      if (retryCount > 0) {
        const backupEndpoints = [
          'https://solana.public-rpc.com',     // mainnet مجاني
          'https://rpc.helius.xyz/',          // mainnet Helius
          'https://mainnet.helius-rpc.com'    // mainnet Helius backup
        ];
        const endpointToUse = backupEndpoints[retryCount - 1] || connection.rpcEndpoint;
        console.log('🔄 استخدام mainnet endpoint احتياطي:', endpointToUse);
        workingConnection = new Connection(endpointToUse, 'confirmed');
      }
      
      // محاولة جلب رصيد SOL أولاً مع retry logic
      console.log('📊 محاولة جلب رصيد SOL...');
      try {
        // استخدام finalized للحصول على بيانات مؤكدة أكثر
        const solBalance = await workingConnection.getBalance(publicKey, 'finalized');
        const solBalanceFormatted = solBalance / LAMPORTS_PER_SOL;
        console.log('✅ تم جلب رصيد SOL بنجاح:', solBalanceFormatted);
        
        tokenBalances.push({
          symbol: 'SOL',
          balance: solBalanceFormatted.toFixed(6),
          mint: 'So11111111111111111111111111111111111111112',
          decimals: 9,
          usdValue: solBalanceFormatted * 150, // تقدير تقريبي لسعر SOL
          change24h: Math.random() * 10 - 5 // تغيير وهمي للعرض
        });
        
        setBalance(solBalanceFormatted);
      } catch (solError) {
        console.error('❌ فشل في جلب رصيد SOL (محاولة ' + (retryCount + 1) + '):', {
          error: solError,
          message: solError instanceof Error ? solError.message : 'Unknown error',
          publicKey: publicKey.toString()
        });
        
        // محاولة endpoint آخر
        if (retryCount < 2) {
          console.log('🔄 محاولة endpoint مختلف...');
          setTimeout(() => fetchBalance(retryCount + 1), 2000);
          return;
        }
        
        // إضافة SOL مع رصيد 0 في حالة الخطأ
        tokenBalances.push({
          symbol: 'SOL',
          balance: '0.000000',
          mint: 'So11111111111111111111111111111111111111112',
          decimals: 9,
          usdValue: 0,
          change24h: 0
        });
        setBalance(0);
      }
      
      try {
        // جلب جميع حسابات الرموز المميزة للمحفظة مع commitment محدد
        console.log('🔍 جاري البحث عن رموز SPL...');
        const tokenAccounts = await workingConnection.getParsedTokenAccountsByOwner(publicKey, {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), // SPL Token Program ID
        }, 'finalized');
        
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
              const estimatedUsdValue = balance * (Math.random() * 50 + 1); // قيمة تقديرية
              
              tokenBalances.push({
                symbol,
                balance: balance.toFixed(4),
                mint,
                decimals,
                usdValue: estimatedUsdValue,
                change24h: Math.random() * 20 - 10 // تغيير وهمي للعرض
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
      
      // حساب إجمالي القيمة بالدولار
      const totalValue = tokenBalances.reduce((sum, token) => sum + (token.usdValue || 0), 0);
      setTotalUsdValue(totalValue);
      
      setTokens(tokenBalances);
      console.log('📋 إجمالي الرموز المعروضة:', tokenBalances.length);
      console.log('💼 الرموز النهائية:', tokenBalances);
      console.log('💰 إجمالي القيمة:', totalValue);
      
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
    console.log('🎯 useEffect triggered:', {
      connected,
      publicKey: publicKey?.toString(),
      hasConnection: !!connection,
      rpcEndpoint: connection?.rpcEndpoint
    });
    
    if (connected && publicKey && connection) {
      console.log('✅ جميع المتطلبات متوفرة، بدء جلب الأرصدة...');
      console.log('📊 محاولة جلب الأرصدة للعنوان:', publicKey.toString());
      fetchBalance();
    } else {
      console.log('❌ المتطلبات غير مكتملة:', {
        connected,
        hasPublicKey: !!publicKey,
        hasConnection: !!connection
      });
      setBalance(0);
      setTokens([]);
      setTotalUsdValue(0);
    }
  }, [connected, publicKey, connection]);

  return (
    <div className="space-y-6">
      {!connected ? (
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

            <div className="flex justify-center">
              <WalletMultiButton className="!bg-orange-600 hover:!bg-orange-700 !rounded-lg" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              قم بتوصيل محفظة Ledger الخاصة بك
            </p>
          </CardContent>
        </Card>
      ) : (
        <AdvancedWalletInterface
          publicKey={publicKey?.toString() || null}
          tokens={tokens}
          totalUsdValue={totalUsdValue}
          isLoadingBalance={isLoadingBalance}
          onRefresh={() => {
            console.log('🔄 المستخدم طلب تحديث الأرصدة يدوياً');
            fetchBalance();
          }}
        />
      )}

      {connected && (
        <div className="flex justify-center">
          <WalletDisconnectButton className="!bg-gray-600 hover:!bg-gray-700 !rounded-lg" />
        </div>
      )}
    </div>
  );
};

const SolanaWallet = () => {
  const network = WalletAdapterNetwork.Mainnet;
  
  // استخدام endpoint موثوق ومجاني
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