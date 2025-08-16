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
import { Wallet as WalletIcon, Plus, ArrowUpDown, Copy, Eye, EyeOff, Bitcoin, Coins, QrCode, Merge, Network } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  is_multi_network: boolean;
  wallet_name: string;
  networks: string[];
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
  token?: CustomToken;
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

const SUPPORTED_CRYPTOCURRENCIES = [
  { value: 'BTC', label: 'Bitcoin (BTC)', icon: '₿', color: 'text-orange-500' },
  { value: 'ETH', label: 'Ethereum (ETH)', icon: 'Ξ', color: 'text-blue-500' },
  { value: 'USDT', label: 'Tether (USDT)', icon: '₮', color: 'text-green-500' },
  { value: 'BNB', label: 'Binance Coin (BNB)', icon: 'BNB', color: 'text-yellow-500' },
  { value: 'ADA', label: 'Cardano (ADA)', icon: 'ADA', color: 'text-blue-400' },
  { value: 'DOT', label: 'Polkadot (DOT)', icon: 'DOT', color: 'text-pink-500' },
  { value: 'SOL', label: 'Solana (SOL)', icon: '◎', color: 'text-purple-500' }
];

const SUPPORTED_NETWORKS = [
  { value: 'bitcoin', label: 'Bitcoin', color: 'text-orange-500' },
  { value: 'ethereum', label: 'Ethereum', color: 'text-blue-500' },
  { value: 'binance', label: 'Binance Smart Chain', color: 'text-yellow-500' },
  { value: 'polygon', label: 'Polygon', color: 'text-purple-500' },
  { value: 'solana', label: 'Solana', color: 'text-purple-400' },
  { value: 'cardano', label: 'Cardano', color: 'text-blue-400' }
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
  
  // Multi-network wallet states
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>(['bitcoin']);
  const [walletName, setWalletName] = useState("المحفظة الرئيسية");
  
  // Custom token states
  const [contractAddress, setContractAddress] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [isAddTokenOpen, setIsAddTokenOpen] = useState(false);
  
  // Transaction states
  const [amount, setAmount] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [selectedToken, setSelectedToken] = useState<WalletToken | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchWallets();
      fetchTransactions();
      fetchCryptoAddresses();
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
      
      // Fetch wallet tokens for each wallet
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
      // Create the multi-network wallet
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .insert([
          {
            user_id: user?.id,
            wallet_type: 'crypto',
            wallet_address: generateMockAddress('ETH'), // Primary address
            balance: 0,
            cryptocurrency: 'ETH', // Primary cryptocurrency
            is_active: true,
            is_multi_network: true,
            wallet_name: walletName,
            networks: selectedNetworks,
            public_key: `pub_multi_${Date.now()}`
          }
        ])
        .select()
        .single();

      if (walletError) throw walletError;

      // Create wallet tokens for each selected network
      const walletTokensToInsert = selectedNetworks.map(network => {
        const crypto = getCryptoForNetwork(network);
        return {
          wallet_id: walletData.id,
          cryptocurrency: crypto,
          network: network,
          balance: 0,
          is_active: true
        };
      });

      const { error: tokensError } = await supabase
        .from('wallet_tokens')
        .insert(walletTokensToInsert);

      if (tokensError) throw tokensError;

      // Create crypto addresses for each network
      const addressesToInsert = selectedNetworks.map(network => {
        const crypto = getCryptoForNetwork(network);
        return {
          wallet_id: walletData.id,
          cryptocurrency: crypto,
          address: generateMockAddress(crypto),
          label: `عنوان ${network}`,
          is_active: true
        };
      });

      const { error: addressError } = await supabase
        .from('crypto_addresses')
        .insert(addressesToInsert);

      if (addressError) throw addressError;
      
      toast({
        title: "تم إنشاء المحفظة متعددة الشبكات",
        description: `تم إنشاء محفظة "${walletName}" بنجاح لشبكات ${selectedNetworks.length}`
      });
      
      fetchWallets();
      fetchCryptoAddresses();
      
      // Reset form
      setWalletName("المحفظة الرئيسية");
      setSelectedNetworks(['bitcoin']);
    } catch (error) {
      console.error('Error creating multi-network wallet:', error);
      toast({
        title: "خطأ في إنشاء المحفظة",
        description: "حدث خطأ أثناء إنشاء المحفظة متعددة الشبكات",
        variant: "destructive"
      });
    }
  };

  const addCustomToken = async () => {
    if (!contractAddress || !tokenName || !tokenSymbol) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال جميع بيانات العملة",
        variant: "destructive"
      });
      return;
    }

    try {
      // First, add the custom token to the database
      const { data: tokenData, error: tokenError } = await supabase
        .from('custom_tokens')
        .insert([
          {
            contract_address: contractAddress,
            name: tokenName,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            network: selectedNetwork,
            is_verified: false
          }
        ])
        .select()
        .single();

      if (tokenError) throw tokenError;

      // Add token to the user's multi-network wallet
      const multiNetworkWallet = wallets.find(w => w.is_multi_network);
      if (multiNetworkWallet) {
        const { error: walletTokenError } = await supabase
          .from('wallet_tokens')
          .insert([
            {
              wallet_id: multiNetworkWallet.id,
              token_id: tokenData.id,
              contract_address: contractAddress,
              network: selectedNetwork,
              balance: 0,
              is_active: true
            }
          ]);

        if (walletTokenError) throw walletTokenError;
      }

      toast({
        title: "تم إضافة العملة",
        description: `تم إضافة ${tokenSymbol} (${tokenName}) بنجاح`
      });

      // Reset form and close dialog
      setContractAddress("");
      setTokenName("");
      setTokenSymbol("");
      setTokenDecimals(18);
      setIsAddTokenOpen(false);
      
      fetchWallets();
      fetchCustomTokens();
    } catch (error: any) {
      console.error('Error adding custom token:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        toast({
          title: "عملة موجودة",
          description: "هذه العملة موجودة بالفعل في هذه الشبكة",
          variant: "destructive"
        });
      } else {
        toast({
          title: "خطأ في إضافة العملة",
          description: "حدث خطأ أثناء إضافة العملة المخصصة",
          variant: "destructive"
        });
      }
    }
  };

  const mergeWallets = async () => {
    try {
      const singleNetworkWallets = wallets.filter(w => !w.is_multi_network);
      
      if (singleNetworkWallets.length === 0) {
        toast({
          title: "لا توجد محافظ للدمج",
          description: "جميع محافظك هي محافظ متعددة الشبكات بالفعل",
          variant: "destructive"
        });
        return;
      }

      // Create or get multi-network wallet
      let multiNetworkWallet = wallets.find(w => w.is_multi_network);
      
      if (!multiNetworkWallet) {
        // Create new multi-network wallet
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .insert([
            {
              user_id: user?.id,
              wallet_type: 'crypto',
              wallet_address: generateMockAddress('ETH'),
              balance: 0,
              cryptocurrency: 'ETH',
              is_active: true,
              is_multi_network: true,
              wallet_name: "المحفظة الموحدة",
              networks: singleNetworkWallets.map(w => getCryptoNetworkMapping(w.cryptocurrency)),
              public_key: `pub_merged_${Date.now()}`
            }
          ])
          .select()
          .single();

        if (walletError) throw walletError;
        multiNetworkWallet = walletData;
      }

      // Transfer tokens from single wallets to multi-network wallet
      const tokensToInsert = singleNetworkWallets.map(wallet => ({
        wallet_id: multiNetworkWallet!.id,
        cryptocurrency: wallet.cryptocurrency,
        network: getCryptoNetworkMapping(wallet.cryptocurrency),
        balance: wallet.balance,
        is_active: true
      }));

      const { error: tokensError } = await supabase
        .from('wallet_tokens')
        .insert(tokensToInsert);

      if (tokensError) throw tokensError;

      // Deactivate old wallets
      const { error: deactivateError } = await supabase
        .from('wallets')
        .update({ is_active: false })
        .in('id', singleNetworkWallets.map(w => w.id));

      if (deactivateError) throw deactivateError;

      toast({
        title: "تم دمج المحافظ",
        description: `تم دمج ${singleNetworkWallets.length} محفظة في المحفظة الموحدة`
      });

      fetchWallets();
    } catch (error) {
      console.error('Error merging wallets:', error);
      toast({
        title: "خطأ في دمج المحافظ",
        description: "حدث خطأ أثناء دمج المحافظ",
        variant: "destructive"
      });
    }
  };

  const getCryptoForNetwork = (network: string): string => {
    const mapping: { [key: string]: string } = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binance': 'BNB',
      'polygon': 'MATIC',
      'solana': 'SOL',
      'cardano': 'ADA'
    };
    return mapping[network] || 'ETH';
  };

  const getCryptoNetworkMapping = (crypto: string): string => {
    const mapping: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binance',
      'MATIC': 'polygon',
      'SOL': 'solana',
      'ADA': 'cardano'
    };
    return mapping[crypto] || 'ethereum';
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
      'SOL': /^[1-9A-HJ-NP-Za-km-z]{44}$/ // Base58 encoded, exactly 44 characters
    };
    
    const pattern = patterns[crypto];
    return pattern ? pattern.test(address) : true;
  };

  const sendTransaction = async () => {
    if (!amount || !receiverAddress || !selectedToken) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال المبلغ وعنوان المستقبل واختيار العملة",
        variant: "destructive"
      });
      return;
    }

    const crypto = selectedToken.cryptocurrency || selectedToken.token?.symbol || 'ETH';
    
    if (!validateAddress(receiverAddress, crypto)) {
      toast({
        title: "عنوان غير صحيح",
        description: `عنوان ${crypto} غير صحيح. يرجى التحقق من العنوان المُدخل`,
        variant: "destructive"
      });
      return;
    }

    try {
      const sendAmount = parseFloat(amount);

      if (sendAmount > selectedToken.balance) {
        toast({
          title: "رصيد غير كافي",
          description: "الرصيد المتاح غير كافي لإجراء هذه المعاملة",
          variant: "destructive"
        });
        return;
      }

      const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      const gasFee = 0.001;

      // Update wallet token balance
      const newBalance = selectedToken.balance - sendAmount;
      const { error: tokenError } = await supabase
        .from('wallet_tokens')
        .update({ balance: newBalance })
        .eq('id', selectedToken.id);

      if (tokenError) throw tokenError;

      // Find wallet
      const wallet = wallets.find(w => w.id === selectedToken.wallet_id);
      if (wallet) {
        // Create transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: user?.id,
              wallet_id: wallet.id,
              amount: -sendAmount,
              transaction_type: 'send',
              description: `إرسال ${sendAmount} ${crypto} إلى ${receiverAddress.substring(0, 10)}...`,
              status: 'completed',
              transaction_hash: transactionHash,
              network: selectedToken.network,
              gas_fee: gasFee
            }
          ]);

        if (transactionError) throw transactionError;
      }

      setAmount("");
      setReceiverAddress("");
      setSelectedToken(null);
      fetchWallets();
      fetchTransactions();
      
      toast({
        title: "تم إرسال المعاملة",
        description: `تم إرسال ${sendAmount} ${crypto} بنجاح`
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

  const getNetworkInfo = (network: string) => {
    return SUPPORTED_NETWORKS.find(n => n.value === network) || SUPPORTED_NETWORKS[0];
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
        <title>المحفظة الرقمية متعددة الشبكات — Black & Gold Crypto</title>
        <meta name="description" content="محفظة العملات الرقمية متعددة الشبكات لإدارة وتداول البيتكوين والعملات المشفرة والعملات المخصصة." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-2">محفظة العملات الرقمية</h1>
            <p className="text-muted-foreground">محفظة موحدة متعددة الشبكات لجميع عملاتك المشفرة</p>
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

        {/* إنشاء محفظة متعددة الشبكات */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              إنشاء محفظة متعددة الشبكات
            </CardTitle>
            <CardDescription>محفظة واحدة تدعم عدة شبكات وعملات مشفرة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wallet-name">اسم المحفظة</Label>
                <Input
                  id="wallet-name"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="المحفظة الرئيسية"
                />
              </div>
              <div className="space-y-2">
                <Label>الشبكات المدعومة</Label>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_NETWORKS.map((network) => (
                    <div key={network.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={network.value}
                        checked={selectedNetworks.includes(network.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNetworks([...selectedNetworks, network.value]);
                          } else {
                            setSelectedNetworks(selectedNetworks.filter(n => n !== network.value));
                          }
                        }}
                        className="mr-2"
                      />
                      <Label htmlFor={network.value} className={`text-sm ${network.color}`}>
                        {network.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createMultiNetworkWallet} disabled={selectedNetworks.length === 0}>
                <Network className="h-4 w-4 mr-2" />
                إنشاء محفظة متعددة الشبكات
              </Button>
              {wallets.filter(w => !w.is_multi_network).length > 0 && (
                <Button variant="outline" onClick={mergeWallets}>
                  <Merge className="h-4 w-4 mr-2" />
                  دمج المحافظ الموجودة
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* إضافة عملة مخصصة */}
        <Dialog open={isAddTokenOpen} onOpenChange={setIsAddTokenOpen}>
          <DialogTrigger asChild>
            <Card className="mb-6 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="font-semibold">إضافة عملة مخصصة</h3>
                  <p className="text-sm text-muted-foreground">أضف عملة باستخدام عنوان العقد</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة عملة مخصصة</DialogTitle>
              <DialogDescription>
                أدخل عنوان العقد لإضافة عملة مخصصة إلى محفظتك
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract-address">عنوان العقد</Label>
                <Input
                  id="contract-address"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="token-name">اسم العملة</Label>
                  <Input
                    id="token-name"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="Tether USD"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-symbol">رمز العملة</Label>
                  <Input
                    id="token-symbol"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    placeholder="USDT"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="network-select">الشبكة</Label>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_NETWORKS.map((network) => (
                        <SelectItem key={network.value} value={network.value}>
                          <span className={network.color}>{network.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-decimals">الخانات العشرية</Label>
                  <Input
                    id="token-decimals"
                    type="number"
                    value={tokenDecimals}
                    onChange={(e) => setTokenDecimals(parseInt(e.target.value) || 18)}
                    placeholder="18"
                  />
                </div>
              </div>
              <Button onClick={addCustomToken} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                إضافة العملة
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* عرض المحافظ والعملات */}
        <div className="grid gap-6 mb-8">
          {wallets.filter(w => w.is_active).map((wallet) => {
            const tokens = walletTokens.filter(t => t.wallet_id === wallet.id && t.is_active);
            const totalBalance = tokens.reduce((sum, token) => sum + token.balance, 0);
            
            return (
              <Card key={wallet.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <WalletIcon className="h-5 w-5" />
                      <div>
                        <CardTitle>{wallet.wallet_name}</CardTitle>
                        <CardDescription>
                          {wallet.is_multi_network ? 'محفظة متعددة الشبكات' : `محفظة ${wallet.cryptocurrency}`}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={wallet.is_multi_network ? "default" : "secondary"}>
                      {wallet.is_multi_network ? (
                        <><Network className="h-3 w-3 mr-1" /> متعددة الشبكات</>
                      ) : (
                        wallet.cryptocurrency
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* إجمالي الرصيد */}
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">إجمالي الرصيد</p>
                    <p className="text-2xl font-bold">
                      ≈ ${(totalBalance * 50000).toLocaleString()} USD
                    </p>
                  </div>

                  {/* العملات والأرصدة */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">العملات المحفوظة</h4>
                    {tokens.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        لا توجد عملات في هذه المحفظة
                      </p>
                    ) : (
                      <div className="grid gap-3">
                        {tokens.map((token) => {
                          const cryptoInfo = token.cryptocurrency ? 
                            getCryptoInfo(token.cryptocurrency) : null;
                          const networkInfo = getNetworkInfo(token.network);
                          const displayName = token.token?.name || token.cryptocurrency || 'Unknown';
                          const displaySymbol = token.token?.symbol || token.cryptocurrency || '?';
                          
                          return (
                            <div key={token.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="text-lg">
                                  {cryptoInfo?.icon || '🪙'}
                                </div>
                                <div>
                                  <p className="font-medium">{displayName}</p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <span className={networkInfo.color}>{networkInfo.label}</span>
                                    {token.contract_address && (
                                      <span className="font-mono text-xs">
                                        {token.contract_address.substring(0, 6)}...{token.contract_address.substring(-4)}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {token.balance.toFixed(6)} {displaySymbol}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  ≈ ${(token.balance * 50000).toLocaleString()} USD
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* عنوان المحفظة */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">العنوان الرئيسي:</span>
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

        {/* معاملات وإرسال/استقبال */}
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
                <CardDescription>أرسل العملات المشفرة أو العملات المخصصة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>اختر العملة</Label>
                  <Select 
                    value={selectedToken?.id || ""} 
                    onValueChange={(value) => {
                      const token = walletTokens.find(t => t.id === value);
                      setSelectedToken(token || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العملة المراد إرسالها" />
                    </SelectTrigger>
                    <SelectContent>
                      {walletTokens.filter(t => t.is_active && t.balance > 0).map((token) => {
                        const displayName = token.token?.name || token.cryptocurrency || 'Unknown';
                        const displaySymbol = token.token?.symbol || token.cryptocurrency || '?';
                        const networkInfo = getNetworkInfo(token.network);
                        
                        return (
                          <SelectItem key={token.id} value={token.id}>
                            <div className="flex items-center gap-2">
                              <span>{displaySymbol}</span>
                              <span>({token.balance.toFixed(6)})</span>
                              <span className={`text-xs ${networkInfo.color}`}>
                                {networkInfo.label}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.000001"
                    placeholder="0.000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {selectedToken && (
                    <p className="text-sm text-muted-foreground">
                      الرصيد المتاح: {selectedToken.balance.toFixed(6)} {selectedToken.token?.symbol || selectedToken.cryptocurrency}
                    </p>
                  )}
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
                
                <Button 
                  onClick={sendTransaction} 
                  className="w-full"
                  disabled={!selectedToken}
                >
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
                <CardDescription>استخدم هذه العناوين لاستقبال العملات المشفرة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {wallets.filter(w => w.is_active).length > 0 ? (
                  <div className="space-y-6">
                    {/* QR Code للمحفظة الرئيسية */}
                    <div className="text-center space-y-4">
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
                      
                      <div className="space-y-2">
                        <p className="font-semibold">العنوان الرئيسي</p>
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
                    </div>

                    {/* عناوين الشبكات المختلفة */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">عناوين الشبكات</h4>
                      <div className="grid gap-3">
                        {cryptoAddresses.map((address) => {
                          const networkInfo = getNetworkInfo(getCryptoNetworkMapping(address.cryptocurrency));
                          
                          return (
                            <div key={address.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div>
                                <p className="font-medium">{address.label || address.cryptocurrency}</p>
                                <p className={`text-sm ${networkInfo.color}`}>
                                  {networkInfo.label}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={address.address}
                                  readOnly
                                  className="font-mono text-xs w-64"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(address.address)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* تعليمات الاستقبال */}
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <p className="font-medium text-sm">تعليمات الاستقبال:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• أرسل العملات فقط إلى العنوان المطابق للشبكة</li>
                        <li>• تأكد من الشبكة والعنوان قبل الإرسال</li>
                        <li>• امسح رمز QR أو انسخ العنوان المطلوب</li>
                        <li>• العملات المخصصة تستخدم عنوان شبكة Ethereum</li>
                      </ul>
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
                <CardDescription>آخر المعاملات في محافظك متعددة الشبكات</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد معاملات حتى الآن
                  </p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => {
                      const networkInfo = getNetworkInfo(transaction.network);
                      
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{new Date(transaction.created_at).toLocaleDateString('ar-SA')}</span>
                              <span className={networkInfo.color}>
                                {networkInfo.label}
                              </span>
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
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(6)}
                            </p>
                            <Badge variant="outline" className={getStatusColor(transaction.status)}>
                              {transaction.status === 'completed' ? 'مكتملة' : 
                               transaction.status === 'pending' ? 'معلقة' : 'فاشلة'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
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