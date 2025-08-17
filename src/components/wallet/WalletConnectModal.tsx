import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet2, RefreshCw } from 'lucide-react';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'walletconnect' | 'metamask' | 'phantom';
  supported: boolean;
}

const walletOptions: WalletOption[] = [
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'اتصال بأكثر من 300 محفظة',
    type: 'walletconnect',
    supported: true
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'محفظة Ethereum الأشهر',
    type: 'metamask',
    supported: true
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    description: 'محفظة Solana الرائدة',
    type: 'phantom',
    supported: true
  },
  {
    id: 'tonwallet',
    name: 'Ton Wallet',
    icon: '💎',
    description: 'محفظة TON الرسمية',
    type: 'walletconnect',
    supported: true
  },
  {
    id: 'bitget',
    name: 'Bitget Wallet',
    icon: '⚡',
    description: 'محفظة متعددة الشبكات',
    type: 'walletconnect',
    supported: true
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    icon: '🏛️',
    description: 'محفظة OKX Web3',
    type: 'walletconnect',
    supported: true
  }
];

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (type: string) => Promise<void>;
  isConnecting: boolean;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  open,
  onOpenChange,
  onConnect,
  isConnecting
}) => {
  const handleConnect = async (walletType: string) => {
    try {
      await onConnect(walletType);
      onOpenChange(false);
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet2 className="h-5 w-5" />
            اتصال المحفظة
          </DialogTitle>
          <DialogDescription>
            اختر محفظتك المفضلة للاتصال بالمنصة
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {walletOptions.map((wallet) => (
            <Card 
              key={wallet.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                !wallet.supported ? 'opacity-50' : ''
              }`}
              onClick={() => handleConnect(wallet.type)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="text-2xl">{wallet.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{wallet.name}</h3>
                    {!wallet.supported && wallet.id !== 'walletconnect' && wallet.id !== 'metamask' && wallet.id !== 'phantom' && (
                      <Badge variant="secondary" className="text-xs">
                        قريباً
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {wallet.description}
                  </p>
                </div>
                {isConnecting && (wallet.id === 'walletconnect' || wallet.id === 'metamask' || wallet.id === 'phantom') && (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};