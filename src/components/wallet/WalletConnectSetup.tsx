import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const WalletConnectSetup = () => {
  const openWalletConnectCloud = () => {
    window.open('https://cloud.reown.com', '_blank');
  };

  return (
    <Alert className="mb-4">
      <AlertDescription className="space-y-3">
        <p className="font-semibold">لتفعيل WalletConnect، تحتاج لمفتاح مشروع مجاني:</p>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>زيارة cloud.reown.com وإنشاء حساب مجاني</li>
          <li>إنشاء مشروع جديد</li>
          <li>نسخ Project ID من لوحة التحكم</li>
          <li>استبدال المفتاح في ملف useWalletConnect.ts</li>
        </ol>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={openWalletConnectCloud}
          className="w-full"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          فتح WalletConnect Cloud
        </Button>
      </AlertDescription>
    </Alert>
  );
};