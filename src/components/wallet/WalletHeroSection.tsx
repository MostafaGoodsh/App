import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const isPositive = percentageChange >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-card to-primary/5 p-6 border border-border/50">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>
      
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

        {/* Main Balance */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              {showBalance ? (
                <>
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </>
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
          
          {/* Change Indicator */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className={cn(
              "font-medium",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
            </span>
            <span className="text-muted-foreground">
              ({isPositive ? '+' : ''}${Math.abs(changeAmount).toFixed(2)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
