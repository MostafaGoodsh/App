import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternalWallet } from '@/hooks/useInternalWallet';
import { WithdrawalDialog } from './WithdrawalDialog';
import { Coins, ArrowUpRight, Wallet, TrendingUp } from 'lucide-react';

interface HybridWalletCardProps {
  onSwapClick?: () => void;
  onWithdrawClick?: () => void;
}

export const HybridWalletCard = ({ onSwapClick, onWithdrawClick }: HybridWalletCardProps) => {
  const { balances, getTotalUSDValue, isLoading } = useInternalWallet();
  const [showWithdrawalDialog, setShowWithdrawalDialog] = React.useState(false);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          <span className="text-right">المحفظة | Wallet</span>
        </CardTitle>
        <CardDescription>نظام موحد سريع - Unified System</CardDescription>
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
            <div className="text-right">
              <div className="text-lg">المحفظة</div>
              <div className="text-sm font-normal text-muted-foreground text-left">Wallet</div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            نشطة • Active
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* إجمالي القيمة */}
        <div className="text-center p-3 bg-white/50 rounded-lg border">
          <div className="text-xs text-muted-foreground mb-1">
            <span className="text-right inline-block w-full">إجمالي القيمة</span>
            <span className="text-left inline-block w-full">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-primary">${totalValue.toFixed(2)}</div>
        </div>

        {/* قائمة الأرصدة */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Coins className="w-4 h-4" />
            <span className="text-right">الأرصدة</span>
            <span className="text-left text-xs">Balances</span>
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center text-white text-sm font-bold">
                      XP
                    </div>
                    <div>
                      <div className="font-medium text-sm">{balance.token.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="text-right">{balance.token.symbol}</span>
                        <span className="text-blue-600 text-left">• XP Points</span>
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
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={onSwapClick}
            className="flex items-center gap-2 text-sm"
            variant="default"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-right">تبديل</span>
            <span className="text-left text-xs">Swap</span>
          </Button>
          <Button 
            onClick={() => setShowWithdrawalDialog(true)}
            variant="outline"
            className="flex items-center gap-2 text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-right">سحب</span>
            <span className="text-left text-xs">Withdraw</span>
          </Button>
        </div>
      </CardContent>
      
      <WithdrawalDialog 
        open={showWithdrawalDialog}
        onOpenChange={setShowWithdrawalDialog}
      />
    </Card>
  );
};