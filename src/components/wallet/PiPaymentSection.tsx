import { useState } from 'react';
import { usePiNetwork } from '@/hooks/usePiNetwork';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, CheckCircle2, AlertCircle, Coins, Info, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { PI_NETWORK_OPTIONS, PI_APP_WALLET_ADDRESS } from '@/config/pi';
import piLogo from '@/assets/pi-logo.png';

export const PiPaymentSection = () => {
  const {
    isPiBrowser,
    isAuthenticated,
    piUser,
    isProcessing,
    isInitializing,
    authenticate,
    createPayment,
    networkMode,
    networkLabel,
    setNetworkMode,
  } = usePiNetwork();

  const [amount, setAmount] = useState<number>(1);
  const [memo, setMemo] = useState<string>('MS-RA Token Purchase');

  const handlePayment = async () => {
    if (amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح / Please enter a valid amount');
      return;
    }
    await createPayment(amount, memo, {
      type: 'token_purchase',
      tokenAmount: amount * 100,
    });
  };

  const presetAmounts = [1, 5, 10, 20, 50, 100];

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-b border-amber-500/20">
        <CardTitle className="flex items-center gap-2 text-base">
          <img src={piLogo} alt="Pi" className="w-6 h-6 rounded-full" />
          <span>الدفع بـ Pi | Pay with Pi</span>
        </CardTitle>
        <CardDescription>
          اشترِ رموز MS-RA باستخدام Pi — 1 π = 100 $MS-RA
          <br />
          <span className="text-xs">Buy MS-RA Tokens with Pi Network</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Not Pi Browser */}
        {!isPiBrowser && (
          <Alert className="border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-sm">
              <p className="font-semibold">يتطلب Pi Browser</p>
              <p className="text-xs text-muted-foreground">
                افتح هذه الصفحة من متصفح Pi لتتمكن من الدفع
                <br />
                Open this page in Pi Browser to make payments
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Network Selector */}
        <div className="space-y-2">
          <Label className="text-xs">الشبكة / Network</Label>
          <div className="grid grid-cols-2 gap-2">
            {PI_NETWORK_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={networkMode === option.value ? 'default' : 'outline'}
                onClick={() => setNetworkMode(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* App Wallet Address */}
        {PI_APP_WALLET_ADDRESS[networkMode] && (
          <div className="space-y-1">
            <Label className="text-xs">عنوان محفظة التطبيق / App Wallet</Label>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-2">
              <code className="text-[10px] text-muted-foreground break-all flex-1 ltr" dir="ltr">
                {PI_APP_WALLET_ADDRESS[networkMode]}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(PI_APP_WALLET_ADDRESS[networkMode]);
                  toast.success('تم النسخ / Copied');
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        {/* Auth Status */}
        {isPiBrowser && !isAuthenticated && (
          <Button onClick={authenticate} className="w-full" disabled={isInitializing}>
            {isInitializing ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> جاري الاتصال...</>
            ) : (
              <><Wallet className="w-4 h-4 mr-2" /> تسجيل الدخول بـ Pi</>
            )}
          </Button>
        )}

        {isAuthenticated && piUser && (
          <>
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">{piUser.username || 'Pioneer'}</span>
              <Badge variant="secondary" className="text-[10px] mr-auto">{networkLabel}</Badge>
            </div>

            {/* Preset Amounts */}
            <div className="space-y-2">
              <Label className="text-xs">مبالغ سريعة / Quick Amounts</Label>
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    variant={amount === preset ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAmount(preset)}
                  >
                    {preset} π
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="pi-amount" className="text-xs">المبلغ (Pi)</Label>
              <Input
                id="pi-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                dir="ltr"
              />
            </div>

            {/* Conversion Preview */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>ستحصل على / You'll receive:</span>
                  <span className="font-bold text-primary text-lg">
                    {(amount * 100).toLocaleString()} MS-RA
                  </span>
                </div>
              </AlertDescription>
            </Alert>

            {/* Pay Button */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing || amount <= 0}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> جاري المعالجة...</>
              ) : (
                <><Coins className="w-5 h-5 mr-2" /> ادفع {amount} π</>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
