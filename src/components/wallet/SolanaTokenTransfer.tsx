import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { Send, ArrowLeft } from "lucide-react";

interface SolanaToken {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
}

interface SolanaTokenTransferProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: SolanaToken | null; // null means SOL
}

export const SolanaTokenTransfer = ({ open, onOpenChange, token }: SolanaTokenTransferProps) => {
  const { sendSol, sendToken, connected } = useSolanaWallet();
  
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!connected || !recipient || !amount) return;

    setIsSending(true);
    try {
      const amountNum = parseFloat(amount);
      
      if (token) {
        // Send SPL Token
        await sendToken(recipient, token.mint, amountNum, token.decimals);
      } else {
        // Send SOL
        await sendSol(recipient, amountNum);
      }
      
      // Reset form
      setRecipient("");
      setAmount("");
      setMemo("");
      onOpenChange(false);
    } catch (error) {
      console.error('Transfer error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const isValidAmount = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return false;
    
    if (token) {
      return amountNum <= token.balance;
    }
    // للـ SOL، نحتاج للتحقق من الرصيد أيضاً
    return amountNum <= 1000; // حد أقصى معقول
  };

  const isValidRecipient = () => {
    return recipient.length >= 32 && recipient.length <= 44;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            <span className="arabic-text">
              إرسال {token ? token.symbol : 'SOL'}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Token Info */}
          {token ? (
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{token.name} ({token.symbol})</p>
              <p className="text-sm text-muted-foreground">
                الرصيد المتاح: {token.balance.toFixed(4)} {token.symbol}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg">
              <p className="font-medium arabic-text">سولانا (SOL)</p>
              <p className="text-sm text-muted-foreground arabic-text">
                العملة الأساسية لشبكة سولانا
              </p>
            </div>
          )}

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label className="arabic-text">عنوان المستقبل</Label>
            <Textarea
              placeholder="أدخل عنوان محفظة سولانا..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="min-h-[80px] font-mono text-sm"
            />
            {recipient && !isValidRecipient() && (
              <p className="text-xs text-destructive arabic-text">
                عنوان غير صالح - يجب أن يكون بين 32-44 حرف
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label className="arabic-text">المقدار</Label>
            <Input
              type="number"
              placeholder={`0.0 ${token ? token.symbol : 'SOL'}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step={token ? Math.pow(10, -token.decimals) : 0.001}
              min="0"
            />
            {amount && !isValidAmount() && (
              <p className="text-xs text-destructive arabic-text">
                {token ? 'المقدار يتجاوز الرصيد المتاح' : 'مقدار غير صالح'}
              </p>
            )}
          </div>

          {/* Memo (Optional) */}
          <div className="space-y-2">
            <Label className="arabic-text">مذكرة (اختياري)</Label>
            <Input
              placeholder="أضف مذكرة للمعاملة..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="arabic-text">إلغاء</span>
            </Button>
            <Button
              onClick={handleSend}
              disabled={!isValidRecipient() || !isValidAmount() || isSending}
              className="flex-1"
            >
              {isSending ? (
                <span className="arabic-text">جاري الإرسال...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  <span className="arabic-text">إرسال</span>
                </>
              )}
            </Button>
          </div>

          {/* Warning */}
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-xs text-orange-600 arabic-text">
              ⚠️ تأكد من صحة العنوان - المعاملات غير قابلة للإلغاء
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};