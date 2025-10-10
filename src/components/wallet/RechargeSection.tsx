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

export const RechargeSection = () => {
  const { toast } = useToast();
  const { processPayment, loading, getSupportedMethods } = usePayment();
  const { tokens } = useInternalWallet();
  
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  const paymentMethods = getSupportedMethods();
  const quickAmounts = [50, 100, 200, 500, 1000];

  // XP Token (fixed)
  const xpToken = tokens.find(t => t.symbol === 'XP');
  const estimatedTokens = xpToken && amount 
    ? (parseFloat(amount) / xpToken.exchange_rate_usd).toFixed(0)
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
        payment_method: selectedMethod as any,
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
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          شحن نقاط XP | Recharge XP
        </CardTitle>
        <CardDescription>
          اشحن نقاط XP باستخدام طرق الدفع المحلية - Early Pre-Sale
          <br />
          <span className="text-xs">Recharge XP Points with Local Payment Methods</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
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
                  معدل التحويل: 1 EGP = {(1 / xpToken.exchange_rate_usd).toFixed(0)} XP
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Methods */}
          <div className="space-y-2">
            <Label>
              طريقة الدفع | Payment Method ({paymentMethods.length})
            </Label>
            <div className="grid grid-cols-2 gap-3">
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