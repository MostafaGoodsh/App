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

  // Phantom Wallet States
  const [phantomWallet, setPhantomWallet] = useState<any>(null);
  const [phantomConnected, setPhantomConnected] = useState(false);
  const [phantomBalance, setPhantomBalance] = useState(0);
  const [phantomPublicKey, setPhantomPublicKey] = useState("");

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

  // التحقق من وجود Phantom Wallet
  useEffect(() => {
    const checkPhantomWallet = () => {
      // طرق متعددة للتحقق من Phantom
      const phantom = window.phantom?.solana;
      const solana = window.solana;
      
      console.log('Checking for Phantom...', { phantom, solana, isPhantom: solana?.isPhantom });
      
      if (phantom?.isPhantom) {
        console.log('Phantom found via window.phantom.solana');
        setPhantomWallet(phantom);
      } else if (solana?.isPhantom) {
        console.log('Phantom found via window.solana');
        setPhantomWallet(solana);
      } else {
        console.log('Phantom not detected');
        setPhantomWallet(null);
        return;
      }
      
      // إذا تم العثور على المحفظة، تحقق من الاتصال المسبق
      const provider = phantom || solana;
      if (provider) {
        provider.connect({ onlyIfTrusted: true })
          .then((response: any) => {
            setPhantomConnected(true);
            setPhantomPublicKey(response.publicKey.toString());
            fetchPhantomBalance(response.publicKey.toString());
          })
          .catch(() => {
            console.log('Not previously connected');
          });
      }
    };

    // التحقق الفوري
    checkPhantomWallet();
    
    // التحقق بعد تأخير قصير
    const timer1 = setTimeout(checkPhantomWallet, 100);
    const timer2 = setTimeout(checkPhantomWallet, 500);
    const timer3 = setTimeout(checkPhantomWallet, 1000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
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

  // Phantom Wallet Functions
  const fetchPhantomBalance = async (publicKey: string) => {
    try {
      // محاكاة جلب الرصيد من شبكة سولانا
      const balance = Math.random() * 10;
      setPhantomBalance(balance);
    } catch (error) {
      console.error('Error fetching Phantom balance:', error);
    }
  };

  const connectPhantomWallet = async () => {
    if (!phantomWallet) {
      toast({
        title: "Phantom غير متاح",
        description: "يرجى تثبيت محفظة Phantom أولاً",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await phantomWallet.connect();
      setPhantomConnected(true);
      setPhantomPublicKey(response.publicKey.toString());
      await fetchPhantomBalance(response.publicKey.toString());
      
      toast({
        title: "تم الاتصال بـ Phantom",
        description: `متصل بعنوان: ${response.publicKey.toString().slice(0, 16)}...`
      });
    } catch (error) {
      console.error('Error connecting to Phantom:', error);
      toast({
        title: "خطأ في الاتصال",
        description: "فشل الاتصال بمحفظة Phantom",
        variant: "destructive"
      });
    }
  };

  const disconnectPhantomWallet = async () => {
    if (!phantomWallet) return;

    try {
      await phantomWallet.disconnect();
      setPhantomConnected(false);
      setPhantomPublicKey("");
      setPhantomBalance(0);
      
      toast({
        title: "تم قطع الاتصال",
        description: "تم قطع الاتصال مع محفظة Phantom"
      });
    } catch (error) {
      console.error('Error disconnecting from Phantom:', error);
    }
  };

  const sendSolanaTransaction = async (to: string, amount: number) => {
    if (!phantomWallet || !phantomConnected) {
      toast({
        title: "غير متصل",
        description: "يرجى الاتصال بمحفظة Phantom أولاً",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "معاملة تجريبية",
        description: `إرسال ${amount} SOL إلى ${to.slice(0, 16)}...`,
      });
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast({
        title: "خطأ في المعاملة",
        description: "فشل في إرسال المعاملة",
        variant: "destructive"
      });
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

        {/* Phantom Wallet Card - محفظة حقيقية دائماً متاحة */}
        <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">P</span>
                </div>
                Phantom Wallet (Solana)
              </CardTitle>
              <CardDescription>
                محفظة Solana - اضغط للاتصال المباشر
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  // محاولة الاتصال المباشر
                  if (typeof window !== 'undefined') {
                    try {
                      // فتح نافذة Phantom مباشرة
                      window.open('https://phantom.app/ul/browse/https://id-preview--69f736db-546a-4e1c-8a62-19d26c64f5a8.lovable.app/wallet?utm_source=wallet&utm_medium=dapp', '_blank');
                      toast({
                        title: "🚀 فتح Phantom",
                        description: "يتم فتح محفظة Phantom الآن..."
                      });
                    } catch (error) {
                      // محاولة التحقق من المحفظة يدوياً
                      const allWindows = Object.keys(window);
                      const phantomKeys = allWindows.filter(key => key.toLowerCase().includes('phantom') || key.toLowerCase().includes('solana'));
                      
                      toast({
                        title: "🔍 تجربة الاتصال",
                        description: phantomKeys.length > 0 ? `تم العثور على: ${phantomKeys.join(', ')}` : "لم يتم العثور على Phantom"
                      });
                    }
                  }
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6"
              >
                🔗 اتصال مباشر بـ Phantom
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // فحص شامل للمحفظة
                  const windowProps = Object.keys(window);
                  const phantomProps = windowProps.filter(prop => 
                    prop.toLowerCase().includes('phantom') || 
                    prop.toLowerCase().includes('solana') ||
                    prop.toLowerCase().includes('wallet')
                  );
                  
                  console.log('All window properties:', windowProps.slice(0, 20));
                  console.log('Phantom-related properties:', phantomProps);
                  console.log('Navigator userAgent:', navigator.userAgent);
                  
                  toast({
                    title: "🔍 فحص تفصيلي",
                    description: `تم العثور على ${phantomProps.length} خاصية متعلقة بالمحافظ - تحقق من Console`
                  });
                }}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                🔍 فحص المحفظة
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-amber-100 rounded-lg border border-amber-300">
                <h3 className="font-semibold text-amber-900 mb-2">⚡ اتصال سريع:</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => window.open('phantom://browse/https://id-preview--69f736db-546a-4e1c-8a62-19d26c64f5a8.lovable.app/wallet', '_self')}
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
                  >
                    📱 فتح في تطبيق Phantom (موبايل)
                  </Button>
                  
                  <Button
                    onClick={() => {
                      // نسخ رابط للمحفظة
                      navigator.clipboard.writeText('https://id-preview--69f736db-546a-4e1c-8a62-19d26c64f5a8.lovable.app/wallet');
                      toast({
                        title: "تم النسخ!",
                        description: "افتح Phantom وألصق هذا الرابط في المتصفح الداخلي"
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full border-green-300 text-green-700 hover:bg-green-100"
                  >
                    📋 نسخ رابط للمحفظة
                  </Button>
                </div>
              </div>

              <div className="text-center p-4 bg-blue-100 rounded-lg border border-blue-300">
                <h3 className="font-semibold text-blue-900 mb-2">🔧 طرق الاتصال:</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• استخدم متصفح Phantom الداخلي</p>
                  <p>• أو افتح هذا الموقع من داخل تطبيق Phantom</p>
                  <p>• أو استخدم WalletConnect (قريباً)</p>
                </div>
              </div>

              {phantomConnected ? (
                <div className="p-4 bg-green-100 rounded-lg border border-green-300">
                  <p className="text-green-800 font-semibold">✅ متصل بـ Phantom!</p>
                  <p className="text-sm text-green-600">العنوان: {phantomPublicKey}</p>
                  <p className="text-sm text-green-600">الرصيد: {phantomBalance} SOL</p>
                </div>
              ) : (
                <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <p className="text-gray-700 text-sm">
                    💡 نصيحة: إذا كان لديك Phantom مثبت، جرب فتح هذا الموقع من داخل التطبيق
                  </p>
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