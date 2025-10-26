import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePayment } from '@/hooks/usePayment';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Check, Crown, Lock } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  name_ar: string;
  price: number;
  duration_days: number;
  features: string[];
  icon: string;
  color: string;
}

const AnubisSubscription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { processPayment, loading, getSupportedMethods } = usePayment();
  
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  const paymentMethods = getSupportedMethods();

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      name_ar: 'اشتراك أساسي',
      price: 100,
      duration_days: 30,
      features: [
        'صلاحية 30 يوم',
        'تخزين حتى 100 ميجا',
        'رفع ملفات حتى 10 ميجا',
        'مصادقة ثنائية',
        'تشفير AES-256'
      ],
      icon: '🔐',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'premium',
      name: 'Premium',
      name_ar: 'اشتراك بريميوم',
      price: 250,
      duration_days: 90,
      features: [
        'صلاحية 90 يوم',
        'تخزين غير محدود',
        'رفع ملفات حتى 50 ميجا',
        'مصادقة ثنائية متقدمة',
        'تشفير عسكري',
        'نسخ احتياطي تلقائي',
        'دعم أولوية'
      ],
      icon: '👑',
      color: 'from-amber-500 to-amber-600'
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      name_ar: 'اشتراك مدى الحياة',
      price: 500,
      duration_days: 36500, // 100 years
      features: [
        'صلاحية مدى الحياة',
        'كل مميزات البريميوم',
        'أولوية الدعم الفني',
        'ميزات حصرية قادمة'
      ],
      icon: '♾️',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Check if payment was successful
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const transactionId = searchParams.get('transaction_id');
    
    if (paymentStatus === 'success' && transactionId) {
      toast({
        title: "✅ تم تفعيل الاشتراك",
        description: "يمكنك الآن الوصول إلى الخزانة الرقمية",
      });
      setTimeout(() => navigate('/anubis'), 2000);
    } else if (paymentStatus === 'failed') {
      toast({
        title: "❌ فشل الدفع",
        description: "حاول مرة أخرى",
        variant: "destructive"
      });
    }
  }, [searchParams, toast, navigate]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار خطة اشتراك",
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

    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    if ((selectedMethod === 'vodafone_cash' || selectedMethod === 'orange_cash' || selectedMethod === 'etisalat_cash') && !phoneNumber) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم المحفظة",
        variant: "destructive"
      });
      return;
    }

    try {
      let formattedPhone = phoneNumber;
      if (phoneNumber && !phoneNumber.startsWith('+')) {
        formattedPhone = '+20' + phoneNumber.replace(/^0+/, '');
      }

      const result = await processPayment({
        amount: plan.price,
        payment_method: selectedMethod as any,
        phone_number: formattedPhone || undefined,
        internal_token_symbol: `ANUBIS_${plan.id.toUpperCase()}_${plan.duration_days}D`
      });

      if (result.payment_url) {
        window.open(result.payment_url, '_blank');
      }
    } catch (error) {
      console.error('Subscription payment error:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>اشتراك الخزانة الرقمية | Crypto-MSR</title>
        <meta name="description" content="اشترك في خدمة الخزانة الرقمية الآمنة مع تشفير عسكري" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl" dir="rtl">
        <div className="mb-8 text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-3">
            اشتراك الخزانة الرقمية - أنوبيس
          </h1>
          <p className="text-muted-foreground text-lg">
            احمِ ملفاتك بأعلى معايير الأمان مع تشفير عسكري
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {subscriptionPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-primary shadow-lg scale-105'
                  : 'hover:border-primary/50 hover:shadow'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardHeader>
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center text-3xl`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name_ar}</CardTitle>
                  <div className="text-3xl font-bold text-primary">
                    {plan.price} ج.م
                  </div>
                  <CardDescription className="mt-2">
                    لمدة {plan.duration_days === 36500 ? 'مدى الحياة' : `${plan.duration_days} يوم`}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Form */}
        {selectedPlan && (
          <Card>
            <CardHeader>
              <CardTitle>إتمام الاشتراك</CardTitle>
              <CardDescription>اختر طريقة الدفع لتفعيل اشتراكك</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="space-y-6">
                {/* Payment Methods */}
                <div className="space-y-3">
                  <Label>طريقة الدفع</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.id)}
                        className={`relative h-20 rounded-lg border-2 transition-all overflow-hidden ${
                          selectedMethod === method.id
                            ? 'border-primary shadow-lg'
                            : 'border-border hover:border-primary/50'
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
                </div>

                {/* Phone Number */}
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
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <Lock className="ml-2 h-4 w-4" />
                      دفع آمن {subscriptionPlans.find(p => p.id === selectedPlan)?.price} ج.م
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  🔒 دفع آمن ومشفر
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  جميع المعاملات مشفرة بمعايير PCI-DSS. لا نحتفظ ببيانات بطاقتك الائتمانية.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AnubisSubscription;
