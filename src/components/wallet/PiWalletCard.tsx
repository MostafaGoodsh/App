import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePiNetwork } from "@/hooks/usePiNetwork";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, CheckCircle2, LogIn } from "lucide-react";

export const PiWalletCard = () => {
  const { isPiBrowser, isAuthenticated, piUser, isInitializing, authenticate } = usePiNetwork();
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden border-border/50 bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6D28D9]/20 flex items-center justify-center text-lg font-bold text-[#6D28D9]">
              π
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-foreground text-sm">Pi Network</h4>
                {isAuthenticated && (
                  <Badge variant="outline" className="text-[10px] border-green-500/40 text-green-500">
                    {t("متصل")}
                  </Badge>
                )}
              </div>
              {isAuthenticated && piUser ? (
                <p className="text-xs text-muted-foreground">
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
              className="border-[#6D28D9]/40 text-[#6D28D9] hover:bg-[#6D28D9]/10"
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
      </CardContent>
    </Card>
  );
};
