import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePayment } from '@/hooks/usePayment';
import { useInternalWallet } from '@/hooks/useInternalWallet';
import { Loader2, ArrowRight, CreditCard, Info, Wallet, Droplets, Shield, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import CryptoPaymentInstructions from '@/components/payment/CryptoPaymentInstructions';

type PaymentType = 'presale' | 'liquidity' | 'services' | 'vault';

interface RoadmapPaymentGatewayProps {
  paymentType: PaymentType;
  title?: string;
  description?: string;
}

const paymentTypeConfig: Record<PaymentType, { 
  icon: React.ComponentType<{ className?: string }>;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  color: string;
  tokenSymbol: string;
}> = {
  presale: {
    icon: CreditCard,
    title: { ar: 'البيع المسبق', en: 'Presale' },
    description: { ar: 'احصل على عملات $MS-RA بأسعار تفضيلية قبل الإطلاق', en: 'Get $MS-RA tokens at preferential prices before launch' },
    color: 'from-primary/30 to-primary/10',
    tokenSymbol: '$MS-RA'
  },
  liquidity: {
    icon: Droplets,
    title: { ar: 'مجمع السيولة', en: 'Liquidity Pool' },
    description: { ar: 'أضف سيولة واحصل على عوائد مستمرة', en: 'Add liquidity and earn continuous returns' },
    color: 'from-blue-500/30 to-blue-500/10',
    tokenSymbol: 'LP'
  },
  services: {
    icon: Package,
    title: { ar: 'الخدمات', en: 'Services' },
    description: { ar: 'اشترك في خدماتنا المميزة', en: 'Subscribe to our premium services' },
    color: 'from-green-500/30 to-green-500/10',
    tokenSymbol: 'SRV'
  },
  vault: {
    icon: Shield,
    title: { ar: 'الخزانة الرقمية', en: 'Digital Vault' },
    description: { ar: 'خزن ملفاتك بأمان في الخزانة المشفرة', en: 'Store your files securely in encrypted vault' },
    color: 'from-amber-500/30 to-amber-500/10',
    tokenSymbol: 'VLT'
  }
};

export const RoadmapPaymentGateway = ({ 
  paymentType, 
  title, 
  description 
}: RoadmapPaymentGatewayProps) => {
  const { toast } = useToast();
  const { processPayment, loading, getSupportedMethods } = usePayment();
  const { tokens } = useInternalWallet();
  
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  const config = paymentTypeConfig[paymentType];
  const IconComponent = config.icon;
  const paymentMethods = getSupportedMethods();
  const quickAmounts = [50, 100, 200, 500, 1000];

  // Get token based on payment type
  const targetToken = tokens.find(t => t.symbol === 'XP');
  const estimatedTokens = targetToken && amount 
    ? (parseFloat(amount) / targetToken.exchange_rate_usd).toFixed(0)
    : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "خطأ | Error",
        description: "الرجاء إدخال مبلغ صحيح",
        variant: "destructive"
      });
      return;
    }

    if (!selectedMethod) {
      toast({
        title: "خطأ | Error",
        description: "الرجاء اختيار طريقة دفع",
        variant: "destructive"
      });
      return;
    }

    if (selectedMethod === 'crypto') {
      toast({
        title: "💰 الدفع بالكريبتو | Crypto Payment",
        description: "اختر الشبكة وانسخ العنوان الظاهر ثم أتم التحويل من محفظتك مع مراجعة التحذيرات.",
      });
      return;
    }

    const needsPhone = ['vodafone_cash', 'orange_cash', 'etisalat_cash'].includes(selectedMethod);
    if (needsPhone && !phoneNumber) {
      toast({
        title: "خطأ | Error",
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
        amount: parseFloat(amount),
        payment_method: selectedMethod as 'vodafone_cash' | 'orange_cash' | 'etisalat_cash' | 'fawry' | 'card',
        phone_number: formattedPhone || undefined,
        internal_token_symbol: 'XP'
      });

      if (result.payment_url) {
        window.open(result.payment_url, '_blank');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
    }
  };

  return (
    <Card className={`bg-gradient-to-br ${config.color} backdrop-blur-sm border-primary/30 mb-8 overflow-hidden relative`}>
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5"
        style={{ backgroundImage: `url('/lovable-uploads/egyptian-hieroglyphs-bg.jpg')` }}
      />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              {title || config.title.ar}
              <Badge variant="secondary" className="text-xs">
                {config.title.en}
              </Badge>
            </CardTitle>
            <CardDescription className="text-white/70">
              {description || config.description.ar}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white/90">
              المبلغ (جنيه مصري) | Amount (EGP)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="أدخل المبلغ | Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              className="bg-black/30 border-white/20 text-white placeholder:text-white/50"
            />
            <div className="flex gap-2 flex-wrap">
              {quickAmounts.map((qa) => (
                <Button
                  key={qa}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(qa.toString())}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  {qa} ج.م
                </Button>
              ))}
            </div>
          </div>

          {/* Conversion Rate Display */}
          {amount && targetToken && paymentType !== 'liquidity' && (
            <Alert className="bg-black/40 border-primary/30">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-white">
                <div className="flex items-center justify-between">
                  <span>ستحصل على | You'll Get:</span>
                  <span className="text-lg font-bold text-primary">
                    {estimatedTokens} {config.tokenSymbol}
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Methods */}
          <div className="space-y-2">
            <Label className="text-white/90">
              طريقة الدفع | Payment Method
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`relative h-16 rounded-lg border-2 transition-all overflow-hidden ${
                    selectedMethod === method.id
                      ? 'border-primary shadow-lg scale-105'
                      : 'border-white/20 hover:border-primary/50'
                  }`}
                >
                  <img 
                    src={method.bgImage} 
                    alt={method.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {selectedMethod === method.id && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number (for mobile wallets) */}
          {['vodafone_cash', 'orange_cash', 'etisalat_cash'].includes(selectedMethod) && (
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/90">
                رقم المحفظة | Wallet Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01xxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                dir="ltr"
                className="bg-black/30 border-white/20 text-white placeholder:text-white/50"
              />
              <p className="text-xs text-white/60">
                ⚠️ الرقم لازم يكون مسجل في المحفظة الإلكترونية
              </p>
            </div>
          )}

          {/* Test Mode Warning */}
          <Alert className="bg-yellow-900/20 border-yellow-600/40">
            <Info className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-xs text-white/90">
              <p className="font-bold text-yellow-400 mb-1">
                🧪 Test Mode | وضع الاختبار
              </p>
              <p>استخدم بطاقة: <strong className="font-mono text-yellow-300">4987 6543 2109 8769</strong></p>
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            className="w-full gap-2" 
            size="lg" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                متابعة للدفع | Continue to Payment
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
