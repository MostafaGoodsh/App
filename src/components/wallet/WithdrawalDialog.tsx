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
    <div className="space-y-6" dir="rtl">
      <div>
        <Label htmlFor="token" className="font-cairo">
          اختر العملة للسحب <span className="text-xs text-muted-foreground opacity-70">Select Token</span>
        </Label>
        <Select value={selectedToken} onValueChange={setSelectedToken}>
          <SelectTrigger className="font-cairo">
            <SelectValue placeholder="اختر العملة الداخلية | Select internal token" />
          </SelectTrigger>
          <SelectContent>
            {balances.map((balance) => (
              <SelectItem key={balance.token.symbol} value={balance.token.symbol}>
                <div className="flex items-center justify-between w-full font-cairo">
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
          <Label htmlFor="amount" className="font-cairo">
            الكمية <span className="text-xs text-muted-foreground opacity-70">Amount</span>
          </Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            max={selectedBalance}
            step="0.01"
            dir="ltr"
          />
          <p className="text-sm text-muted-foreground mt-1 font-cairo">
            الرصيد المتاح <span className="text-xs opacity-70">Available</span>: <span dir="ltr">{selectedBalance.toLocaleString()} {selectedToken}</span>
          </p>
        </div>
      )}

      <Button 
        onClick={handleNext}
        disabled={!selectedToken || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > selectedBalance}
        className="w-full font-cairo"
      >
        التالي <span className="text-xs opacity-70 mr-1">Next</span>
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6" dir="rtl">
      <div>
        <Label className="font-cairo">
          اختر العملة المستهدفة <span className="text-xs text-muted-foreground opacity-70">Target Token</span>
        </Label>
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
                <div className="font-medium font-cairo">{token.symbol}</div>
                <div className="text-sm text-muted-foreground font-cairo">{token.name}</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {token.network}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="address" className="font-cairo">
          عنوان المحفظة المستهدف <span className="text-xs text-muted-foreground opacity-70">Target Wallet Address</span>
        </Label>
        <Input
          id="address"
          value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value)}
          placeholder="أدخل عنوان المحفظة | Enter wallet address"
          dir="ltr"
        />
        <p className="text-sm text-muted-foreground mt-1 font-cairo">
          تأكد من صحة العنوان - المعاملات غير قابلة للإلغاء
          <span className="text-xs block opacity-70" dir="ltr">Verify address — transactions are irreversible</span>
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleBack} className="w-full font-cairo">
          السابق <span className="text-xs opacity-70 mr-1">Back</span>
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!targetToken || !targetAddress}
          className="w-full font-cairo"
        >
          التالي <span className="text-xs opacity-70 mr-1">Next</span>
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6" dir="rtl">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="font-cairo">
          يرجى مراجعة تفاصيل السحب بعناية. هذه العملية غير قابلة للإلغاء.
          <span className="text-xs block opacity-70" dir="ltr">Please review carefully. This action is irreversible.</span>
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-4 space-y-3 font-cairo">
          <div className="flex justify-between">
            <span className="text-muted-foreground">العملة المصدر <span className="text-xs opacity-70">Source</span>:</span>
            <span className="font-medium" dir="ltr">{amount} {selectedToken}</span>
          </div>
          
          <div className="flex items-center justify-center py-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">العملة المستهدفة <span className="text-xs opacity-70">Target</span>:</span>
            <span className="font-medium" dir="ltr">{estimatedAmount.toFixed(6)} {targetToken}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">العنوان <span className="text-xs opacity-70">Address</span>:</span>
            <span className="font-mono text-sm" dir="ltr">
              {targetAddress.slice(0, 8)}...{targetAddress.slice(-8)}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">رسوم الشبكة <span className="text-xs opacity-70">Fee</span>:</span>
            <span dir="ltr">~0.001 {targetToken}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleBack} className="w-full font-cairo">
          السابق <span className="text-xs opacity-70 mr-1">Back</span>
        </Button>
        <Button 
          onClick={handleWithdrawal}
          disabled={isProcessing}
          className="w-full font-cairo"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
              جاري المعالجة... <span className="text-xs opacity-70">Processing</span>
            </>
          ) : (
            <>تأكيد السحب <span className="text-xs opacity-70 mr-1">Confirm Withdrawal</span></>
          )}
        </Button>
      </div>

      <Alert className="border-primary/30 bg-primary/5">
        <AlertDescription className="font-cairo text-sm">
          ⚠️ <strong>سحب حقيقي:</strong> ستُرسل العملات فعلياً إلى محفظتك الخارجية على البلوك تشين.
          <span className="text-xs block opacity-70" dir="ltr">Real withdrawal: Tokens will be sent to your external wallet on blockchain.</span>
        </AlertDescription>
      </Alert>

      <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
        <h4 className="font-medium font-cairo mb-2 text-sm">
          الشبكات المدعومة <span className="text-xs opacity-70">Supported Networks</span>
        </h4>
        <div className="text-xs text-muted-foreground space-y-1 font-cairo">
          <div>• <strong>SOL:</strong> معاملات حقيقية على شبكة Solana Devnet</div>
          <div>• <strong>USDC:</strong> قيد التطوير <span className="opacity-70" dir="ltr">(Coming soon)</span></div>
          <div>• <strong>BTC/ETH:</strong> قيد التطوير <span className="opacity-70" dir="ltr">(Coming soon)</span></div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 text-center" dir="rtl">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-green-600 font-cairo">
          تم السحب بنجاح!
          <span className="text-xs text-muted-foreground block font-normal" dir="ltr">Withdrawal Successful!</span>
        </h3>
        <p className="text-muted-foreground mt-2 font-cairo">
          تم إرسال <span dir="ltr">{amount} {selectedToken}</span> كـ <span dir="ltr">{estimatedAmount.toFixed(6)} {targetToken}</span>
        </p>
      </div>

      <Alert>
        <AlertDescription className="font-cairo">
          قد تستغرق المعاملة بضع دقائق لتظهر في محفظتك المستهدفة
          <span className="text-xs block opacity-70" dir="ltr">Transaction may take a few minutes to appear</span>
        </AlertDescription>
      </Alert>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 space-y-3">
          <h4 className="font-semibold font-cairo flex items-center gap-2 justify-center">
            <ArrowRight className="w-4 h-4" />
            الخطوة التالية <span className="text-xs opacity-70 font-normal">Next Step</span>
          </h4>
          <p className="text-sm text-muted-foreground font-cairo">
            يمكنك الآن توصيل محفظة خارجية لتفعيل التبادل المباشر
            <span className="text-xs block opacity-70" dir="ltr">Connect an external wallet for direct swaps</span>
          </p>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              className="w-full border-primary/30 hover:bg-primary/10 font-cairo"
              onClick={() => {
                onOpenChange(false);
                window.dispatchEvent(new CustomEvent('open-wallet-connect'));
              }}
            >
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.09 10.53a6.81 6.81 0 0 1 9.62 0l.32.31a.33.33 0 0 1 0 .47l-1.09 1.07a.17.17 0 0 1-.24 0l-.44-.43a4.75 4.75 0 0 0-6.71 0l-.47.46a.17.17 0 0 1-.24 0L5.75 11.34a.33.33 0 0 1 0-.47l.34-.34zm11.89 2.21 1 .94a.33.33 0 0 1 0 .47l-4.31 4.23a.34.34 0 0 1-.48 0l-3.06-3a.09.09 0 0 0-.12 0l-3.06 3a.34.34 0 0 1-.48 0l-4.31-4.23a.33.33 0 0 1 0-.47l1-.94a.34.34 0 0 1 .48 0l3.06 3a.09.09 0 0 0 .12 0l3.06-3a.34.34 0 0 1 .48 0l3.06 3a.09.09 0 0 0 .12 0l3.06-3a.34.34 0 0 1 .48 0z"/>
              </svg>
              توصيل محفظة WalletConnect
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-primary/30 hover:bg-primary/10 font-cairo"
              onClick={() => {
                onOpenChange(false);
                window.dispatchEvent(new CustomEvent('open-token-swap'));
              }}
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              تفعيل التبادل بين العملات <span className="text-xs opacity-70 mr-1">Token Swap</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => onOpenChange(false)} className="w-full font-cairo">
        إغلاق <span className="text-xs opacity-70 mr-1">Close</span>
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="font-cairo">
            {step === 1 && <>سحب إلى محفظة خارجية <span className="text-xs text-muted-foreground block font-normal" dir="ltr">Withdraw to External Wallet</span></>}
            {step === 2 && <>اختيار العملة والعنوان <span className="text-xs text-muted-foreground block font-normal" dir="ltr">Select Token & Address</span></>}
            {step === 3 && <>تأكيد السحب <span className="text-xs text-muted-foreground block font-normal" dir="ltr">Confirm Withdrawal</span></>}
            {step === 4 && <>تم السحب بنجاح <span className="text-xs text-muted-foreground block font-normal" dir="ltr">Withdrawal Complete</span></>}
          </DialogTitle>
          <DialogDescription className="font-cairo">
            {step === 1 && "اختر العملة والكمية المراد سحبها"}
            {step === 2 && "حدد العملة المستهدفة وعنوان المحفظة"}
            {step === 3 && "راجع التفاصيل وأكد العملية"}
            {step === 4 && "تم إنجاز عملية السحب بنجاح"}
          </DialogDescription>
        </DialogHeader>

        {walletsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="mr-2 font-cairo">جارٍ التحميل... <span className="text-xs opacity-70">Loading</span></span>
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