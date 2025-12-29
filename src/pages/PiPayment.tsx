import React, { useState, useEffect } from 'react';
import { usePiNetwork } from '@/hooks/usePiNetwork';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, CheckCircle2, AlertCircle, Coins } from 'lucide-react';
import { toast } from 'sonner';

const PiPayment = () => {
  const {
    isPiBrowser,
    isAuthenticated,
    piUser,
    isProcessing,
    isInitializing,
    authenticate,
    createPayment,
  } = usePiNetwork();

  const [amount, setAmount] = useState<number>(1);
  const [memo, setMemo] = useState<string>('MS-RA Token Purchase');

  // Auto-authenticate when in Pi Browser (with delay for SDK to initialize)
  useEffect(() => {
    if (isPiBrowser && !isAuthenticated && !isInitializing) {
      // Small delay to ensure SDK is fully ready
      const timer = setTimeout(() => {
        authenticate();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPiBrowser, isAuthenticated, isInitializing, authenticate]);

  const handlePayment = async () => {
    if (amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح / Please enter a valid amount');
      return;
    }

    const payment = await createPayment(amount, memo, {
      type: 'token_purchase',
      tokenAmount: amount * 100, // Example: 1 Pi = 100 MS-RA tokens
    });

    if (payment) {
      console.log('Payment initiated:', payment);
    }
  };

  const presetAmounts = [1, 5, 10, 20, 50, 100];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Coins className="w-10 h-10 text-primary" />
            <h1 className="font-cairo text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Pi Payment
            </h1>
          </div>
          <p className="font-cairo text-xl md:text-2xl text-white/90 mb-2">
            الدفع بـ Pi
          </p>
          <p className="text-muted-foreground text-sm">
            اشترِ رموز MS-RA باستخدام Pi
            <br />
            <span className="text-xs">Buy MS-RA Tokens with Pi</span>
          </p>
        </header>

        {/* Browser Check */}
        {!isPiBrowser && (
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">غير متوفر / Not Available</p>
                  <p className="text-sm text-muted-foreground">
                    يرجى فتح هذه الصفحة من Pi Browser
                    <br />
                    Please open this page from Pi Browser
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Authentication Status */}
        {isPiBrowser && (
          <Card className="bg-black/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="font-cairo flex items-center gap-2 text-white">
                <Wallet className="w-5 h-5" />
                حالة الاتصال / Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isInitializing ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <div>
                    <p className="font-semibold text-white">جاري الاتصال... / Connecting...</p>
                    <p className="text-sm text-white/70">
                      يرجى الانتظار / Please wait
                    </p>
                  </div>
                </div>
              ) : isAuthenticated && piUser ? (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-semibold text-white">متصل / Connected</p>
                    <p className="text-sm text-white/70">
                      مرحباً، {piUser.username || piUser.uid}
                      <br />
                      <span className="text-xs">Welcome, {piUser.username || 'Pioneer'}</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="mr-auto">
                    Pioneer
                  </Badge>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-white/70 text-sm">
                    يرجى تسجيل الدخول للمتابعة / Please sign in to continue
                  </p>
                  <Button onClick={authenticate} className="w-full">
                    تسجيل الدخول بـ Pi / Sign in with Pi
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        {isPiBrowser && isAuthenticated && (
          <Card className="bg-black/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="font-cairo flex items-center gap-2 text-white">
                <Coins className="w-5 h-5" />
                شراء رموز MS-RA / Buy MS-RA Tokens
              </CardTitle>
              <CardDescription className="text-white/70">
                1 Pi = 100 MS-RA رمز / 1 Pi = 100 MS-RA Tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preset Amounts */}
              <div>
                <Label className="text-white/80 mb-2 block">
                  مبالغ سريعة / Quick Amounts
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAmount(preset)}
                      className="font-cairo"
                    >
                      {preset} π
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white/80">
                  المبلغ (Pi) / Amount (Pi)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="أدخل المبلغ..."
                />
              </div>

              {/* Conversion Preview */}
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">ستحصل على / You'll receive:</span>
                  <span className="font-bold text-primary text-xl">
                    {(amount * 100).toLocaleString()} MS-RA
                  </span>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                onClick={handlePayment}
                disabled={isProcessing || amount <= 0}
                className="w-full h-12 text-lg font-cairo"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    جاري المعالجة... / Processing...
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5 mr-2" />
                    ادفع {amount} π / Pay {amount} π
                  </>
                )}
              </Button>

              <p className="text-xs text-white/50 text-center">
                ستتم معالجة الدفع عبر Pi Network
                <br />
                Payment will be processed via Pi Network
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PiPayment;
