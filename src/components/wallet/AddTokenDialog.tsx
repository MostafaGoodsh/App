import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ConnectedWallet } from "@/hooks/useWalletConnect";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, CheckCircle } from "lucide-react";

interface AddTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: ConnectedWallet;
  onTokenAdded?: (token: any) => void;
}

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
}

export const AddTokenDialog = ({ open, onOpenChange, wallet, onTokenAdded }: AddTokenDialogProps) => {
  const { toast } = useToast();
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const validateTokenAddress = async () => {
    if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
      toast({
        title: "عنوان غير صحيح",
        description: "يرجى إدخال عنوان رمز صحيح",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const ethersProvider = new ethers.BrowserProvider(wallet.provider);
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, ethersProvider);
      
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);
      
      setTokenInfo({ name, symbol, decimals });
      
      toast({
        title: "تم التحقق من الرمز",
        description: `تم العثور على ${name} (${symbol})`
      });
    } catch (error) {
      console.error('Token validation error:', error);
      toast({
        title: "خطأ في التحقق",
        description: "لم يتم العثور على رمز صحيح في هذا العنوان",
        variant: "destructive"
      });
      setTokenInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const addToken = async () => {
    if (!tokenInfo || !wallet.provider) return;

    setIsAdding(true);
    try {
      const newToken = {
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        balance: "0",
        address: tokenAddress,
        decimals: tokenInfo.decimals
      };
      
      onTokenAdded?.(newToken);
      
      toast({
        title: "تم إضافة الرمز بنجاح",
        description: `تم إضافة ${tokenInfo.name} (${tokenInfo.symbol}) إلى محفظتك`
      });
      
      handleClose();
    } catch (error) {
      toast({
        title: "خطأ في الإضافة",
        description: "فشل في إضافة الرمز إلى المحفظة",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setTokenAddress("");
    setTokenInfo(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="arabic-content">
        <DialogHeader>
          <DialogTitle className="arabic-text">إضافة رمز مخصص</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Token Address Input */}
          <div className="space-y-2">
            <Label className="arabic-text">عنوان الرمز المميز</Label>
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={validateTokenAddress}
                disabled={!tokenAddress || isLoading}
                variant="outline"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  "تحقق"
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground arabic-text">
              أدخل عنوان العقد الذكي للرمز المميز
            </p>
          </div>

          {/* Token Information */}
          {tokenInfo && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium arabic-text">تم التحقق من الرمز</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground arabic-text">الاسم:</span>
                    <span className="font-medium">{tokenInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground arabic-text">الرمز:</span>
                    <span className="font-medium">{tokenInfo.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground arabic-text">العشريات:</span>
                    <span className="font-medium">{tokenInfo.decimals}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              إلغاء
            </Button>
            <Button
              onClick={addToken}
              disabled={!tokenInfo || isAdding}
            >
              {isAdding ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  <span className="arabic-text">جاري الإضافة...</span>
                </>
              ) : (
                <span className="arabic-text">إضافة الرمز</span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};