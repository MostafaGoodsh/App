import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WalletConnectModal } from "./WalletConnectModal";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { Keypair } from "@solana/web3.js";
import { 
  RefreshCw, Plus, Network
} from "lucide-react";

interface WalletConnectionSectionProps {
  isConnecting: boolean;
  onWalletConnect: (type: string) => Promise<void>;
}

export const WalletConnectionSection = ({ isConnecting, onWalletConnect }: WalletConnectionSectionProps) => {
  const { toast } = useToast();
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<'Ethereum' | 'Solana'>('Ethereum');

  const handleWalletConnectClick = () => {
    setConnectModalOpen(true);
  };

  const handleModalConnect = async (type: string) => {
    await onWalletConnect(type);
    setConnectModalOpen(false);
  };

  const createInternalWallet = async () => {
    if (!newWalletName.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم المحفظة", variant: "destructive" });
      return;
    }
    
    try {
      let newWallet: any;
      
      if (selectedNetwork === 'Ethereum') {
        const wallet = ethers.Wallet.createRandom();
        newWallet = {
          id: Date.now().toString(),
          type: 'Internal',
          address: wallet.address,
          balance: "0.0",
          currency: 'ETH',
          network: 'Ethereum',
          name: newWalletName
        };
      } else {
        const keypair = Keypair.generate();
        newWallet = {
          id: Date.now().toString(),
          type: 'Internal',
          address: keypair.publicKey.toString(),
          balance: "0.0",
          currency: 'SOL',
          network: 'Solana',
          name: newWalletName
        };
      }
      
      setNewWalletName("");
      toast({ 
        title: "تم إنشاء المحفظة", 
        description: `محفظة ${newWalletName} (${selectedNetwork}) تم إنشاؤها بنجاح` 
      });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في إنشاء المحفظة", variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
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
            ➕ إنشاء محفظة
          </CardTitle>
          <CardDescription>أنشئ محفظة داخلية جديدة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="wallet-name">اسم المحفظة</Label>
            <Input
              id="wallet-name"
              placeholder="أدخل اسم المحفظة"
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="network-select">اختر الشبكة</Label>
            <Select value={selectedNetwork} onValueChange={(value: 'Ethereum' | 'Solana') => setSelectedNetwork(value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الشبكة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ethereum">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Ethereum (ETH)
                  </div>
                </SelectItem>
                <SelectItem value="Solana">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Solana (SOL)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={createInternalWallet}>
            <Plus className="h-4 w-4 mr-2" />
            إنشاء محفظة {selectedNetwork}
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