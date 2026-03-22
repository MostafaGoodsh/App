import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePiNetwork } from "@/hooks/usePiNetwork";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, CheckCircle2, LogIn } from "lucide-react";
import { PI_NETWORK_OPTIONS } from "@/config/pi";

export const PiWalletCard = () => {
  const {
    isPiBrowser,
    isAuthenticated,
    piUser,
    isInitializing,
    authenticate,
    networkMode,
    networkLabel,
    setNetworkMode,
  } = usePiNetwork();
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden border-border/50 bg-card">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-lg font-bold text-primary shrink-0">
              π
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-foreground text-sm">Pi Network</h4>
                {isAuthenticated && (
                  <Badge variant="outline" className="text-[10px]">
                    {t("متصل")}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{networkLabel}</p>
              {isAuthenticated && piUser ? (
                <p className="text-xs text-muted-foreground truncate">
                  {piUser.username || piUser.uid}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {isPiBrowser ? t("اضغط للاتصال") : t("يتطلب Pi Browser")}
                </p>
              )}
            </div>
          </div>

          {!isAuthenticated ? (
            <Button
              size="sm"
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 shrink-0"
              onClick={authenticate}
              disabled={!isPiBrowser || isInitializing}
            >
              {isInitializing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-1" />
                  {t("اتصال")}
                </>
              )}
            </Button>
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">اختيار الشبكة / Network</p>
          <div className="grid grid-cols-2 gap-2">
            {PI_NETWORK_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={networkMode === option.value ? "default" : "outline"}
                className="h-auto flex-col items-start px-3 py-2"
                onClick={() => setNetworkMode(option.value)}
              >
                <span className="text-xs font-semibold">{option.label}</span>
                <span className="text-[10px] opacity-70">{option.description}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
