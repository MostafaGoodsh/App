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
    <div className="relative overflow-hidden rounded-2xl p-4 font-cairo" dir={isArabic ? "rtl" : "ltr"}>
      <div className="relative z-10">
        {/* User Info Row */}
        {(username || points > 0) && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
              {username && (
                <span className="text-sm text-white/80">@{username}</span>
              )}
            </div>
            {points > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                <span className="text-amber-400 text-sm">✦</span>
                <span className="text-sm font-medium text-amber-400">
                  {points.toLocaleString()} XP
                </span>
              </div>
            )}
          </div>
        )}

        {/* Main Balance */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white font-cairo">
              {showBalance ? (
                <span>{t("المحفظة الداخلية", "Internal Wallet")}</span>
              ) : (
                '••••••'
              )}
            </h2>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              {showBalance ? (
                <Eye className="w-4 h-4 text-white/60" />
              ) : (
                <EyeOff className="w-4 h-4 text-white/60" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
