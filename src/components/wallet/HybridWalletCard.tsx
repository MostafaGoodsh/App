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
            المحفظة الهجين
          </CardTitle>
          <CardDescription>محفظة داخلية مع إمكانية السحب الحقيقي</CardDescription>
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
    <Card className="w-full bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            المحفظة الهجين
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            نشطة
          </Badge>
        </CardTitle>
        <CardDescription>
          نظام محفظة هجين يجمع بين السرعة الداخلية والسحب الحقيقي
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* إجمالي القيمة */}
        <div className="text-center p-4 bg-white/50 rounded-lg border">
          <div className="text-sm text-muted-foreground mb-1">إجمالي القيمة</div>
          <div className="text-2xl font-bold text-primary">${totalValue.toFixed(2)}</div>
        </div>

        {/* قائمة الأرصدة */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Coins className="w-4 h-4" />
            أرصدة العملات
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
                  className="flex items-center justify-between p-3 bg-white/30 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                      {balance.token.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium">{balance.token.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {balance.token.symbol}
                      </div>
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
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={onSwapClick}
            className="flex items-center gap-2"
            variant="default"
          >
            <ArrowUpRight className="w-4 h-4" />
            تبديل سريع
          </Button>
          <Button 
            onClick={onWithdrawClick}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            سحب حقيقي
          </Button>
        </div>

        <div className="text-xs text-center text-muted-foreground bg-blue-50 p-2 rounded">
          💡 التبديل الداخلي فوري ومجاني، السحب الحقيقي يتطلب رسوم شبكة
        </div>
      </CardContent>
    </Card>
  );
};