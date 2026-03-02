import { cn } from "@/lib/utils";
import msraTokenIcon from "@/assets/msra-token-icon.jpg";

interface ModernTokenCardProps {
  symbol: string;
  name: string;
  balance: number;
  usdValue?: number;
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
  logoUrl,
  network,
  onClick
}: ModernTokenCardProps) => {
  // Get special logo for MS-RA token
  const getTokenLogo = (sym: string): string | null => {
    if (sym.toUpperCase() === 'MSRA' || sym.toUpperCase() === 'MS-RA') {
      return msraTokenIcon;
    }
    return logoUrl || null;
  };

  // Token logo colors - XP is black, MS-RA is gold
  const getTokenColor = (sym: string) => {
    const colors: Record<string, string> = {
      'XP': 'bg-gradient-to-br from-gray-900 to-black',
      'MSRA': 'bg-gradient-to-br from-amber-500 to-yellow-700',
      'MS-RA': 'bg-gradient-to-br from-amber-500 to-yellow-700',
      'SOL': 'bg-gradient-to-br from-amber-500 to-yellow-600',
      'TON': 'bg-gradient-to-br from-blue-400 to-blue-600',
      'ETH': 'bg-gradient-to-br from-gray-800 to-black',
      'USDC': 'bg-gradient-to-br from-amber-500 to-yellow-500',
      'USDT': 'bg-gradient-to-br from-amber-400 to-yellow-600',
      'BNB': 'bg-gradient-to-br from-yellow-400 to-amber-600',
    };
    return colors[sym.toUpperCase()] || 'bg-gradient-to-br from-gray-800 to-black';
  };

  const getDisplaySymbol = (sym: string) => {
    if (sym.toUpperCase() === 'MSRA') return '$MS-RA';
    return sym;
  };

  const tokenLogo = getTokenLogo(symbol);

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
          {tokenLogo ? (
            <img 
              src={tokenLogo} 
              alt={symbol}
              className="w-11 h-11 rounded-full object-cover border-2 border-amber-500/30"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 border-amber-500/30",
            getTokenColor(symbol),
            symbol.toUpperCase() === 'XP' ? 'text-white' : 'text-amber-400',
            tokenLogo ? 'hidden' : ''
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
                network === 'ton' ? 'bg-blue-400' :
                'bg-gray-500'
              )} />
            </div>
          )}
        </div>

        {/* Token Name */}
        <div>
          <h4 className="font-semibold text-foreground" dir="ltr">{getDisplaySymbol(symbol)}</h4>
          <p className="text-sm text-muted-foreground">{name}</p>
        </div>
      </div>

      {/* Right: Balance */}
      <div className="text-right">
        <p className="font-semibold text-foreground" dir="ltr">
          {balance.toLocaleString('en-US', { maximumFractionDigits: 6 })}
        </p>
        <p className="text-xs text-muted-foreground" dir="ltr">{getDisplaySymbol(symbol)}</p>
      </div>
    </div>
  );
};
