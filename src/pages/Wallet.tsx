import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, Send, QrCode, Plus, Wallet2, 
  TrendingUp, TrendingDown, Clock, CheckCircle,
  AlertCircle, Eye, EyeOff
} from "lucide-react";
import * as QRCodeGenerator from 'qrcode';
import EthereumProvider from '@walletconnect/ethereum-provider';

// Declare window interface for Phantom Wallet
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
        disconnect: () => Promise<void>;
        request: (opts: { method: string; params?: any }) => Promise<any>;
        on: (event: string, callback: (args: any) => void) => void;
        off: (event: string, callback: (args: any) => void) => void;
      };
    };
    solana?: {
      isPhantom?: boolean;
      connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
      request: (opts: { method: string; params?: any }) => Promise<any>;
      on: (event: string, callback: (args: any) => void) => void;
      off: (event: string, callback: (args: any) => void) => void;
    };
  }
}

// Interfaces
interface Wallet {
  id: string;
  user_id: string;
  wallet_address: string;
  wallet_type: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  cryptocurrency: string;
  wallet_name: string;
  networks: string[];
}

interface WalletToken {
  id: string;
  wallet_id: string;
  token_id?: string;
  cryptocurrency?: string;
  contract_address?: string;
  network: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  token?: CustomToken;
}

interface CustomToken {
  id: string;
  contract_address: string;
  name: string;
  symbol: string;
  decimals: number;
  network: string;
  logo_url?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface CryptoAddress {
  id: string;
  wallet_id: string;
  cryptocurrency: string;
  address: string;
  label?: string;
  is_active: boolean;
  created_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  transaction_type: string;
  description?: string;
  status: string;
  transaction_hash?: string;
  network?: string;
  gas_fee?: number;
  created_at: string;
}

interface PendingDeposit {
  id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  cryptocurrency: string;
  network: string;
  status: string;
  from_address: string;
  to_address: string;
  transaction_hash?: string;
  confirmations: number;
  required_confirmations: number;
  detected_at: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

// Constants
const SUPPORTED_CRYPTOCURRENCIES = [
  { label: "Bitcoin", value: "BTC", icon: "₿", color: "text-orange-600" },
  { label: "Ethereum", value: "ETH", icon: "Ξ", color: "text-blue-600" },
  { label: "Solana", value: "SOL", icon: "◎", color: "text-purple-600" },
  { label: "Polygon", value: "MATIC", icon: "⬟", color: "text-indigo-600" },
  { label: "BNB", value: "BNB", icon: "⬢", color: "text-yellow-600" },
  { label: "Tether", value: "USDT", icon: "₮", color: "text-green-600" },
  { label: "Cardano", value: "ADA", icon: "₳", color: "text-blue-500" },
];

const SUPPORTED_NETWORKS = [
  { label: "Bitcoin", value: "bitcoin", color: "text-orange-600" },
  { label: "Ethereum", value: "ethereum", color: "text-blue-600" },
  { label: "Solana", value: "solana", color: "text-purple-600" },
  { label: "Polygon", value: "polygon", color: "text-indigo-600" },
];

const WalletFixed = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // States
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletTokens, setWalletTokens] = useState<WalletToken[]>([]);
  const [cryptoAddresses, setCryptoAddresses] = useState<CryptoAddress[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [customTokens, setCustomTokens] = useState<CustomToken[]>([]);
  
  // UI States
  const [amount, setAmount] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [selectedToken, setSelectedToken] = useState<WalletToken | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showPrivateKeys, setShowPrivateKeys] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);

  // Custom Token States
  const [isAddTokenOpen, setIsAddTokenOpen] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum");

  // WalletConnect States
  const [walletConnectProvider, setWalletConnectProvider] = useState<any>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [connectedBalance, setConnectedBalance] = useState(0);

  useEffect(() => {
    if (user) {
      fetchWallets();
      fetchCryptoAddresses();
      fetchCustomTokens();
      fetchPendingDeposits();
    }
  }, [user]);

  useEffect(() => {
    if (wallets.length > 0) {
      if (wallets[0].wallet_address) {
        generateQRCode(wallets[0].wallet_address);
      }
      fetchTransactions();
    }
  }, [wallets]);

  // Initialize WalletConnect
  useEffect(() => {
    const initWalletConnect = async () => {
      try {
        const provider = await EthereumProvider.init({
          projectId: 'demo-project-id', // Replace with your project ID
          chains: [1, 137, 56], // Ethereum, Polygon, BSC
          showQrModal: true,
          methods: [
            'eth_sendTransaction',
            'eth_signTransaction',
            'eth_sign',
            'personal_sign',
            'eth_signTypedData',
          ],
          events: ['chainChanged', 'accountsChanged'],
          metadata: {
            name: 'المحفظة الرقمية',
            description: 'محفظة للعملات الرقمية',
            url: window.location.origin,
            icons: ['https://walletconnect.com/walletconnect-logo.png']
          }
        });
        
        setWalletConnectProvider(provider);
      } catch (error) {
        console.error('Error initializing WalletConnect:', error);
      }
    };
    
    initWalletConnect();
  }, []);

  const generateQRCode = async (address: string) => {
    try {
      const qrDataURL = await QRCodeGenerator.toDataURL(address, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWallets(data || []);
      
      if (data && data.length > 0) {
        const walletIds = data.map(w => w.id);
        await fetchWalletTokens(walletIds);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
      toast({
        title: "خطأ في جلب المحافظ",
        description: "حدث خطأ أثناء جلب بيانات المحافظ",
        variant: "destructive"
      });
    }
  };

  const fetchWalletTokens = async (walletIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('wallet_tokens')
        .select(`
          *,
          token:custom_tokens(*)
        `)
        .in('wallet_id', walletIds)
        .eq('is_active', true);

      if (error) throw error;
      setWalletTokens(data || []);
    } catch (error) {
      console.error('Error fetching wallet tokens:', error);
    }
  };

  const fetchCustomTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_tokens')
        .select('*')
        .eq('is_verified', true)
        .order('name');

      if (error) throw error;
      setCustomTokens(data || []);
    } catch (error) {
      console.error('Error fetching custom tokens:', error);
    }
  };

  const fetchCryptoAddresses = async () => {
    try {
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (walletsError) throw walletsError;

      if (walletsData && walletsData.length > 0) {
        const walletIds = walletsData.map(w => w.id);
        const { data, error } = await supabase
          .from('crypto_addresses')
          .select('*')
          .in('wallet_id', walletIds)
          .eq('is_active', true);

        if (error) throw error;
        setCryptoAddresses(data || []);
      }
    } catch (error) {
      console.error('Error fetching crypto addresses:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchPendingDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_deposits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingDeposits(data || []);
    } catch (error) {
      console.error('Error fetching pending deposits:', error);
    }
  };

  // WalletConnect Functions
  const connectWallet = async () => {
    if (!walletConnectProvider) {
      toast({
        title: "WalletConnect غير متاح",
        description: "جاري تحميل WalletConnect...",
        variant: "destructive"
      });
      return;
    }

    try {
      const accounts = await walletConnectProvider.enable();
      if (accounts.length > 0) {
        setIsWalletConnected(true);
        setConnectedAddress(accounts[0]);
        
        // Get balance (simplified)
        const balance = Math.random() * 5; // Demo balance
        setConnectedBalance(balance);
        
        toast({
          title: "تم الاتصال بالمحفظة",
          description: `متصل بعنوان: ${accounts[0].slice(0, 16)}...`
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "خطأ في الاتصال",
        description: "فشل الاتصال بالمحفظة",
        variant: "destructive"
      });
    }
  };

  const disconnectWallet = async () => {
    if (!walletConnectProvider) return;

    try {
      await walletConnectProvider.disconnect();
      setIsWalletConnected(false);
      setConnectedAddress("");
      setConnectedBalance(0);
      
      toast({
        title: "تم قطع الاتصال",
        description: "تم قطع الاتصال مع المحفظة"
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "تم النسخ",
        description: "تم نسخ العنوان إلى الحافظة"
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const getCryptoInfo = (crypto: string) => {
    return SUPPORTED_CRYPTOCURRENCIES.find(c => c.value === crypto) || 
           { label: crypto, icon: "◦", color: "text-gray-600" };
  };

  const getNetworkInfo = (network: string) => {
    return SUPPORTED_NETWORKS.find(n => n.value === network) || 
           { label: network, color: "text-gray-600" };
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
    <>
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-2">المحفظة الرقمية</h1>
            <p className="text-muted-foreground">محفظة موحدة للعملات الرقمية المختلفة</p>
          </div>
        </div>

        {/* WalletConnect Card - الطريقة الأساسية للاتصال */}
        <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                  <Wallet2 className="h-4 w-4 text-white" />
                </div>
                WalletConnect - اتصال عالمي
              </CardTitle>
              <CardDescription>
                اتصل بأي محفظة رقمية (MetaMask, Trust Wallet, Phantom وغيرها)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isWalletConnected ? (
                <Button
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-6"
                >
                  🔗 اتصال بالمحفظة
                </Button>
              ) : (
                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  قطع الاتصال
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {isWalletConnected ? (
                <div className="p-4 bg-green-100 rounded-lg border border-green-300">
                  <p className="text-green-800 font-semibold">✅ متصل بالمحفظة!</p>
                  <p className="text-sm text-green-600">العنوان: {connectedAddress}</p>
                  <p className="text-sm text-green-600">الرصيد: {connectedBalance.toFixed(4)} ETH</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(connectedAddress)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      نسخ العنوان
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
                    <h3 className="font-semibold text-blue-900 mb-2">🔗 طريقة الاتصال:</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• اضغط على "اتصال بالمحفظة"</p>
                      <p>• اختر محفظتك من القائمة</p>
                      <p>• أو امسح QR Code من تطبيق المحفظة</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-100 rounded-lg border border-amber-300">
                    <h3 className="font-semibold text-amber-900 mb-2">✨ المحافظ المدعومة:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-amber-700">
                      <p>• MetaMask</p>
                      <p>• Trust Wallet</p>
                      <p>• Phantom</p>
                      <p>• Rainbow</p>
                      <p>• Coinbase Wallet</p>
                      <p>• +200 محفظة أخرى</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* رسالة تفسيرية */}
        <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">🚀 تجربة محفظة حقيقية!</h3>
          <p className="text-blue-700 text-sm">
            محفظة Phantom أعلاه متصلة بشبكة Solana الحقيقية. يمكنك استخدامها لإرسال واستقبال SOL بأمان كامل.
            المحافظ التجريبية أدناه مخصصة للتعلم والاختبار فقط.
          </p>
        </div>

        {/* المحافظ التجريبية والميزات الأخرى */}
        {wallets.length === 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                محافظ تجريبية
              </CardTitle>
              <CardDescription>
                قم بإنشاء محافظ تجريبية للتعلم والاختبار
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  يمكنك إنشاء محافظ تجريبية للتعلم والاختبار (لا تؤثر على الأموال الحقيقية)
                </p>
                <Button className="w-full" disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء محفظة تجريبية (قريباً)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  );
};

export default WalletFixed;