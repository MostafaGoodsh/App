import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWithdrawal } from '@/hooks/useWithdrawal';
import { 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Loader2,
  History
} from 'lucide-react';

interface WithdrawalHistoryProps {
  className?: string;
}

export const WithdrawalHistory = ({ className }: WithdrawalHistoryProps) => {
  const { withdrawals, getWithdrawals, loading } = useWithdrawal();

  useEffect(() => {
    getWithdrawals();
  }, [getWithdrawals]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">مكتمل</Badge>;
      case 'failed':
        return <Badge variant="destructive">فاشل</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">قيد المعالجة</Badge>;
      default:
        return <Badge variant="outline">معلق</Badge>;
    }
  };

  const openTxInExplorer = (txHash: string, targetToken: string) => {
    if (!txHash) return;
    
    let explorerUrl = '';
    switch (targetToken) {
      case 'SOL':
      case 'USDC':
        explorerUrl = `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
        break;
      case 'BTC':
        explorerUrl = `https://blockstream.info/tx/${txHash}`;
        break;
      case 'ETH':
        explorerUrl = `https://etherscan.io/tx/${txHash}`;
        break;
      default:
        return;
    }
    window.open(explorerUrl, '_blank');
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            تاريخ السحوبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          تاريخ السحوبات
        </CardTitle>
        <CardDescription>
          جميع عمليات السحب الحقيقي التي قمت بها
        </CardDescription>
      </CardHeader>
      <CardContent>
        {withdrawals.length === 0 ? (
          <div className="text-center py-8">
            <ArrowUpRight className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">لا توجد عمليات سحب بعد</p>
            <p className="text-sm text-muted-foreground">
              ستظهر عمليات السحب الحقيقي هنا عند قيامك بها
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full border">
                    {getStatusIcon(withdrawal.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {withdrawal.internal_amount} → {withdrawal.target_amount} {withdrawal.target_token}
                      </span>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(withdrawal.created_at).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      إلى: {withdrawal.target_address.slice(0, 6)}...{withdrawal.target_address.slice(-6)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {withdrawal.transaction_hash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openTxInExplorer(withdrawal.transaction_hash!, withdrawal.target_token)}
                      className="text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      عرض المعاملة
                    </Button>
                  )}
                  
                  {withdrawal.status === 'completed' && withdrawal.processed_at && (
                    <div className="text-xs text-green-600 text-right">
                      تم في {new Date(withdrawal.processed_at).toLocaleDateString('ar-SA')}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {withdrawals.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  عرض المزيد
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};