import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePayment } from '@/hooks/usePayment';
import { useInternalWallet } from '@/hooks/useInternalWallet';
import { Loader2, ArrowRight, CreditCard, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CryptoPaymentInstructions from '@/components/payment/CryptoPaymentInstructions';

export const RechargeSection = () => {
  const { toast } = useToast();
  const { processPayment, loading, getSupportedMethods } = usePayment();
  const { tokens } = useInternalWallet();
  
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  const paymentMethods = getSupportedMethods();
  const quickAmounts = [50, 100, 200, 500, 1000];

  // XP Token (fixed) - exchange_rate_usd = 0.001 means 1 XP = 0.001 USD
  const xpToken = tokens.find(t => t.symbol === 'XP');
  
  // EGP to USD conversion rate (approximate)
  // NOTE: في الإنتاج يجب جلب السعر الحقيقي من API أو DB
  const EGP_TO_USD_RATE = 0.02; // 1 EGP ≈ 0.02 USD (50 EGP = 1 USD)
  
  // Calculate: EGP → USD → XP
  // Amount in USD = EGP * EGP_TO_USD_RATE
  // XP = USD / exchange_rate_usd
  const estimatedTokens = xpToken && amount 
    ? Math.floor((parseFloat(amount) * EGP_TO_USD_RATE) / xpToken.exchange_rate_usd).toString()
    : '0';
  
  // معدل التحويل المباشر (XP لكل EGP)
  const xpPerEgp = xpToken 
    ? Math.floor(EGP_TO_USD_RATE / xpToken.exchange_rate_usd) 
    : 0;

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

    if ((selectedMethod === 'vodafone_cash' || selectedMethod === 'orange_cash' || selectedMethod === 'etisalat_cash') && !phoneNumber) {
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
    <Card className="border-primary/20 relative overflow-hidden w-full max-w-full">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url('/lovable-uploads/73294275-1418-4174-b109-0f587abab976.png')` }}
      />
      <CardHeader className="relative z-10 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b border-primary/20">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="w-5 h-5 text-primary" />
          <span>Recharge XP | شحن نقاط XP</span>
        </CardTitle>
        <CardDescription>
          اشحن نقاط XP باستخدام طرق الدفع المحلية - Early Pre-Sale
          <br />
          <span className="text-xs">Recharge XP Points with Local Payment Methods</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">
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
            />
            <div className="flex gap-2 flex-wrap">
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

          {/* Conversion Rate Display */}
          {amount && xpToken && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>ستحصل على | You'll Get:</span>
                  <span className="text-lg font-bold text-primary">
                    {estimatedTokens} XP
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  معدل التحويل: 1 EGP = {xpPerEgp} XP (تقريباً)
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Methods */}
          <div className="space-y-2">
            <Label>
              طريقة الدفع | Payment Method ({paymentMethods.length})
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`relative h-20 rounded-lg border-2 transition-all overflow-hidden ${
                    selectedMethod === method.id
                      ? 'border-primary shadow-lg scale-105'
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
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number (for mobile wallets) */}
          {(selectedMethod === 'vodafone_cash' || 
            selectedMethod === 'orange_cash' || 
            selectedMethod === 'etisalat_cash') && (
            <div className="space-y-2">
              <Label htmlFor="phone">
                رقم المحفظة | Wallet Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01xxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                ⚠️ الرقم لازم يكون مسجل في المحفظة الإلكترونية
              </p>
            </div>
          )}

          {selectedMethod === 'crypto' && (
            <CryptoPaymentInstructions amount={amount} />
          )}

          {/* Test Mode Warning */}
          <Alert className="bg-black/70 border-yellow-600/40">
            <Info className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-xs">
              <p className="font-bold text-yellow-500 mb-1">
                🧪 Test Mode | وضع الاختبار
              </p>
              <p>استخدم بطاقة الاختبار: <strong className="font-mono">4987 6543 2109 8769</strong></p>
              <p className="text-red-400 mt-1">⚠️ لا تستخدم بطاقة حقيقية!</p>
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                متابعة للدفع | Continue to Payment
                <ArrowRight className="mr-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};