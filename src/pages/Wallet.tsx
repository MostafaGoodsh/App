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

interface Wallet {
  id: string;
  wallet_type: string;
  wallet_address: string | null;
  balance: number;
  cryptocurrency: string;
  is_active: boolean;
  created_at: string;
  public_key?: string;
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

const Wallet = () => {
  const canonical = typeof window !== "undefined" ? window.location.href : "/wallet";
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [cryptoAddresses, setCryptoAddresses] = useState<CryptoAddress[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrivateKeys, setShowPrivateKeys] = useState(false);
  const [newCryptocurrency, setNewCryptocurrency] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");

  useEffect(() => {
    if (user) {
      fetchWallets();
      fetchTransactions();
      fetchCryptoAddresses();
    }
  }, [user]);

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

  const createWallet = async () => {
    try {
      // Generate a mock address for demonstration
      const mockAddress = generateMockAddress(newCryptocurrency);
      
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .insert([
          {
            user_id: user?.id,
            wallet_type: 'crypto',
            wallet_address: mockAddress,
            balance: 0,
            cryptocurrency: newCryptocurrency,
            is_active: true,
            public_key: `pub_${mockAddress.substring(0, 10)}`
          }
        ])
        .select()
        .single();

      if (walletError) throw walletError;

      // Create crypto address entry
      const { error: addressError } = await supabase
        .from('crypto_addresses')
        .insert([
          {
            wallet_id: walletData.id,
            cryptocurrency: newCryptocurrency,
            address: mockAddress,
            label: `المحفظة الرئيسية`,
            is_active: true
          }
        ]);

      if (addressError) throw addressError;
      
      toast({
        title: "تم إنشاء المحفظة",
        description: `تم إنشاء محفظة ${newCryptocurrency} بنجاح`
      });
      
      fetchWallets();
      fetchCryptoAddresses();
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast({
        title: "خطأ في إنشاء المحفظة",
        description: "حدث خطأ أثناء إنشاء المحفظة",
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

  const sendTransaction = async () => {
    if (!amount || !receiverAddress || wallets.length === 0) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال المبلغ وعنوان المستقبل",
        variant: "destructive"
      });
      return;
    }

    try {
      const sendAmount = parseFloat(amount);
      const wallet = wallets[0];

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

        {/* إنشاء محفظة جديدة */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إنشاء محفظة جديدة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="crypto-select">اختر العملة الرقمية</Label>
                <Select value={newCryptocurrency} onValueChange={setNewCryptocurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CRYPTOCURRENCIES.map((crypto) => (
                      <SelectItem key={crypto.value} value={crypto.value}>
                        <div className="flex items-center gap-2">
                          <span className={crypto.color}>{crypto.icon}</span>
                          {crypto.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={createWallet}>إنشاء محفظة</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* عرض المحافظ */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {wallets.map((wallet) => {
            const cryptoInfo = getCryptoInfo(wallet.cryptocurrency);
            return (
              <Card key={wallet.id} className="relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className={`text-2xl ${cryptoInfo.color}`}>{cryptoInfo.icon}</span>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WalletIcon className="h-5 w-5" />
                    {cryptoInfo.label}
                  </CardTitle>
                  <CardDescription>محفظة {wallet.cryptocurrency}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">
                      {wallet.balance.toFixed(8)} {wallet.cryptocurrency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ≈ ${(wallet.balance * 50000).toLocaleString()} USD
                    </p>
                  </div>
                  
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

                  <Badge 
                    variant={wallet.is_active ? "default" : "secondary"}
                    className="w-fit"
                  >
                    {wallet.is_active ? "نشطة" : "معطلة"}
                  </Badge>
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
              <CardContent className="space-y-4">
                {wallets.length > 0 ? (
                  <div className="text-center space-y-4">
                    <QrCode className="h-32 w-32 mx-auto text-muted-foreground" />
                    <div className="space-y-2">
                      <p className="font-semibold">عنوان محفظة {wallets[0].cryptocurrency}</p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={wallets[0].wallet_address || ""}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(wallets[0].wallet_address || "")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      أرسل فقط {wallets[0].cryptocurrency} إلى هذا العنوان
                    </p>
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