import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WalletHeroSectionProps {
  totalBalance: number;
  percentageChange?: number;
  changeAmount?: number;
  username?: string;
  points?: number;
}

export const WalletHeroSection = ({
  totalBalance,
  percentageChange = 0,
  changeAmount = 0,
  username,
  points = 0
}: WalletHeroSectionProps) => {
  const [showBalance, setShowBalance] = useState(true);
  const { language, t } = useLanguage();
  const isArabic = language === "ar" || language === "both";

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 font-cairo" dir={isArabic ? "rtl" : "ltr"}>
      
      <div className="relative z-10">
        {/* User Info Row */}
        {(username || points > 0) && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
              {username && (
                <span className="text-sm text-muted-foreground">@{username}</span>
              )}
            </div>
            {points > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-primary text-sm">✦</span>
                <span className="text-sm font-medium text-primary">
                  {points.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Main Balance - Token based, no USD */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-cairo">
              {showBalance ? (
                <span>{t("المحفظة الداخلية", "Internal Wallet")}</span>
              ) : (
                '••••••'
              )}
            </h1>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              {showBalance ? (
                <Eye className="w-5 h-5 text-muted-foreground" />
              ) : (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
          
          {points > 0 && showBalance && (
            <p className="text-sm text-muted-foreground">
              <span dir="ltr" className="text-primary font-bold">{points.toLocaleString()} XP</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
