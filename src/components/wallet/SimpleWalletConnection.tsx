import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Plus } from 'lucide-react';

interface SimpleWalletConnectionProps {
  isConnecting: boolean;
  onConnectMetaMask: () => void;
  onConnectPhantom: () => void;
  onCreateWallet: (data: { name: string; network: 'Ethereum' | 'Solana' }) => void;
}

export const SimpleWalletConnection = ({
  isConnecting,
  onConnectMetaMask,
  onConnectPhantom,
  onCreateWallet
}: SimpleWalletConnectionProps) => {
  const { toast } = useToast();
  const [newWalletName, setNewWalletName] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<'Ethereum' | 'Solana'>('Ethereum');

  const handleCreateWallet = () => {
    if (!newWalletName.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم المحفظة',
        variant: 'destructive'
      });
      return;
    }

    onCreateWallet({
      name: newWalletName,
      network: selectedNetwork
    });

    setNewWalletName('');
    toast({
      title: 'تم إنشاء المحفظة',
      description: `تم إنشاء محفظة ${newWalletName} بنجاح`
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {/* MetaMask Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🦊 MetaMask
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            محفظة Ethereum الأشهر
          </p>
          <Button
            onClick={() => {
              console.log('MetaMask clicked');
              onConnectMetaMask();
            }}
            disabled={isConnecting}
            className="w-full"
            type="button"
          >
            <Wallet className="h-4 w-4 mr-2" />
            اتصال بـ MetaMask
          </Button>
        </CardContent>
      </Card>

      {/* Phantom Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👻 Phantom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            محفظة Solana الرائدة
          </p>
          <Button
            onClick={() => {
              console.log('Phantom clicked');
              onConnectPhantom();
            }}
            disabled={isConnecting}
            className="w-full"
            type="button"
          >
            <Wallet className="h-4 w-4 mr-2" />
            اتصال بـ Phantom
          </Button>
        </CardContent>
      </Card>

      {/* Create Internal Wallet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏦 إنشاء محفظة
          </CardTitle>
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
            <Label htmlFor="network-select">الشبكة</Label>
            <Select
              value={selectedNetwork}
              onValueChange={(value: 'Ethereum' | 'Solana') => setSelectedNetwork(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الشبكة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ethereum">Ethereum (ETH)</SelectItem>
                <SelectItem value="Solana">Solana (SOL)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleCreateWallet} 
            className="w-full" 
            type="button"
          >
            <Plus className="h-4 w-4 mr-2" />
            إنشاء محفظة
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};