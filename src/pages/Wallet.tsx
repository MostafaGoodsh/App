import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Wallet as WalletIcon, Plus, ArrowUpDown, Copy, Eye, EyeOff, Bitcoin, Coins, QrCode } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCodeGenerator from "qrcode";

interface Wallet {
  id: string;
  wallet_type: string;
  wallet_address: string | null;
  balance: number;
  cryptocurrency: string;
  is_active: boolean;
  created_at: string;
  public_key?: string;
  networks?: string[];
  is_multi_network?: boolean;
  wallet_name?: string;
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
  custom_token?: CustomToken;
}

interface CustomToken {
  id: string;
  contract_address: string;
  name: string;
  symbol: string;
  decimals: number;
  network: string;
  logo_url?: string;
  is_verified?: boolean;
}

interface CryptoAddress {
  id: string;
  cryptocurrency: string;
  address: string;
  label: string | null;
  is_active: boolean;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string | null;
  status: string;
  transaction_hash: string | null;
  network: string;
  gas_fee: number;
  created_at: string;
}

const SUPPORTED_NETWORKS = [
  { value: 'bitcoin', label: 'Bitcoin', icon: '₿', color: 'text-orange-500' },
  { value: 'ethereum', label: 'Ethereum', icon: 'Ξ', color: 'text-blue-500' },
  { value: 'binance', label: 'Binance Smart Chain', icon: 'BNB', color: 'text-yellow-500' },
  { value: 'polygon', label: 'Polygon', icon: '🔵', color: 'text-purple-500' },
  { value: 'solana', label: 'Solana', icon: '◎', color: 'text-purple-400' },
  { value: 'cardano', label: 'Cardano', icon: 'ADA', color: 'text-blue-400' },
  { value: 'polkadot', label: 'Polkadot', icon: 'DOT', color: 'text-pink-500' }
];

const SUPPORTED_CRYPTOCURRENCIES = [
  { value: 'BTC', label: 'Bitcoin (BTC)', icon: '₿', color: 'text-orange-500', network: 'bitcoin' },
  { value: 'ETH', label: 'Ethereum (ETH)', icon: 'Ξ', color: 'text-blue-500', network: 'ethereum' },
  { value: 'USDT', label: 'Tether (USDT)', icon: '₮', color: 'text-green-500', network: 'ethereum' },
  { value: 'BNB', label: 'Binance Coin (BNB)', icon: 'BNB', color: 'text-yellow-500', network: 'binance' },
  { value: 'ADA', label: 'Cardano (ADA)', icon: 'ADA', color: 'text-blue-400', network: 'cardano' },
  { value: 'DOT', label: 'Polkadot (DOT)', icon: 'DOT', color: 'text-pink-500', network: 'polkadot' },
  { value: 'SOL', label: 'Solana (SOL)', icon: '◎', color: 'text-purple-500', network: 'solana' }
];

const Wallet = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/wallet";
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletTokens, setWalletTokens] = useState<WalletToken[]>([]);
  const [customTokens, setCustomTokens] = useState<CustomToken[]>([]);
  const [cryptoAddresses, setCryptoAddresses] = useState<CryptoAddress[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrivateKeys, setShowPrivateKeys] = useState(false);
  const [newCryptocurrency, setNewCryptocurrency] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [contractAddress, setContractAddress] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum");
  const [isAddingCustomToken, setIsAddingCustomToken] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchWallets();
      fetchTransactions();
      fetchCryptoAddresses();
      fetchWalletTokens();
      fetchCustomTokens();
    }
  }, [user]);

  useEffect(() => {
    if (wallets.length > 0 && wallets[0].wallet_address) {
      generateQRCode(wallets[0].wallet_address);
    }
  }, [wallets]);

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      toast({
        title: "خطأ في جلب المحافظ",
        description: "حدث خطأ أثناء جلب بيانات المحافظ",
        variant: "destructive"
      });
    }
  };

  const fetchWalletTokens = async () => {
    try {
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', user?.id);

      if (walletsError) throw walletsError;

      if (walletsData && walletsData.length > 0) {
        const walletIds = walletsData.map(w => w.id);
        const { data, error } = await supabase
          .from('wallet_tokens')
          .select(`
            *,
            custom_token:custom_tokens(*)
          `)
          .in('wallet_id', walletIds)
          .eq('is_active', true);

        if (error) throw error;
        setWalletTokens(data || []);
      }
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
        .eq('user_id', user?.id);

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
      toast({
        title: "خطأ في جلب المعاملات",
        description: "حدث خطأ أثناء جلب بيانات المعاملات",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const createMultiNetworkWallet = async () => {
    try {
      // Create a unified multi-network wallet
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .insert([
          {
            user_id: user?.id,
            wallet_type: 'crypto',
            wallet_address: null, // Multi-network wallets don't have single addresses
            balance: 0,
            cryptocurrency: 'MULTI',
            is_active: true,
            is_multi_network: true,
            networks: SUPPORTED_NETWORKS.map(n => n.value),
            wallet_name: 'المحفظة متعددة الشبكات'
          }
        ])
        .select()
        .single();

      if (walletError) throw walletError;

      // Add default cryptocurrencies to the wallet
      const defaultTokens = SUPPORTED_CRYPTOCURRENCIES.map(crypto => ({
        wallet_id: walletData.id,
        cryptocurrency: crypto.value,
        network: crypto.network,
        balance: 0,
        is_active: true
      }));

      const { error: tokensError } = await supabase
        .from('wallet_tokens')
        .insert(defaultTokens);

      if (tokensError) throw tokensError;
      
      toast({
        title: "تم إنشاء المحفظة",
        description: "تم إنشاء المحفظة متعددة الشبكات بنجاح"
      });
      
      fetchWallets();
      fetchWalletTokens();
    } catch (error) {
      console.error('Error creating multi-network wallet:', error);
      toast({
        title: "خطأ في إنشاء المحفظة",
        description: "حدث خطأ أثناء إنشاء المحفظة",
        variant: "destructive"
      });
    }
  };

  const addCustomToken = async () => {
    if (!contractAddress || !selectedWalletId) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال عنوان العقد واختيار المحفظة",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAddingCustomToken(true);

      // Check if token already exists
      const { data: existingToken } = await supabase
        .from('custom_tokens')
        .select('*')
        .eq('contract_address', contractAddress)
        .eq('network', selectedNetwork)
        .single();

      let tokenId = existingToken?.id;

      if (!existingToken) {
        // For demo, create a mock token
        const { data: newToken, error: tokenError } = await supabase
          .from('custom_tokens')
          .insert([
            {
              contract_address: contractAddress,
              name: `Custom Token ${contractAddress.substring(0, 6)}`,
              symbol: `CT${contractAddress.substring(2, 6).toUpperCase()}`,
              decimals: 18,
              network: selectedNetwork,
              is_verified: false
            }
          ])
          .select()
          .single();

        if (tokenError) throw tokenError;
        tokenId = newToken.id;
      }

      // Add token to wallet
      const { error: walletTokenError } = await supabase
        .from('wallet_tokens')
        .insert([
          {
            wallet_id: selectedWalletId,
            token_id: tokenId,
            contract_address: contractAddress,
            network: selectedNetwork,
            balance: 0,
            is_active: true
          }
        ]);

      if (walletTokenError) throw walletTokenError;

      toast({
        title: "تم إضافة الرمز المميز",
        description: "تم إضافة الرمز المميز إلى المحفظة بنجاح"
      });

      setContractAddress("");
      fetchWalletTokens();
      fetchCustomTokens();
    } catch (error) {
      console.error('Error adding custom token:', error);
      toast({
        title: "خطأ في إضافة الرمز المميز",
        description: "حدث خطأ أثناء إضافة الرمز المميز",
        variant: "destructive"
      });
    } finally {
      setIsAddingCustomToken(false);
    }
  };

  const mergeWallets = async () => {
    if (wallets.length < 2) {
      toast({
        title: "عدد محافظ غير كافي",
        description: "تحتاج إلى محفظتين على الأقل للدمج",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a new multi-network wallet
      const { data: mergedWallet, error: walletError } = await supabase
        .from('wallets')
        .insert([
          {
            user_id: user?.id,
            wallet_type: 'crypto',
            wallet_address: null,
            balance: 0,
            cryptocurrency: 'MULTI',
            is_active: true,
            is_multi_network: true,
            networks: SUPPORTED_NETWORKS.map(n => n.value),
            wallet_name: 'المحفظة المدمجة'
          }
        ])
        .select()
        .single();

      if (walletError) throw walletError;

      // Move all tokens from existing wallets to the merged wallet
      const tokensToMove = [];
      for (const wallet of wallets) {
        if (wallet.balance > 0) {
          tokensToMove.push({
            wallet_id: mergedWallet.id,
            cryptocurrency: wallet.cryptocurrency,
            network: SUPPORTED_CRYPTOCURRENCIES.find(c => c.value === wallet.cryptocurrency)?.network || 'bitcoin',
            balance: wallet.balance,
            is_active: true
          });
        }
      }

      if (tokensToMove.length > 0) {
        const { error: tokensError } = await supabase
          .from('wallet_tokens')
          .insert(tokensToMove);

        if (tokensError) throw tokensError;
      }

      // Deactivate old wallets
      const { error: deactivateError } = await supabase
        .from('wallets')
        .update({ is_active: false })
        .in('id', wallets.map(w => w.id));

      if (deactivateError) throw deactivateError;

      toast({
        title: "تم دمج المحافظ",
        description: "تم دمج جميع المحافظ في محفظة واحدة متعددة الشبكات"
      });

      fetchWallets();
      fetchWalletTokens();
    } catch (error) {
      console.error('Error merging wallets:', error);
      toast({
        title: "خطأ في دمج المحافظ",
        description: "حدث خطأ أثناء دمج المحافظ",
        variant: "destructive"
      });
    }
  };

  const generateMockAddress = (crypto: string): string => {
    const prefixes: { [key: string]: string } = {
      'BTC': '1',
      'ETH': '0x',
      'USDT': '0x',
      'BNB': 'bnb',
      'ADA': 'addr1',
      'DOT': '1',
      'SOL': ''
    };
    
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = prefixes[crypto] || '1';
    const length = crypto === 'ETH' || crypto === 'USDT' ? 40 : crypto === 'SOL' ? 44 : 30;
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const validateAddress = (address: string, crypto: string): boolean => {
    const patterns: { [key: string]: RegExp } = {
      'BTC': /^[13][A-HJ-NP-Z0-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
      'ETH': /^0x[A-Fa-f0-9]{40}$/,
      'USDT': /^0x[A-Fa-f0-9]{40}$|^T[A-Za-z0-9]{33}$/,
      'BNB': /^bnb[a-z0-9]{39}$|^0x[A-Fa-f0-9]{40}$/,
      'ADA': /^addr1[a-z0-9]{53,103}$/,
      'DOT': /^1[A-Za-z0-9]{46,47}$/,
      'SOL': /^[A-Za-z0-9]{32,44}$/
    };
    
    const pattern = patterns[crypto];
    return pattern ? pattern.test(address) : true;
  };

  const sendTransaction = async () => {
    if (!amount || !receiverAddress || wallets.length === 0) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال المبلغ وعنوان المستقبل",
        variant: "destructive"
      });
      return;
    }

    const wallet = wallets[0];
    
    // Validate receiver address format
    if (!validateAddress(receiverAddress, wallet.cryptocurrency)) {
      toast({
        title: "عنوان غير صحيح",
        description: `عنوان ${wallet.cryptocurrency} غير صحيح. يرجى التحقق من العنوان المُدخل`,
        variant: "destructive"
      });
      return;
    }

    try {
      const sendAmount = parseFloat(amount);

      if (sendAmount > wallet.balance) {
        toast({
          title: "رصيد غير كافي",
          description: "الرصيد المتاح غير كافي لإجراء هذه المعاملة",
          variant: "destructive"
        });
        return;
      }

      // Simulate transaction hash
      const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      const gasFee = 0.001; // Mock gas fee

      // Update wallet balance
      const newBalance = wallet.balance - sendAmount - gasFee;
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user?.id,
            wallet_id: wallet.id,
            amount: -sendAmount,
            transaction_type: 'send',
            description: `إرسال ${sendAmount} ${wallet.cryptocurrency} إلى ${receiverAddress.substring(0, 10)}...`,
            status: 'completed',
            transaction_hash: transactionHash,
            network: wallet.cryptocurrency.toLowerCase(),
            gas_fee: gasFee
          }
        ]);

      if (transactionError) throw transactionError;

      setAmount("");
      setReceiverAddress("");
      fetchWallets();
      fetchTransactions();
      
      toast({
        title: "تم إرسال المعاملة",
        description: `تم إرسال ${sendAmount} ${wallet.cryptocurrency} بنجاح`
      });
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast({
        title: "خطأ في المعاملة",
        description: "حدث خطأ أثناء إرسال المعاملة",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ العنوان"
    });
  };

  const getCryptoInfo = (crypto: string) => {
    return SUPPORTED_CRYPTOCURRENCIES.find(c => c.value === crypto) || SUPPORTED_CRYPTOCURRENCIES[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>المحفظة الرقمية — Black & Gold Crypto</title>
        <meta name="description" content="محفظة العملات الرقمية لإدارة وتداول البيتكوين والعملات المشفرة الأخرى." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-2">محفظة العملات الرقمية</h1>
            <p className="text-muted-foreground">إدارة وتداول العملات المشفرة بأمان</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrivateKeys(!showPrivateKeys)}
            >
              {showPrivateKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPrivateKeys ? "إخفاء" : "إظهار"} المفاتيح
            </Button>
          </div>
        </div>

        <Tabs defaultValue="create" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">إنشاء محفظة</TabsTrigger>
            <TabsTrigger value="add-token">إضافة رمز مميز</TabsTrigger>
            <TabsTrigger value="merge">دمج المحافظ</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  إنشاء محفظة متعددة الشبكات
                </CardTitle>
                <CardDescription>محفظة واحدة تدعم جميع الشبكات والعملات الرقمية</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={createMultiNetworkWallet} className="w-full">
                  <WalletIcon className="h-4 w-4 mr-2" />
                  إنشاء محفظة متعددة الشبكات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-token">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  إضافة رمز مميز عبر عقد العملة
                </CardTitle>
                <CardDescription>أضف عملات مخصصة إلى محفظتك باستخدام عنوان العقد</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet-select">اختر المحفظة</Label>
                  <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المحفظة" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.filter(w => w.is_multi_network).map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.wallet_name || `محفظة ${wallet.cryptocurrency}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="network-select">اختر الشبكة</Label>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_NETWORKS.map((network) => (
                        <SelectItem key={network.value} value={network.value}>
                          <div className="flex items-center gap-2">
                            <span className={network.color}>{network.icon}</span>
                            {network.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract-address">عنوان العقد</Label>
                  <Input
                    id="contract-address"
                    placeholder="0x..."
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={addCustomToken} 
                  className="w-full"
                  disabled={isAddingCustomToken}
                >
                  {isAddingCustomToken ? "جاري الإضافة..." : "إضافة رمز مميز"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="merge">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  دمج المحافظ
                </CardTitle>
                <CardDescription>دمج جميع المحافظ في محفظة واحدة متعددة الشبكات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      سيتم دمج {wallets.length} محفظة في محفظة واحدة متعددة الشبكات.
                      سيتم الاحتفاظ بجميع الأرصدة والعملات.
                    </p>
                  </div>
                  <Button 
                    onClick={mergeWallets} 
                    className="w-full"
                    disabled={wallets.length < 2}
                  >
                    دمج المحافظ ({wallets.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* عرض المحافظ */}
        <div className="space-y-6 mb-8">
          {wallets.map((wallet) => {
            const walletTokensList = walletTokens.filter(t => t.wallet_id === wallet.id);
            
            return (
              <Card key={wallet.id} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <WalletIcon className="h-5 w-5" />
                      <div>
                        <CardTitle>{wallet.wallet_name || `محفظة ${wallet.cryptocurrency}`}</CardTitle>
                        <CardDescription>
                          {wallet.is_multi_network ? 'محفظة متعددة الشبكات' : `محفظة ${wallet.cryptocurrency}`}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={wallet.is_active ? "default" : "secondary"}
                      className="w-fit"
                    >
                      {wallet.is_active ? "نشطة" : "معطلة"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {wallet.is_multi_network ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold">العملات والرموز المميزة:</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {walletTokensList.map((token) => {
                          const cryptoInfo = token.cryptocurrency 
                            ? getCryptoInfo(token.cryptocurrency)
                            : { icon: '🪙', color: 'text-gray-500', label: token.custom_token?.symbol || 'Unknown' };
                          
                          return (
                            <div key={token.id} className="bg-muted/30 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={`text-lg ${cryptoInfo.color}`}>{cryptoInfo.icon}</span>
                                  <span className="font-medium">
                                    {token.custom_token?.symbol || token.cryptocurrency}
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {SUPPORTED_NETWORKS.find(n => n.value === token.network)?.label || token.network}
                                </Badge>
                              </div>
                              <p className="text-lg font-bold">
                                {token.balance.toFixed(8)} {token.custom_token?.symbol || token.cryptocurrency}
                              </p>
                              {token.contract_address && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  {token.contract_address.substring(0, 10)}...
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl font-bold">
                        {wallet.balance.toFixed(8)} {wallet.cryptocurrency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ≈ ${(wallet.balance * 50000).toLocaleString()} USD
                      </p>
                    </div>
                  )}

                  {wallet.wallet_address && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">العنوان:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(wallet.wallet_address || "")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="font-mono text-xs break-all bg-muted p-2 rounded">
                        {wallet.wallet_address}
                      </p>
                    </div>
                  )}

                  {showPrivateKeys && wallet.public_key && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">المفتاح العام:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(wallet.public_key || "")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="font-mono text-xs break-all bg-muted p-2 rounded">
                        {wallet.public_key}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="send" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send">إرسال</TabsTrigger>
            <TabsTrigger value="receive">استقبال</TabsTrigger>
            <TabsTrigger value="history">المعاملات</TabsTrigger>
          </TabsList>

          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>إرسال العملة الرقمية</CardTitle>
                <CardDescription>أرسل العملات المشفرة إلى عنوان آخر</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.00000001"
                    placeholder="0.00000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiver">عنوان المستقبل</Label>
                  <Input
                    id="receiver"
                    placeholder="أدخل عنوان المحفظة"
                    value={receiverAddress}
                    onChange={(e) => setReceiverAddress(e.target.value)}
                  />
                </div>
                <Button onClick={sendTransaction} className="w-full">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  إرسال المعاملة
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="receive">
            <Card>
              <CardHeader>
                <CardTitle>استقبال العملة الرقمية</CardTitle>
                <CardDescription>استخدم هذا العنوان لاستقبال العملات المشفرة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {wallets.length > 0 ? (
                  <div className="text-center space-y-6">
                    {/* QR Code */}
                    <div className="flex justify-center">
                      {qrCodeUrl ? (
                        <img 
                          src={qrCodeUrl} 
                          alt="QR Code لعنوان المحفظة" 
                          className="border rounded-lg shadow-sm bg-white p-2"
                        />
                      ) : (
                        <div className="w-48 h-48 border rounded-lg flex items-center justify-center bg-muted">
                          <QrCode className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Wallet Info */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="font-semibold text-lg">محفظة {wallets[0].cryptocurrency}</p>
                        <div className="flex items-center gap-2 max-w-md mx-auto">
                          <Input
                            value={wallets[0].wallet_address || ""}
                            readOnly
                            className="font-mono text-center"
                          />
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(wallets[0].wallet_address || "")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Instructions */}
                      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <p className="font-medium text-sm">تعليمات الاستقبال:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• أرسل فقط {wallets[0].cryptocurrency} إلى هذا العنوان</li>
                          <li>• تأكد من العنوان قبل الإرسال</li>
                          <li>• امسح رمز QR أو انسخ العنوان</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد محافظ متاحة
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>سجل المعاملات</CardTitle>
                <CardDescription>آخر المعاملات في محافظك</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد معاملات حتى الآن
                  </p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{new Date(transaction.created_at).toLocaleDateString('ar-SA')}</span>
                            {transaction.transaction_hash && (
                              <span className="font-mono">
                                {transaction.transaction_hash.substring(0, 10)}...
                              </span>
                            )}
                          </div>
                          {transaction.gas_fee > 0 && (
                            <p className="text-xs text-muted-foreground">
                              رسوم الشبكة: {transaction.gas_fee} {transaction.network?.toUpperCase()}
                            </p>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <p className={`font-medium ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(8)}
                          </p>
                          <Badge variant="outline" className={getStatusColor(transaction.status)}>
                            {transaction.status === 'completed' ? 'مكتملة' : 
                             transaction.status === 'pending' ? 'معلقة' : 'فاشلة'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
};

export default Wallet;