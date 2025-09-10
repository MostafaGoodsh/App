import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletDashboard } from "@/components/wallet/WalletDashboard";
import { TokenSwap } from "@/components/wallet/TokenSwap";
import { AddTokenDialog } from "@/components/wallet/AddTokenDialog";
import { SolanaWalletProvider } from "@/components/wallet/SolanaWalletProvider";
import { SolanaWalletCard } from "@/components/wallet/SolanaWalletCard";
import { SolanaTokenTransfer } from "@/components/wallet/SolanaTokenTransfer";
import { useToast } from "@/hooks/use-toast";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const WalletPage = () => {
  const { toast } = useToast();
  const [showAddToken, setShowAddToken] = useState(false);
  const [customTokens, setCustomTokens] = useState<any[]>(() => {
    const saved = localStorage.getItem('customTokens');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSolanaTransfer, setShowSolanaTransfer] = useState(false);
  const [selectedSolanaToken, setSelectedSolanaToken] = useState<any>(null);

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

        <Tabs defaultValue="evm" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="evm" className="arabic-text">محافظ EVM</TabsTrigger>
            <TabsTrigger value="solana" className="arabic-text">محفظة سولانا</TabsTrigger>
            <TabsTrigger value="swap" className="arabic-text">تبديل الرموز</TabsTrigger>
          </TabsList>

          {/* EVM Wallets Tab */}
          <TabsContent value="evm">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground arabic-text">
                  محافظ EVM (WalletConnect) متاحة للاتصال
                </p>
                <p className="text-center text-sm text-orange-500 arabic-text mt-2">
                  ⚠️ حالياً في وضع المحاكاة
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Solana Wallet Tab */}
          <TabsContent value="solana">
            <SolanaWalletProvider network={WalletAdapterNetwork.Devnet}>
              <SolanaWalletCard 
                onSendToken={(token) => {
                  setSelectedSolanaToken(token);
                  setShowSolanaTransfer(true);
                }}
              />
            </SolanaWalletProvider>
          </TabsContent>

          {/* Token Swap Tab */}
          <TabsContent value="swap">
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground arabic-text mb-4">
                    ميزة التبديل متاحة فقط مع محافظ EVM المتصلة
                  </p>
                  <p className="text-center text-sm text-orange-500 arabic-text">
                    ⚠️ التبديل حالياً للمحاكاة فقط - لا معاملات حقيقية
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-green-600 arabic-text">✅ الميزات المتاحة</h3>
                <ul className="text-sm text-muted-foreground space-y-1 arabic-text">
                  <li>• الاتصال بمحافظ Phantom و Solflare</li>
                  <li>• عرض أرصدة SOL والرموز المميزة</li>
                  <li>• إرسال واستقبال العملات الحقيقية</li>
                  <li>• Airdrop مجاني على Devnet</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-blue-600 arabic-text">🚀 قريباً</h3>
                <ul className="text-sm text-muted-foreground space-y-1 arabic-text">
                  <li>• تبديل حقيقي عبر Jupiter</li>
                  <li>• نظام المكافآت والـ Airdrops</li>
                  <li>• دعم شبكة Solana الرئيسية</li>
                  <li>• ميزات DeFi متقدمة</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AddTokenDialog 
        open={showAddToken} 
        onOpenChange={setShowAddToken}
        wallet={null}
        onTokenAdded={(token) => {
          const updatedTokens = [...customTokens, token];
          setCustomTokens(updatedTokens);
          localStorage.setItem('customTokens', JSON.stringify(updatedTokens));
          setShowAddToken(false);
        }}
      />

      <SolanaWalletProvider network={WalletAdapterNetwork.Devnet}>
        <SolanaTokenTransfer 
          open={showSolanaTransfer}
          onOpenChange={setShowSolanaTransfer}
          token={selectedSolanaToken}
        />
      </SolanaWalletProvider>
    </div>
  );
};

export default WalletPage;