import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePayment } from '@/hooks/usePayment';
import { useInternalWallet } from '@/hooks/useInternalWallet';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowRight, Wallet, TrendingUp, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CryptoPaymentInstructions from '@/components/payment/CryptoPaymentInstructions';

const Recharge = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { processPayment, checkPaymentStatus, loading, getSupportedMethods, transactions, getTransactions } = usePayment();
  const { tokens, refreshData } = useInternalWallet();
  
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [paymentCallback, setPaymentCallback] = useState<{
    show: boolean;
    transactionId: string | null;
    status: 'checking' | 'completed' | 'failed' | 'pending';
  }>({ show: false, transactionId: null, status: 'checking' });

  const paymentMethods = getSupportedMethods();
  const quickAmounts = [50, 100, 200, 500, 1000];

  // Handle payment callback from Paymob redirect
  useEffect(() => {
    const isCallback = searchParams.get('payment_callback');
    const transactionId = searchParams.get('transaction_id');
    
    if (isCallback && transactionId) {
      setPaymentCallback({ show: true, transactionId, status: 'checking' });
      
      // Check payment status
      const checkStatus = async () => {
        try {
          const result = await checkPaymentStatus(transactionId);
          if (result.status === 'completed') {
            setPaymentCallback(prev => ({ ...prev, status: 'completed' }));
            toast({
              title: "✅ تم الدفع بنجاح | Payment Successful",
              description: "تم إضافة الرصيد لحسابك",
            });
            await refreshData();
          } else if (result.status === 'failed') {
            setPaymentCallback(prev => ({ ...prev, status: 'failed' }));
          } else {
            setPaymentCallback(prev => ({ ...prev, status: 'pending' }));
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          setPaymentCallback(prev => ({ ...prev, status: 'pending' }));
        }
      };
      
      checkStatus();
      
      // Clean URL params
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, checkPaymentStatus, toast, refreshData]);

  useEffect(() => {
    // Don't redirect until auth loading is complete
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
    } else {
      getTransactions();
    }
  }, [user, authLoading, navigate, getTransactions]);

  useEffect(() => {
    if (tokens.length > 0 && !selectedToken) {
      // تحديد XP تلقائياً
      const xpToken = tokens.find(t => t.symbol === 'XP');
      if (xpToken) {
        setSelectedToken(xpToken.symbol);
      } else if (tokens[0]) {
        setSelectedToken(tokens[0].symbol);
      }
    }
  }, [tokens, selectedToken]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>جاري التحميل... | Loading...</p>
      </div>
    );
  }

  // Show payment callback result
  if (paymentCallback.show) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md" dir="rtl">
        <Card className="text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            {paymentCallback.status === 'checking' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <h2 className="text-xl font-bold">جاري التحقق من الدفع...</h2>
                <p className="text-sm text-muted-foreground">Checking payment status...</p>
              </>
            )}
            {paymentCallback.status === 'completed' && (
              <>
                <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
                <h2 className="text-xl font-bold text-green-600">تم الدفع بنجاح!</h2>
                <p className="text-sm text-muted-foreground">Payment completed successfully!</p>
                <p className="text-sm">تم إضافة الرصيد لحسابك</p>
              </>
            )}
            {paymentCallback.status === 'failed' && (
              <>
                <XCircle className="h-16 w-16 mx-auto text-destructive" />
                <h2 className="text-xl font-bold text-destructive">فشل الدفع</h2>
                <p className="text-sm text-muted-foreground">Payment failed</p>
                <p className="text-sm">الرجاء المحاولة مرة أخرى</p>
              </>
            )}
            {paymentCallback.status === 'pending' && (
              <>
                <Clock className="h-16 w-16 mx-auto text-yellow-500" />
                <h2 className="text-xl font-bold text-yellow-600">قيد المعالجة</h2>
                <p className="text-sm text-muted-foreground">Payment is being processed...</p>
                <p className="text-sm">سيتم إضافة الرصيد عند اكتمال المعاملة</p>
              </>
            )}
            <Button 
              onClick={() => {
                setPaymentCallback({ show: false, transactionId: null, status: 'checking' });
                getTransactions();
              }} 
              className="mt-4"
            >
              العودة للشحن | Back to Recharge
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال مبلغ صحيح",
        variant: "destructive"
      });
      return;
    }

    if (!selectedMethod) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار طريقة دفع",
        variant: "destructive"
      });
      return;
    }

    if (!selectedToken) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار العملة",
        variant: "destructive"
      });
      return;
    }

    if ((selectedMethod === 'vodafone_cash' || selectedMethod === 'orange_cash' || selectedMethod === 'etisalat_cash') && !phoneNumber) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم المحفظة",
        variant: "destructive"
      });
      return;
    }

    // Crypto payment - handled client-side, no Paymob needed
    if (selectedMethod === 'crypto') {
      toast({
        title: "💰 الدفع بالكريبتو | Crypto Payment",
        description: `المبلغ: ${amount} EGP — قم بتحويل المبلغ المعادل إلى عنوان المحفظة ثم تواصل مع الدعم لتأكيد التحويل`,
      });
      return;
    }

    try {
      // Format phone number with country code
      let formattedPhone = phoneNumber;
      if (phoneNumber && !phoneNumber.startsWith('+')) {
        // Remove leading zero if exists and add +20
        formattedPhone = '+20' + phoneNumber.replace(/^0+/, '');
      }

      const result = await processPayment({
        amount: parseFloat(amount),
        payment_method: selectedMethod as 'vodafone_cash' | 'orange_cash' | 'etisalat_cash' | 'fawry' | 'card',
        phone_number: formattedPhone || undefined,
        internal_token_symbol: selectedToken
      });

      if (result.payment_url) {
        // Open payment URL in new window
        window.open(result.payment_url, '_blank');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
    }
  };

  // EGP to USD conversion rate (approximate)
  // NOTE: في الإنتاج يجب جلب السعر الحقيقي من API أو DB
  const EGP_TO_USD_RATE = 0.02; // 1 EGP ≈ 0.02 USD (50 EGP = 1 USD)

  const selectedTokenData = tokens.find(t => t.symbol === selectedToken);
  
  // Calculate: EGP → USD → XP
  const estimatedTokens = selectedTokenData && amount 
    ? Math.floor((parseFloat(amount) * EGP_TO_USD_RATE) / selectedTokenData.exchange_rate_usd).toString()
    : '0';
  
  // معدل التحويل المباشر (XP لكل EGP)
  const xpPerEgp = selectedTokenData 
    ? Math.floor(EGP_TO_USD_RATE / selectedTokenData.exchange_rate_usd) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir="rtl">
        {/* معلومات النظام الموحد */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              نظام XP الموحد - بسيط وسريع!
            </CardTitle>
            <CardDescription>كل شيء الآن بنقاط XP واحدة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-background rounded-lg">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-sm font-medium">المهام اليومية</div>
                <div className="text-xs text-muted-foreground">اكسب XP</div>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <div className="text-2xl mb-1">⛏️</div>
                <div className="text-sm font-medium">التعدين</div>
                <div className="text-xs text-muted-foreground">احصل على XP</div>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <div className="text-2xl mb-1">💳</div>
                <div className="text-sm font-medium">الشحن</div>
                <div className="text-xs text-muted-foreground">اشتري XP</div>
              </div>
            </div>
            <div className="text-center text-sm text-primary font-medium mt-3 p-2 bg-primary/5 rounded">
              💡 كل النقاط موحدة - لا حاجة للتحويل بين العملات!
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            شحن نقاط XP
          </h1>
          <p className="text-muted-foreground">
            اشحن نقاط XP باستخدام طرق الدفع المحلية المصرية
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>تفاصيل الشحن</CardTitle>
              <CardDescription>اختر المبلغ وطريقة الدفع</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Token Selection - XP Only */}
                <div className="space-y-2">
                  <Label htmlFor="token">نقاط XP - العملة الموحدة</Label>
                  <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
                          XP
                        </div>
                        <div>
                          <div className="font-medium">نقاط الخبرة</div>
                          <div className="text-xs text-muted-foreground">العملة الموحدة للمنصة</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-primary">
                        محددة تلقائياً
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ (جنيه مصري)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="أدخل المبلغ"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="0.01"
                  />
                  <div className="flex gap-2 flex-wrap mt-2">
                    {quickAmounts.map((qa) => (
                      <Button
                        key={qa}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(qa.toString())}
                      >
                        {qa} ج.م
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label>طريقة الدفع ({paymentMethods.length} طريقة متاحة)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          console.log('Selected method:', method.id);
                          setSelectedMethod(method.id);
                        }}
                        className={`relative h-24 rounded-lg border-2 transition-all overflow-hidden ${
                          selectedMethod === method.id
                            ? 'border-primary shadow-lg scale-105'
                            : 'border-border hover:border-primary/50 hover:shadow'
                        }`}
                      >
                        <img 
                          src={method.bgImage} 
                          alt={method.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {selectedMethod === method.id && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {paymentMethods.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      لا توجد طرق دفع متاحة
                    </div>
                  )}
                </div>

                {/* Phone Number (for mobile wallets) */}
                {(selectedMethod === 'vodafone_cash' || 
                  selectedMethod === 'orange_cash' || 
                  selectedMethod === 'etisalat_cash') && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم المحفظة</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      dir="ltr"
                    />
                    <p className="text-xs text-muted-foreground">
                      ⚠️ <strong>مهم جداً:</strong> الرقم لازم يكون مسجل ومفعل في المحفظة الإلكترونية
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      💡 لو الرقم مش مسجل، استخدم بطاقة ائتمان بدلاً من المحفظة
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      متابعة للدفع
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">ملخص العملية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">المبلغ</span>
                  <span className="font-bold">{amount || '0'} ج.م</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">العملة</span>
                  <span className="font-medium flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-sm font-bold">XP</span>
                    نقاط الخبرة
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">ستحصل على</span>
                  </div>
                  <div className="text-2xl font-bold mt-2 text-primary">
                    {estimatedTokens} XP
                  </div>
                  {selectedTokenData && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {xpPerEgp} XP لكل جنيه (تقريباً)
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Help Card */}
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  ℹ️ معلومات مهمة
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3">
                <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                  <p className="font-bold text-amber-700 dark:text-amber-300 mb-2">🧪 وضع الاختبار - Test Mode</p>
                  <p className="font-semibold mb-1">استخدم بطاقة الاختبار هذه:</p>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                    <p className="font-mono font-bold">4987 6543 2109 8769</p>
                  </div>
                  <p className="mt-2">CVV: أي 3 أرقام (مثل 123)</p>
                  <p>التاريخ: أي تاريخ مستقبلي</p>
                  
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                    <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">📝 صفحة ACS Emulator:</p>
                    <p className="text-sm">لو ظهرتلك صفحة "ACS Emulator" بعد إدخال البطاقة:</p>
                    <ul className="text-sm list-disc list-inside mt-1 space-y-1">
                      <li>Custom ECI: اتركه <strong>فارغ</strong> أو اكتب "05"</li>
                      <li>Custom CAVV: اكتب أي رقم زي "123"</li>
                      <li>اضغط Submit لإتمام العملية</li>
                    </ul>
                  </div>
                  
                  <p className="text-red-600 dark:text-red-400 font-semibold mt-2">⚠️ لا تستخدم بطاقة حقيقية!</p>
                </div>
                
                <div className="space-y-1">
                  <p>• <strong>للمحافظ الإلكترونية:</strong> الرقم لازم يكون مسجل ومفعل في المحفظة</p>
                  <p>• لا تحاول أكثر من 3 مرات - الجلسة تنتهي تلقائياً</p>
                  <p>• إذا فشل الدفع، ابدأ عملية جديدة من الأعلى</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">آخر العمليات</CardTitle>
                      <CardDescription className="text-xs">
                        💡 تتحدث الحالة تلقائياً عند اكتمال/فشل الدفع
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        setRefreshing(true);
                        await getTransactions();
                        setRefreshing(false);
                      }}
                      disabled={refreshing}
                    >
                      {refreshing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                     {transactions.slice(0, 3).map((tx) => {
                       const isOld = new Date().getTime() - new Date(tx.created_at).getTime() > 10 * 60 * 1000; // أكثر من 10 دقائق
                       const isProcessing = tx.status === 'processing';
                       
                       return (
                         <div key={tx.id} className="space-y-2 p-3 rounded-lg border">
                           <div className="flex justify-between items-center text-sm">
                             <div>
                               <div className="font-medium">{tx.amount} ج.م</div>
                               <div className="text-xs text-muted-foreground">
                                 {new Date(tx.created_at).toLocaleDateString('ar-EG', {
                                   day: 'numeric',
                                   month: 'short',
                                   hour: '2-digit',
                                   minute: '2-digit'
                                 })}
                               </div>
                             </div>
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                tx.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                tx.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {tx.status === 'completed' ? '✓ مكتمل' :
                                 tx.status === 'pending' ? '⏳ معلق' :
                                 tx.status === 'processing' ? '🔄 قيد المعالجة' :
                                 '✗ فشل'}
                              </div>
                            </div>
                            
                            {tx.status === 'processing' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs mt-2"
                                onClick={() => checkPaymentStatus(tx.id)}
                              >
                                🔍 تحقق وأضف النقاط
                              </Button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
  );
};

export default Recharge;
