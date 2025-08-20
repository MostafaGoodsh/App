import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { useToast } from "@/hooks/use-toast";
import { 
  Network, Zap, ArrowRight, Globe, 
  Coins, Activity, CheckCircle 
} from "lucide-react";

interface NetworkSwitcherProps {
  wallets: ConnectedWallet[];
  selectedNetwork: string;
  onNetworkChange: (network: string) => void;
}

const supportedNetworks = [
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    color: 'bg-blue-500', 
    icon: '⟠',
    description: 'الشبكة الرئيسية للـ Ethereum'
  },
  { 
    id: 'solana', 
    name: 'Solana', 
    symbol: 'SOL', 
    color: 'bg-purple-500', 
    icon: '◎',
    description: 'شبكة Solana عالية الأداء'
  },
  { 
    id: 'polygon', 
    name: 'Polygon', 
    symbol: 'MATIC', 
    color: 'bg-indigo-500', 
    icon: '⬟',
    description: 'شبكة Polygon Layer 2'
  },
  { 
    id: 'bsc', 
    name: 'Binance Smart Chain', 
    symbol: 'BNB', 
    color: 'bg-yellow-500', 
    icon: '◆',
    description: 'شبكة Binance الذكية'
  }
];

export const NetworkSwitcher = ({ 
  wallets, 
  selectedNetwork, 
  onNetworkChange 
}: NetworkSwitcherProps) => {
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);

  const getNetworkWallets = (networkId: string) => {
    return wallets.filter(wallet => 
      wallet.network.toLowerCase() === networkId ||
      (networkId === 'ethereum' && wallet.network === 'Ethereum') ||
      (networkId === 'solana' && wallet.network === 'Solana')
    );
  };

  const handleNetworkChange = async (networkId: string) => {
    setIsChanging(true);
    try {
      const network = supportedNetworks.find(n => n.id === networkId);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network change
      
      // Pass the network ID for proper filtering
      onNetworkChange(networkId);
      
      toast({
        title: "تم تبديل الشبكة",
        description: `تم التبديل إلى شبكة ${network?.name} بنجاح`
      });
    } catch (error) {
      toast({
        title: "فشل في تبديل الشبكة",
        description: "حدث خطأ أثناء تبديل الشبكة",
        variant: "destructive"
      });
    } finally {
      setIsChanging(false);
    }
  };

  const currentNetwork = supportedNetworks.find(n => 
    n.id === selectedNetwork.toLowerCase() || 
    n.name.toLowerCase() === selectedNetwork.toLowerCase()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5" />
          تبديل الشبكة
        </CardTitle>
        <CardDescription>
          اختر الشبكة التي تريد التفاعل معها
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* الشبكة الحالية */}
        {currentNetwork && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${currentNetwork.color} rounded-full flex items-center justify-center text-white text-lg font-bold`}>
                {currentNetwork.icon}
              </div>
              <div>
                <p className="font-medium">{currentNetwork.name}</p>
                <p className="text-sm text-muted-foreground">
                  {getNetworkWallets(currentNetwork.id).length} محفظة متصلة
                </p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              نشطة
            </Badge>
          </div>
        )}

        {/* اختيار الشبكة */}
        <div className="space-y-3">
          <label className="text-sm font-medium">اختيار شبكة أخرى:</label>
          <Select 
            value={selectedNetwork.toLowerCase()} 
            onValueChange={handleNetworkChange}
            disabled={isChanging}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر شبكة" />
            </SelectTrigger>
            <SelectContent>
              {supportedNetworks.map((network) => (
                <SelectItem key={network.id} value={network.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{network.icon}</span>
                    <div>
                      <p className="font-medium">{network.name}</p>
                      <p className="text-xs text-muted-foreground">{network.description}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* شبكات متاحة */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">الشبكات المتاحة:</h4>
          <div className="grid grid-cols-2 gap-3">
            {supportedNetworks.map((network) => {
              const networkWallets = getNetworkWallets(network.id);
              const isActive = currentNetwork?.id === network.id;
              
              return (
                <Button
                  key={network.id}
                  variant={isActive ? "default" : "outline"}
                  className="h-auto p-3 flex-col gap-2"
                  onClick={() => handleNetworkChange(network.id)}
                  disabled={isChanging || isActive}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{network.icon}</span>
                    <span className="font-medium text-xs">{network.symbol}</span>
                  </div>
                  <div className="text-xs opacity-75">
                    {networkWallets.length} محفظة
                  </div>
                  {isActive && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Globe className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Cross-Chain Support</p>
              <p className="text-blue-700">
                يمكنك التنقل بين الشبكات المختلفة والتفاعل مع محافظك على كل شبكة بشكل منفصل.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};