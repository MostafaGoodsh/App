import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePayment } from '@/hooks/usePayment';
import { useInternalWallet } from '@/hooks/useInternalWallet';
import { Loader2, ArrowRight, CreditCard, Info, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CryptoPaymentInstructions from '@/components/payment/CryptoPaymentInstructions';

interface UnifiedPaymentGatewayProps {
  // Mode: dialog or inline
  mode?: 'dialog' | 'inline';
  // Dialog controls
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Purpose of payment
  purpose?: 'recharge' | 'subscription' | 'mining' | 'general';
  purposeLabel?: string;
  purposeLabelEn?: string;
  // Callback on successful payment
  onPaymentSuccess?: (transactionId: string, amount: number) => void;
  // Fixed amount (optional - if set, user can't change it)
  fixedAmount?: number;
  // Token to credit (default: XP)
  tokenSymbol?: string;
  // Custom background image
  backgroundImage?: string;
  // Show test mode warning
  showTestWarning?: boolean;
  // Show conversion rate display
  showConversionRate?: boolean;
}

export const UnifiedPaymentGateway = ({
  mode = 'inline',
  open = true,
  onOpenChange,
  purpose = 'recharge',
  purposeLabel = 'شحن نقاط XP',
  purposeLabelEn = 'Recharge XP Points',
  onPaymentSuccess,
  fixedAmount,
  tokenSymbol = 'XP',
  backgroundImage = '/lovable-uploads/73294275-1418-4174-b109-0f587abab976.png',
  showTestWarning = true,
  showConversionRate = true,
}: UnifiedPaymentGatewayProps) => {
  const { toast } = useToast();
  const { processPayment, loading, getSupportedMethods } = usePayment();
  const { tokens } = useInternalWallet();
  
  const [amount, setAmount] = useState(fixedAmount?.toString() || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  const paymentMethods = getSupportedMethods();
  const quickAmounts = [50, 100, 200, 500, 1000];

  // Get the selected token
  const selectedToken = tokens.find(t => t.symbol === tokenSymbol);
  const estimatedTokens = selectedToken && amount 
    ? (parseFloat(amount) / selectedToken.exchange_rate_usd).toFixed(0)
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

    const requiresPhone = ['vodafone_cash', 'orange_cash', 'etisalat_cash'].includes(selectedMethod);
    if (requiresPhone && !phoneNumber) {
      toast({
        title: "خطأ | Error",
        description: "الرجاء إدخال رقم المحفظة",
        variant: "destructive"
      });
      return;
    }

    // Crypto payment - handled client-side, no Paymob needed
    if (selectedMethod === 'crypto') {
      toast({
        title: "💰 الدفع بالكريبتو | Crypto Payment",
        description: "اختر الشبكة وانسخ العنوان الظاهر ثم أتم التحويل من محفظتك مع مراجعة التحذيرات.",
      });
      if (onPaymentSuccess) {
        onPaymentSuccess('crypto-pending-' + Date.now(), parseFloat(amount));
      }
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
        internal_token_symbol: tokenSymbol
      });

      if (result.payment_url) {
        window.open(result.payment_url, '_blank');
      }

      if (onPaymentSuccess && result.transaction_id) {
        onPaymentSuccess(result.transaction_id, parseFloat(amount));
      }

      toast({
        title: "تم إنشاء عملية الدفع",
        description: "سيتم إعادة توجيهك لإتمام الدفع",
      });
    } catch (error) {
      console.error('Payment submission error:', error);
    }
  };

  const PaymentForm = () => (
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
          disabled={!!fixedAmount}
        />
        {!fixedAmount && (
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
        )}
      </div>

      {/* Conversion Rate Display */}
      {showConversionRate && amount && selectedToken && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>ستحصل على | You'll Get:</span>
              <span className="text-lg font-bold text-primary">
                {estimatedTokens} {tokenSymbol}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              معدل التحويل: 1 EGP = {(1 / selectedToken.exchange_rate_usd).toFixed(0)} {tokenSymbol}
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
      {['vodafone_cash', 'orange_cash', 'etisalat_cash'].includes(selectedMethod) && (
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

      {/* Crypto wallet address */}
      {selectedMethod === 'crypto' && (
        <div className="space-y-2">
          <Alert className="bg-black/70 border-primary/40">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs font-cairo">
              <p className="font-bold text-primary mb-1">₿ الدفع بالعملات الرقمية</p>
              <p>يدعم: SOL, USDT (Solana), TON</p>
              <p className="mt-1">سيتم توليد عنوان الدفع بعد المتابعة</p>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Test Mode Warning */}
      {showTestWarning && (
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
      )}

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
  );

  // Dialog Mode
  if (mode === 'dialog') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <div className="space-y-1">
                <span className="font-cairo" dir="rtl">{purposeLabel}</span>
                <span className="text-sm font-normal text-muted-foreground block font-playfair" dir="ltr">{purposeLabelEn}</span>
              </div>
            </DialogTitle>
            <DialogDescription>
              اشحن باستخدام طرق الدفع المحلية
            </DialogDescription>
          </DialogHeader>
          <PaymentForm />
        </DialogContent>
      </Dialog>
    );
  }

  // Inline Mode (Card)
  return (
    <Card className="border-primary/20 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="w-5 h-5 text-primary" />
          <div className="space-y-1">
            <span className="font-cairo" dir="rtl">{purposeLabel}</span>
            <span className="text-sm font-normal text-muted-foreground block font-playfair" dir="ltr">{purposeLabelEn}</span>
          </div>
        </CardTitle>
        <CardDescription>
          اشحن باستخدام طرق الدفع المحلية - Early Pre-Sale
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <PaymentForm />
      </CardContent>
    </Card>
  );
};
