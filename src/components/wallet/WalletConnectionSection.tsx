import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet, Link } from "lucide-react";
import { WALLET_TYPES } from "@/config/wallet";

interface WalletConnectionSectionProps {
  isConnecting: boolean;
  onWalletConnect: (walletType?: string) => Promise<void>;
}

export const WalletConnectionSection = ({ isConnecting, onWalletConnect }: WalletConnectionSectionProps) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Link className="w-6 h-6" />
              WalletConnect
            </CardTitle>
            <CardDescription className="arabic-text">
              اتصل بمحفظتك الرقمية باستخدام WalletConnect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onWalletConnect(WALLET_TYPES.WALLETCONNECT)}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              <span className="arabic-text">اتصال بـ WalletConnect</span>
            </Button>
            <p className="text-sm text-muted-foreground mt-3 text-center arabic-text">
              شبكة Ethereum • ETH والرموز المميزة
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};