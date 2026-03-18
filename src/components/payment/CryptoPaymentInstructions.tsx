import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCryptoPaymentAddresses } from "@/hooks/useCryptoPaymentAddresses";
import { cn } from "@/lib/utils";
import { AlertTriangle, Copy, Info, Loader2, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface CryptoPaymentInstructionsProps {
  amount: string;
  className?: string;
}

export default function CryptoPaymentInstructions({ amount, className }: CryptoPaymentInstructionsProps) {
  const { dir } = useLanguage();
  const { addresses, loading } = useCryptoPaymentAddresses();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");

  const activeAddress = useMemo(() => {
    if (!addresses.length) return null;
    const targetKey = selectedNetwork || addresses[0]?.network_key;
    return addresses.find((item) => item.network_key === targetKey) || addresses[0] || null;
  }, [addresses, selectedNetwork]);

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`تم نسخ ${label}`);
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("تعذر نسخ البيانات");
    }
  };

  if (loading) {
    return (
      <Alert className={cn("border-border bg-muted/40", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>جاري تحميل عناوين الدفع بالكريبتو...</AlertDescription>
      </Alert>
    );
  }

  if (!addresses.length) {
    return (
      <Alert className={cn("border-border bg-muted/40", className)}>
        <Info className="h-4 w-4" />
        <AlertDescription>
          لا توجد عناوين مفعلة حالياً للدفع بالكريبتو. أضف عنواناً من لوحة التحكم أولاً.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("space-y-3", className)} dir={dir}>
      <Alert className="border-primary/20 bg-primary/5">
        <Wallet className="h-4 w-4 text-primary" />
        <AlertDescription className="space-y-1 text-sm">
          <p className="font-medium text-foreground">اختر الشبكة ثم حوّل من محفظتك إلى العنوان الظاهر.</p>
          <p className="text-muted-foreground">المبلغ المرجعي الحالي: {amount || "0"} EGP</p>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label>الشبكة المتاحة</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {addresses.map((item) => {
            const isActive = activeAddress?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedNetwork(item.network_key)}
                className={cn(
                  "rounded-lg border p-3 text-start transition-colors",
                  isActive ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-foreground">{item.network_name}</div>
                    <div className="text-xs text-muted-foreground">{item.supported_assets || "—"}</div>
                  </div>
                  {isActive && <span className="text-xs font-medium text-primary">محدد</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeAddress && (
        <Card className="border-border/60">
          <CardContent className="space-y-3 pt-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">عنوان التحويل</p>
              <div className="rounded-md border bg-muted/40 p-3" dir="ltr">
                <p className="break-all text-sm text-foreground">{activeAddress.address}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleCopy(activeAddress.address, "العنوان")}
              >
                <Copy className="h-4 w-4" />
                نسخ العنوان
              </Button>
            </div>

            {activeAddress.memo_tag && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Memo / Tag</p>
                <div className="rounded-md border bg-muted/40 p-3" dir="ltr">
                  <p className="break-all text-sm text-foreground">{activeAddress.memo_tag}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleCopy(activeAddress.memo_tag as string, "Memo / Tag")}
                >
                  <Copy className="h-4 w-4" />
                  نسخ الـ Memo / Tag
                </Button>
              </div>
            )}

            <Alert className="border-border bg-muted/40">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-1 text-xs">
                <p>• أرسل فقط الأصول المذكورة لنفس الشبكة.</p>
                <p>• أي تحويل على شبكة مختلفة قد يؤدي إلى فقدان الرصيد نهائياً.</p>
                <p>• أرسل من محفظة تملكها أنت وتحقق من العنوان قبل التأكيد.</p>
                <p>• بعد التحويل، تواصل مع الدعم أو الإدارة لتأكيد الإيداع يدوياً.</p>
                {activeAddress.warnings && <p>• {activeAddress.warnings}</p>}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
