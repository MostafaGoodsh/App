import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Wallet {
  id: string;
  balance: number;
  currency: string;
  wallet_type: string;
  wallet_address: string;
  is_active: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  status: string;
  created_at: string;
}

const Wallet = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const canonical = typeof window !== "undefined" ? window.location.href : "/wallet";

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      // جلب بيانات المحافظ
      const { data: walletsData, error: walletsError } = await (supabase as any)
        .from('wallets')
        .select('*')
        .eq('user_id', user?.id);

      if (walletsError) throw walletsError;

      // إنشاء محفظة افتراضية إذا لم توجد
      if (!walletsData || walletsData.length === 0) {
        await createDefaultWallet();
      } else {
        setWallets(walletsData);
      }

      // جلب المعاملات
      const { data: transactionsData, error: transactionsError } = await (supabase as any)
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('حدث خطأ في جلب بيانات المحفظة');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultWallet = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('wallets')
        .insert({
          user_id: user?.id,
          balance: 1000,
          currency: 'SAR',
          wallet_type: 'digital',
          wallet_address: `wallet_${user?.id?.substring(0, 8)}`,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setWallets([data]);
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };

  const handleDeposit = async () => {
    if (!amount || !wallets[0]) return;

    try {
      const depositAmount = parseFloat(amount);
      const newBalance = wallets[0].balance + depositAmount;

      // تحديث الرصيد
      const { error: walletError } = await (supabase as any)
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallets[0].id);

      if (walletError) throw walletError;

      // إضافة معاملة
      const { error: transactionError } = await (supabase as any)
        .from('transactions')
        .insert({
          user_id: user?.id,
          wallet_id: wallets[0].id,
          amount: depositAmount,
          transaction_type: 'deposit',
          description: 'إيداع في المحفظة',
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      setAmount('');
      fetchWalletData();
      toast.success('تم الإيداع بنجاح');
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast.error('حدث خطأ في عملية الإيداع');
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !wallets[0]) return;

    try {
      const withdrawAmount = parseFloat(amount);
      
      if (withdrawAmount > wallets[0].balance) {
        toast.error('الرصيد غير كافي');
        return;
      }

      const newBalance = wallets[0].balance - withdrawAmount;

      // تحديث الرصيد
      const { error: walletError } = await (supabase as any)
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallets[0].id);

      if (walletError) throw walletError;

      // إضافة معاملة
      const { error: transactionError } = await (supabase as any)
        .from('transactions')
        .insert({
          user_id: user?.id,
          wallet_id: wallets[0].id,
          amount: -withdrawAmount,
          transaction_type: 'withdraw',
          description: 'سحب من المحفظة',
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      setAmount('');
      fetchWalletData();
      toast.success('تم السحب بنجاح');
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error('حدث خطأ في عملية السحب');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      case 'pending': return 'bg-accent/10 text-accent border-accent/20';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-500';
      case 'withdraw': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>المحفظة — إدارة الأصول الرقمية</title>
        <meta name="description" content="المحفظة (Wallet) لإدارة الأصول الرقمية بتصميم أسود وذهبي." />
        <link rel="canonical" href={canonical} />
      </Helmet>
      
      <section className="container mx-auto px-4 py-16">
        <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-6">المحفظة</h1>
        <p className="text-muted-foreground max-w-2xl mb-8">
          إدارة أصولك الرقمية بكل سهولة وأمان.
        </p>

        {/* عرض الرصيد الحالي */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>الرصيد الحالي</span>
                <Badge variant="outline" className="bg-primary/10 text-primary">نشط</Badge>
              </CardTitle>
              <CardDescription>محفظتك الرقمية الرئيسية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {wallets[0]?.balance?.toLocaleString('ar-SA') || '0'} {wallets[0]?.currency || 'SAR'}
              </div>
              <p className="text-sm text-muted-foreground">
                عنوان المحفظة: {wallets[0]?.wallet_address || 'غير محدد'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إحصائيات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">إجمالي المعاملات</span>
                <span className="font-medium">{transactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">نوع المحفظة</span>
                <span className="font-medium">
                  {wallets[0]?.wallet_type === 'digital' ? 'رقمية' : 'فيزيائية'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الحالة</span>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {wallets[0]?.is_active ? 'نشطة' : 'معطلة'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="operations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="operations">العمليات</TabsTrigger>
            <TabsTrigger value="history">سجل المعاملات</TabsTrigger>
          </TabsList>

          <TabsContent value="operations">
            <Card>
              <CardHeader>
                <CardTitle>العمليات المالية</CardTitle>
                <CardDescription>إيداع أو سحب الأموال من محفظتك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ ({wallets[0]?.currency || 'SAR'})</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="أدخل المبلغ"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleDeposit} className="flex-1">إيداع</Button>
                  <Button onClick={handleWithdraw} variant="outline" className="flex-1">سحب</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>سجل المعاملات</CardTitle>
                <CardDescription>آخر 10 معاملات في محفظتك</CardDescription>
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
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className={`font-medium ${getTypeColor(transaction.transaction_type)}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('ar-SA')} SAR
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
