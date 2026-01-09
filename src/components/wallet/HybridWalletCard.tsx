import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternalWallet } from '@/hooks/useInternalWallet';
import { Coins, ArrowUpRight, Wallet, TrendingUp } from 'lucide-react';

interface HybridWalletCardProps {
  onSwapClick?: () => void;
  onWithdrawClick?: () => void;
}

export const HybridWalletCard = ({ onSwapClick, onWithdrawClick }: HybridWalletCardProps) => {
  const { balances, getTotalUSDValue, isLoading } = useInternalWallet();

  if (isLoading) {
    return (
      <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          <div className="space-y-1">
            <div className="text-right font-cairo" dir="rtl">المحفظة</div>
            <div className="text-sm font-normal font-playfair" dir="ltr">Wallet</div>
          </div>
        </CardTitle>
        <CardDescription className="space-y-1">
          <div className="font-cairo" dir="rtl">نظام موحد سريع</div>
          <div className="font-playfair" dir="ltr">Unified System</div>
        </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = getTotalUSDValue();

  return (
    <Card className="w-full bg-card border-primary/20 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url('/lovable-uploads/73294275-1418-4174-b109-0f587abab976.png')` }}
      />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="text-lg font-cairo" dir="rtl">المحفظة</div>
              <div className="text-sm font-normal text-muted-foreground font-playfair" dir="ltr">Wallet</div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-900/50 text-green-400 border border-green-500/30 space-x-2">
            <span className="font-cairo" dir="rtl">نشطة</span>
            <span>•</span>
            <span className="font-playfair" dir="ltr">Active</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        {/* إجمالي القيمة */}
        <div className="text-center p-3 bg-black/60 rounded-lg border border-primary/20 space-y-1">
          <div className="text-xs text-muted-foreground font-cairo" dir="rtl">إجمالي القيمة</div>
          <div className="text-2xl font-bold text-primary">${totalValue.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground font-playfair" dir="ltr">Total Value</div>
        </div>

        {/* قائمة الأرصدة */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Coins className="w-4 h-4" />
            <div className="space-y-1">
              <div className="text-right font-cairo" dir="rtl">الأرصدة</div>
              <div className="text-xs font-playfair" dir="ltr">Balances</div>
            </div>
          </div>
          
          {balances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد أرصدة متاحة</p>
              <p className="text-sm">سيتم إضافة أرصدة ابتدائية تلقائياً</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {balances.map((balance) => (
                <div
                  key={balance.id}
                  className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center text-white text-sm font-bold">
                      XP
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{balance.token.name}</div>
                      <div className="text-xs text-muted-foreground">
                        <span className="text-right">{balance.token.symbol}</span>
                      </div>
                      <div className="text-xs text-blue-600 font-playfair" dir="ltr">XP Points</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {balance.balance.toLocaleString('ar-SA', {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${(balance.balance * balance.token.exchange_rate_usd).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={onSwapClick}
            className="flex flex-col items-center gap-1 text-sm h-auto py-3"
            variant="default"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span className="font-cairo" dir="rtl">تبديل</span>
            <span className="text-xs font-playfair" dir="ltr">Swap</span>
          </Button>
          <Button 
            onClick={onWithdrawClick}
            variant="outline"
            className="flex flex-col items-center gap-1 text-sm h-auto py-3"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="font-cairo" dir="rtl">سحب</span>
            <span className="text-xs font-playfair" dir="ltr">Withdraw</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};