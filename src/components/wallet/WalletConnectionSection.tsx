import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet } from "lucide-react";

interface WalletConnectionSectionProps {
  isConnecting: boolean;
  onWalletConnect: () => Promise<void>;
}

export const WalletConnectionSection = ({ isConnecting, onWalletConnect }: WalletConnectionSectionProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-1 mb-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="w-6 h-6" />
            WalletConnect
          </CardTitle>
          <CardDescription className="arabic-text">
            اتصل بأكثر من 300 محفظة رقمية بما في ذلك MetaMask و Phantom و Trust Wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onWalletConnect}
            disabled={isConnecting}
            className="w-full"
            size="lg"
          >
            {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            <span className="arabic-text">اتصال بالمحافظ الرقمية</span>
          </Button>
          <p className="text-sm text-muted-foreground mt-3 text-center arabic-text">
            سيفتح نافذة اختيار المحفظة مع دعم جميع المحافظ الشائعة
          </p>
        </CardContent>
      </Card>
    </div>
  );
};