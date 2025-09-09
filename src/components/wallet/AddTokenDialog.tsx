import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { ConnectedWallet } from "@/hooks/useWalletConnect";

interface AddTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: ConnectedWallet;
}

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

export const AddTokenDialog = ({ open, onOpenChange, wallet }: AddTokenDialogProps) => {
  const { toast } = useToast();
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenInfo, setTokenInfo] = useState<{
    name: string;
    symbol: string;
    decimals: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const validateTokenAddress = async () => {
    if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
      toast({
        title: "عنوان غير صالح",
        description: "يرجى إدخال عنوان عقد صالح",
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
        title: "تم العثور على الرمز",
        description: `${name} (${symbol})`,
      });
    } catch (error) {
      console.error('Error validating token:', error);
      toast({
        title: "خطأ في التحقق",
        description: "لم يتم العثور على رمز صالح في هذا العنوان",
        variant: "destructive"
      });
      setTokenInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const addToken = async () => {
    if (!tokenInfo) {
      toast({
        title: "خطأ",
        description: "يرجى التحقق من الرمز أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    try {
      // Mock adding token to wallet
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "تم إضافة الرمز",
        description: `تم إضافة ${tokenInfo.name} (${tokenInfo.symbol}) بنجاح`,
      });
      
      // Reset form
      setTokenAddress("");
      setTokenInfo(null);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "فشل في إضافة الرمز",
        description: "حدث خطأ أثناء إضافة الرمز",
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="arabic-text">إضافة رمز مميز مخصص</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenAddress" className="arabic-text">عنوان عقد الرمز</Label>
            <Input
              id="tokenAddress"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={validateTokenAddress}
            disabled={!tokenAddress || isLoading}
            className="w-full"
          >
            {isLoading ? "جاري التحقق..." : "التحقق من الرمز"}
          </Button>
          
          {tokenInfo && (
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium arabic-text">معلومات الرمز:</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">الاسم:</span> {tokenInfo.name}</p>
                <p><span className="font-medium">الرمز:</span> {tokenInfo.symbol}</p>
                <p><span className="font-medium">الخانات العشرية:</span> {tokenInfo.decimals}</p>
                <p><span className="font-medium">العنوان:</span> {tokenAddress}</p>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              إلغاء
            </Button>
            <Button 
              onClick={addToken}
              disabled={!tokenInfo || isAdding}
              className="flex-1"
            >
              {isAdding ? "جاري الإضافة..." : "إضافة الرمز"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};