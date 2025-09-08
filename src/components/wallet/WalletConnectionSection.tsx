import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet, Zap } from "lucide-react";
import { WALLET_TYPES } from "@/config/wallet";

interface WalletConnectionSectionProps {
  isConnecting: boolean;
  onWalletConnect: (walletType?: string) => Promise<void>;
}

export const WalletConnectionSection = ({ isConnecting, onWalletConnect }: WalletConnectionSectionProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 mb-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="w-6 h-6" />
            WalletConnect
          </CardTitle>
          <CardDescription className="arabic-text">
            اتصل بأكثر من 300 محفظة رقمية بما في ذلك MetaMask و Trust Wallet
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
            <span className="arabic-text">اتصال WalletConnect</span>
          </Button>
          <p className="text-sm text-muted-foreground mt-3 text-center arabic-text">
            يدعم محافظ Ethereum و BSC و Polygon
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Zap className="w-6 h-6" />
            Phantom Wallet
          </CardTitle>
          <CardDescription className="arabic-text">
            اتصل مباشرة بمحفظة Phantom لشبكة Solana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => onWalletConnect(WALLET_TYPES.PHANTOM)}
            disabled={isConnecting}
            className="w-full"
            size="lg"
            variant="outline"
          >
            {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            <span className="arabic-text">اتصال Phantom</span>
          </Button>
          <p className="text-sm text-muted-foreground mt-3 text-center arabic-text">
            يدعم SOL والرموز المميزة لشبكة Solana
          </p>
        </CardContent>
      </Card>
    </div>
  );
};