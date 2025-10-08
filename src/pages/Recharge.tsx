import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePayment } from '@/hooks/usePayment';
import { useInternalWallet } from '@/hooks/useInternalWallet';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowRight, Wallet, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Recharge = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { processPayment, checkPaymentStatus, loading, getSupportedMethods, transactions, getTransactions } = usePayment();
  const { tokens } = useInternalWallet();
  
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedToken, setSelectedToken] = useState('');

  const paymentMethods = getSupportedMethods();
  const quickAmounts = [50, 100, 200, 500, 1000];

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
      setSelectedToken(tokens[0].symbol);
    }
  }, [tokens, selectedToken]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>جاري التحميل...</p>
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

    try {
      // Format phone number with country code
      let formattedPhone = phoneNumber;
      if (phoneNumber && !phoneNumber.startsWith('+')) {
        // Remove leading zero if exists and add +20
        formattedPhone = '+20' + phoneNumber.replace(/^0+/, '');
      }

      const result = await processPayment({
        amount: parseFloat(amount),
        payment_method: selectedMethod as any,
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

  const selectedTokenData = tokens.find(t => t.symbol === selectedToken);
  const estimatedTokens = selectedTokenData && amount 
    ? (parseFloat(amount) / selectedTokenData.exchange_rate_usd).toFixed(2)
    : '0';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir="rtl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            شحن المحفظة
          </h1>
          <p className="text-muted-foreground">
            اشحن محفظتك باستخدام طرق الدفع المحلية المصرية
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
                {/* Token Selection */}
                <div className="space-y-2">
                  <Label htmlFor="token">العملة المراد شحنها</Label>
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => (
                        <SelectItem key={token.id} value={token.symbol}>
                          {token.name} ({token.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        className={`p-4 rounded-lg border-2 transition-all text-center ${
                          selectedMethod === method.id
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-border hover:border-primary/50 hover:shadow'
                        }`}
                      >
                        <div className="text-3xl mb-2">{method.icon}</div>
                        <div className="text-sm font-bold">{method.name}</div>
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
                  <span className="font-medium">{selectedToken || '-'}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">ستحصل على</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    {estimatedTokens} {selectedToken}
                  </div>
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
              <CardContent className="text-xs space-y-2">
                <p>• تأكد من إدخال بيانات الدفع الصحيحة</p>
                <p>• <strong>للمحافظ الإلكترونية:</strong> الرقم لازم يكون مسجل ومفعل في المحفظة</p>
                <p>• في حالة الاختبار، استخدم بطاقة اختبار صالحة</p>
                <p>• لا تحاول أكثر من 3 مرات - الجلسة تنتهي تلقائياً</p>
                <p>• إذا فشل الدفع، ابدأ عملية جديدة من الأعلى</p>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">آخر العمليات</CardTitle>
                  <CardDescription className="text-xs">
                    💡 تتحدث الحالة تلقائياً عند اكتمال/فشل الدفع
                  </CardDescription>
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
                           
                            {isProcessing && isOld && (
                              <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950 p-2 rounded">
                                ⚠️ هذه المعاملة قيد المعالجة لفترة طويلة. إذا لم تكمل الدفع، يمكنك التحقق من الحالة أو بدء عملية جديدة.
                              </div>
                            )}
                            
                            {isProcessing && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs"
                                onClick={() => checkPaymentStatus(tx.id)}
                              >
                                🔍 تحقق من الحالة
                              </Button>
                            )}
                            
                             {tx.status === 'failed' && (
                              <div className="text-xs bg-red-50 dark:bg-red-950 p-2 rounded space-y-1">
                                <p className="text-destructive font-medium">✗ فشل الدفع</p>
                                <p className="text-muted-foreground">الأسباب المحتملة:</p>
                                <ul className="text-muted-foreground mr-4 list-disc">
                                  <li>بيانات الدفع غير صحيحة</li>
                                  <li>رصيد غير كافٍ</li>
                                  <li>انتهاء مدة الجلسة (بعد 3 محاولات)</li>
                                </ul>
                                <p className="text-primary font-medium mt-2">💡 ابدأ عملية دفع جديدة من الأعلى</p>
                              </div>
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
