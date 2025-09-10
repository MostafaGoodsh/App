import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SolanaWalletProvider } from "@/components/wallet/SolanaWalletProvider";
import { SolanaWalletCard } from "@/components/wallet/SolanaWalletCard";
import { SolanaTokenTransfer } from "@/components/wallet/SolanaTokenTransfer";
import { useToast } from "@/hooks/use-toast";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const WalletPage = () => {
  const { toast } = useToast();
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

        <SolanaWalletProvider network={WalletAdapterNetwork.Devnet}>
          <SolanaWalletCard 
            onSendToken={(token) => {
              setSelectedSolanaToken(token);
              setShowSolanaTransfer(true);
            }}
          />
        </SolanaWalletProvider>

        {/* Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-green-600 arabic-text">✅ تم الاتصال بنجاح</h3>
                <p className="text-sm text-muted-foreground arabic-text">
                  الآن يمكنك استقبال الرموز وإرسالها
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="text-blue-600 arabic-text text-center">🚀 الخطوات التالية</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2 arabic-text">
                <li>• 💰 احصل على SOL مجاني من الـ Airdrop</li>
                <li>• 📤 جرب إرسال SOL لعنوان آخر</li>
                <li>• 🎯 إنشاء نظام المكافآت للمستخدمين</li>
                <li>• 🔄 ربط المعاملات بقاعدة البيانات</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

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