import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { useInternalWallet } from '@/hooks/useInternalWallet';
import { useWithdrawal } from '@/hooks/useWithdrawal';

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WithdrawalDialog: React.FC<WithdrawalDialogProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState(1);
  const [selectedToken, setSelectedToken] = useState('');
  const [amount, setAmount] = useState('');
  const [targetToken, setTargetToken] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { balances, getTokenBalance, isLoading: walletsLoading } = useInternalWallet();
  const { 
    loading: withdrawalLoading, 
    processWithdrawal, 
    calculateTargetAmount, 
    getSupportedTokens 
  } = useWithdrawal();

  const supportedTokens = getSupportedTokens();

  const resetForm = () => {
    setStep(1);
    setSelectedToken('');
    setAmount('');
    setTargetToken('');
    setTargetAddress('');
    setIsProcessing(false);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleNext = () => {
    if (step === 1 && selectedToken && amount) {
      setStep(2);
    } else if (step === 2 && targetToken && targetAddress) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleWithdrawal = async () => {
    if (!selectedToken || !amount || !targetToken || !targetAddress) return;

    setIsProcessing(true);
    try {
      await processWithdrawal({
        internal_token_symbol: selectedToken,
        internal_amount: parseFloat(amount),
        target_token: targetToken,
        target_address: targetAddress
      });

      setStep(4); // Success step
    } catch (error) {
      console.error('Withdrawal failed:', error);
      // Error is already handled in useWithdrawal hook
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedBalance = selectedToken ? getTokenBalance(selectedToken) : 0;
  const estimatedAmount = amount ? calculateTargetAmount(parseFloat(amount), targetToken) : 0;

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="token">اختر العملة للسحب</Label>
        <Select value={selectedToken} onValueChange={setSelectedToken}>
          <SelectTrigger>
            <SelectValue placeholder="اختر العملة الداخلية" />
          </SelectTrigger>
          <SelectContent>
            {balances.map((balance) => (
              <SelectItem key={balance.token.symbol} value={balance.token.symbol}>
                <div className="flex items-center justify-between w-full">
                  <span>{balance.token.name} ({balance.token.symbol})</span>
                  <span className="text-muted-foreground">
                    {balance.balance.toLocaleString()}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedToken && (
        <div>
          <Label htmlFor="amount">الكمية</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            max={selectedBalance}
            step="0.01"
          />
          <p className="text-sm text-muted-foreground mt-1">
            الرصيد المتاح: {selectedBalance.toLocaleString()} {selectedToken}
          </p>
        </div>
      )}

      <Button 
        onClick={handleNext}
        disabled={!selectedToken || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > selectedBalance}
        className="w-full"
      >
        التالي
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label>اختر العملة المستهدفة</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {supportedTokens.map((token) => (
            <Card 
              key={token.symbol} 
              className={`cursor-pointer transition-all ${
                targetToken === token.symbol ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setTargetToken(token.symbol)}
            >
              <CardContent className="p-3 text-center">
                <div className="font-medium">{token.symbol}</div>
                <div className="text-sm text-muted-foreground">{token.name}</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {token.network}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="address">عنوان المحفظة المستهدف</Label>
        <Input
          id="address"
          value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value)}
          placeholder="أدخل عنوان المحفظة"
        />
        <p className="text-sm text-muted-foreground mt-1">
          تأكد من صحة العنوان - المعاملات غير قابلة للإلغاء
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleBack} className="w-full">
          السابق
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!targetToken || !targetAddress}
          className="w-full"
        >
          التالي
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          يرجى مراجعة تفاصيل السحب بعناية. هذه العملية غير قابلة للإلغاء.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">العملة المصدر:</span>
            <span className="font-medium">{amount} {selectedToken}</span>
          </div>
          
          <div className="flex items-center justify-center py-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">العملة المستهدفة:</span>
            <span className="font-medium">{estimatedAmount.toFixed(6)} {targetToken}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">العنوان المستهدف:</span>
            <span className="font-mono text-sm">
              {targetAddress.slice(0, 8)}...{targetAddress.slice(-8)}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">رسوم الشبكة:</span>
            <span>~0.001 {targetToken}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleBack} className="w-full">
          السابق
        </Button>
        <Button 
          onClick={handleWithdrawal}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
              جاري المعالجة...
            </>
          ) : (
            'تأكيد السحب الحقيقي'
          )}
        </Button>
      </div>

      <Alert className="border-amber-200 bg-amber-50">
        <AlertDescription className="text-amber-800">
          ⚠️ <strong>سحب حقيقي:</strong> ستُرسل العملات فعلياً إلى محفظتك الخارجية على البلوك تشين. 
          هذه العملية غير قابلة للإلغاء وتتطلب رسوم شبكة حقيقية.
        </AlertDescription>
      </Alert>

      <div className="bg-blue-50 p-3 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 text-sm">الشبكات المدعومة:</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div>• <strong>SOL:</strong> معاملات حقيقية على شبكة Solana Devnet</div>
          <div>• <strong>USDC:</strong> قيد التطوير (محاكاة حالياً)</div>
          <div>• <strong>BTC/ETH:</strong> قيد التطوير (محاكاة حالياً)</div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-green-600">تم السحب بنجاح!</h3>
        <p className="text-muted-foreground mt-2">
          تم إرسال {amount} {selectedToken} كـ {estimatedAmount.toFixed(6)} {targetToken}
        </p>
      </div>

      <Alert>
        <AlertDescription>
          قد تستغرق المعاملة بضع دقائق لتظهر في محفظتك المستهدفة
        </AlertDescription>
      </Alert>

      <Button onClick={() => onOpenChange(false)} className="w-full">
        إغلاق
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "سحب إلى محفظة خارجية"}
            {step === 2 && "اختيار العملة والعنوان"}
            {step === 3 && "تأكيد السحب"}
            {step === 4 && "تم السحب بنجاح"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "اختر العملة والكمية المراد سحبها"}
            {step === 2 && "حدد العملة المستهدفة وعنوان المحفظة"}
            {step === 3 && "راجع التفاصيل وأكد العملية"}
            {step === 4 && "تم إنجاز عملية السحب بنجاح"}
          </DialogDescription>
        </DialogHeader>

        {walletsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="mr-2">جارٍ التحميل...</span>
          </div>
        ) : (
          <>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};