import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletConnectModal } from "./WalletConnectModal";
import { RefreshCw, Wallet, Chrome } from "lucide-react";

interface WalletConnectionSectionProps {
  isConnecting: boolean;
  onWalletConnect: (type: string) => Promise<void>;
}

export const WalletConnectionSection = ({ isConnecting, onWalletConnect }: WalletConnectionSectionProps) => {
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const handleWalletConnectClick = () => {
    setConnectModalOpen(true);
  };

  const handleModalConnect = async (type: string) => {
    await onWalletConnect(type);
    setConnectModalOpen(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            WalletConnect
          </CardTitle>
          <CardDescription className="arabic-text">اتصال بأكثر من 300 محفظة</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleWalletConnectClick}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            <span className="arabic-text">اتصال بالمحافظ</span>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Chrome className="w-5 h-5" />
            MetaMask
          </CardTitle>
          <CardDescription className="arabic-text">محفظة Ethereum الأشهر</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => onWalletConnect('metamask')}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            <span className="arabic-text">اتصال بـ MetaMask</span>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👻 Phantom
          </CardTitle>
          <CardDescription className="arabic-text">محفظة Solana الرائدة</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => onWalletConnect('phantom')}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            <span className="arabic-text">اتصال بـ Phantom</span>
          </Button>
        </CardContent>
      </Card>

      <WalletConnectModal
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
        onConnect={handleModalConnect}
        isConnecting={isConnecting}
      />
    </div>
  );
};