import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, Send, QrCode, Plus, Wallet2, 
  RefreshCw, ExternalLink, Eye, EyeOff, AlertCircle
} from "lucide-react";

// Multi-wallet support with MetaMask, Phantom, and internal wallets
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: { toString(): string } }>;
        disconnect: () => Promise<void>;
      };
    };
  }
}

const WalletFixed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [connectedWallets, setConnectedWallets] = useState<any[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const connectMetaMask = async () => {
    if (!window.ethereum?.isMetaMask) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    setIsConnecting('metamask');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setConnectedWallets(prev => [...prev, { type: 'MetaMask', address: accounts[0], balance: 0 }]);
      toast({ title: "متصل بـ MetaMask", description: `العنوان: ${accounts[0].slice(0, 16)}...` });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل الاتصال مع MetaMask", variant: "destructive" });
    }
    setIsConnecting(null);
  };

  const connectPhantom = async () => {
    if (!window.phantom?.solana?.isPhantom) {
      window.open('https://phantom.app/', '_blank');
      return;
    }
    setIsConnecting('phantom');
    try {
      const response = await window.phantom.solana.connect();
      setConnectedWallets(prev => [...prev, { type: 'Phantom', address: response.publicKey.toString(), balance: 0 }]);
      toast({ title: "متصل بـ Phantom", description: `العنوان: ${response.publicKey.toString().slice(0, 16)}...` });
    } catch (error) {
      toast({ title: "خطأ", description: "فشل الاتصال مع Phantom", variant: "destructive" });
    }
    setIsConnecting(null);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">مطلوب تسجيل الدخول</h1>
        <p className="text-muted-foreground">يرجى تسجيل الدخول للوصول إلى محفظتك</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6">المحافظ الرقمية</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🦊 MetaMask
            </CardTitle>
            <CardDescription>محفظة Ethereum الأشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={connectMetaMask} 
              disabled={isConnecting === 'metamask'}
              className="w-full"
            >
              {isConnecting === 'metamask' ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
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
              onClick={connectPhantom} 
              disabled={isConnecting === 'phantom'}
              className="w-full"
            >
              {isConnecting === 'phantom' ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
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
          <CardContent>
            <Button className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              محفظة جديدة
            </Button>
          </CardContent>
        </Card>
      </div>

      {connectedWallets.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">المحافظ المتصلة</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {connectedWallets.map((wallet, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{wallet.type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                        {wallet.address.slice(0, 16)}...
                      </code>
                      <Button size="sm" variant="ghost">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Send className="h-4 w-4 mr-2" />
                        إرسال
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <QrCode className="h-4 w-4 mr-2" />
                        استقبال
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletFixed;
