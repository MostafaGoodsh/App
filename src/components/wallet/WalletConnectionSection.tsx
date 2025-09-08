import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletConnectModal } from "./WalletConnectModal";
import { RefreshCw } from "lucide-react";

interface WalletConnectionSectionProps {
  isConnecting: boolean;
  onWalletConnect: (type: string) => Promise<void>;
  onAddInternalWallet: (wallet: any) => void;
}

export const WalletConnectionSection = ({ isConnecting, onWalletConnect, onAddInternalWallet }: WalletConnectionSectionProps) => {
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const handleWalletConnectClick = () => {
    setConnectModalOpen(true);
  };

  const handleModalConnect = async (type: string) => {
    await onWalletConnect(type);
    setConnectModalOpen(false);
  };


  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔗 WalletConnect
          </CardTitle>
          <CardDescription>اتصال بأكثر من 300 محفظة</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleWalletConnectClick}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            اتصال بالمحافظ
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🦊 MetaMask
          </CardTitle>
          <CardDescription>محفظة Ethereum الأشهر</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => onWalletConnect('metamask')}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            اتصال بـ MetaMask
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👻 Phantom
          </CardTitle>
          <CardDescription>محفظة Solana الرائدة</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => onWalletConnect('phantom')}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            اتصال بـ Phantom
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🛡️ SquadsX
          </CardTitle>
          <CardDescription>محفظة Solana متعددة التوقيع</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => onWalletConnect('squads')}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            اتصال بـ SquadsX
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