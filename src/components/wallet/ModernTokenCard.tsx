import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ModernTokenCardProps {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  price?: number;
  priceChange24h?: number;
  logoUrl?: string;
  network?: string;
  onClick?: () => void;
}

export const ModernTokenCard = ({
  symbol,
  name,
  balance,
  usdValue,
  price,
  priceChange24h = 0,
  logoUrl,
  network,
  onClick
}: ModernTokenCardProps) => {
  const isPositive = priceChange24h >= 0;
  
  // Token logo colors for fallback
  const getTokenColor = (sym: string) => {
    const colors: Record<string, string> = {
      'SOL': 'bg-gradient-to-br from-purple-500 to-purple-700',
      'TON': 'bg-gradient-to-br from-blue-400 to-blue-600',
      'ETH': 'bg-gradient-to-br from-blue-500 to-indigo-600',
      'USDC': 'bg-gradient-to-br from-blue-400 to-blue-500',
      'USDT': 'bg-gradient-to-br from-green-400 to-green-600',
      'BNB': 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      'NEAR': 'bg-gradient-to-br from-teal-400 to-teal-600',
      'ATOM': 'bg-gradient-to-br from-indigo-400 to-purple-500',
      'BONK': 'bg-gradient-to-br from-orange-400 to-orange-600',
      'MSRA': 'bg-gradient-to-br from-amber-400 to-amber-600',
      'XP': 'bg-gradient-to-br from-blue-400 to-cyan-500',
    };
    return colors[sym.toUpperCase()] || 'bg-gradient-to-br from-gray-400 to-gray-600';
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/50",
        "hover:bg-card hover:border-primary/30 transition-all duration-200 cursor-pointer",
        "backdrop-blur-sm"
      )}
      onClick={onClick}
    >
      {/* Left: Token Info */}
      <div className="flex items-center gap-3">
        {/* Token Logo */}
        <div className="relative">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={symbol}
              className="w-11 h-11 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm",
            getTokenColor(symbol),
            logoUrl ? 'hidden' : ''
          )}>
            {symbol.slice(0, 2)}
          </div>
          
          {/* Network Badge */}
          {network && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-background flex items-center justify-center">
              <div className={cn(
                "w-3 h-3 rounded-full",
                network === 'solana' ? 'bg-purple-500' :
                network === 'ethereum' ? 'bg-blue-500' :
                network === 'polygon' ? 'bg-purple-600' :
                'bg-gray-500'
              )} />
            </div>
          )}
        </div>

        {/* Token Name & Price Change */}
        <div>
          <h4 className="font-semibold text-foreground">{symbol}</h4>
          <div className="flex items-center gap-2 text-sm">
            {price !== undefined && (
              <span className="text-muted-foreground">
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
            )}
            {priceChange24h !== 0 && (
              <span className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                isPositive ? "text-green-500" : "text-red-500"
              )}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Balance & USD Value */}
      <div className="text-right">
        <p className="font-semibold text-foreground">
          ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-muted-foreground">
          {balance.toLocaleString('en-US', { maximumFractionDigits: 6 })} {symbol}
        </p>
      </div>
    </div>
  );
};
