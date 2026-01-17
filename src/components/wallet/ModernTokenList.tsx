import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ModernTokenCard } from "./ModernTokenCard";
import { Plus, SlidersHorizontal, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TokenData {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  price?: number;
  priceChange24h?: number;
  logoUrl?: string;
  network?: string;
  isInternal?: boolean;
}

interface ModernTokenListProps {
  tokens: TokenData[];
  isLoading?: boolean;
  onAddToken?: () => void;
  onRefresh?: () => void;
  onTokenClick?: (token: TokenData) => void;
}

export const ModernTokenList = ({
  tokens,
  isLoading = false,
  onAddToken,
  onRefresh,
  onTokenClick
}: ModernTokenListProps) => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'earn'>('tokens');
  const [sortBy, setSortBy] = useState<'value' | 'name' | 'change'>('value');

  const sortedTokens = [...tokens].sort((a, b) => {
    switch (sortBy) {
      case 'value':
        return b.usdValue - a.usdValue;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'change':
        return (b.priceChange24h || 0) - (a.priceChange24h || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      {/* Tabs Header */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="tokens" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Tokens
            </TabsTrigger>
            <TabsTrigger value="nfts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              NFTs
            </TabsTrigger>
            <TabsTrigger value="earn" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Earn
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSortBy(sortBy === 'value' ? 'change' : 'value')}
            className="h-8 w-8"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tokens Content */}
      {activeTab === 'tokens' && (
        <div className="space-y-2">
          {/* Empty State CTA */}
          {tokens.length === 0 && !isLoading && (
            <div className="p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    LET'S GET STARTED
                  </p>
                  <p className="font-medium text-foreground">
                    Deposit crypto from another wallet or an exchange
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          )}

          {/* Token List */}
          {!isLoading && sortedTokens.map((token) => (
            <ModernTokenCard
              key={`${token.symbol}-${token.network || 'default'}`}
              symbol={token.symbol}
              name={token.name}
              balance={token.balance}
              usdValue={token.usdValue}
              price={token.price}
              priceChange24h={token.priceChange24h}
              logoUrl={token.logoUrl}
              network={token.network}
              onClick={() => onTokenClick?.(token)}
            />
          ))}

          {/* Add Token/Chain Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-full border-2"
              onClick={onAddToken}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add token
            </Button>
          </div>
        </div>
      )}

      {/* NFTs Tab */}
      {activeTab === 'nfts' && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">لا توجد NFTs حالياً</p>
          <p className="text-xs mt-1">ستظهر هنا عند امتلاك NFTs</p>
        </div>
      )}

      {/* Earn Tab */}
      {activeTab === 'earn' && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">فرص الربح قادمة قريباً</p>
          <p className="text-xs mt-1">تابعنا للحصول على أحدث العروض</p>
        </div>
      )}
    </div>
  );
};
