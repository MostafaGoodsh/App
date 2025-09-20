import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coins, ArrowRight, Info, Loader2 } from 'lucide-react';
import { usePointsConversion } from '@/hooks/usePointsConversion';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';

export const PointsToTokensConverter: React.FC = () => {
  const [pointsToConvert, setPointsToConvert] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const { publicKey, connected } = useSolanaWallet();
  
  const {
    loading,
    settings,
    pointsBalance,
    conversions,
    getConversionSettings,
    getPointsBalance,
    getConversions,
    convertPointsToTokens,
    calculateTokenAmount
  } = usePointsConversion();

  useEffect(() => {
    // Load initial data
    Promise.all([
      getConversionSettings(),
      getPointsBalance(),
      getConversions()
    ]);
  }, [getConversionSettings, getPointsBalance, getConversions]);

  const handleConvert = async () => {
    if (!connected || !publicKey) {
      alert('يرجى ربط محفظة Solana أولاً');
      return;
    }

    const points = parseInt(pointsToConvert);
    if (!points || points <= 0) {
      alert('يرجى إدخال عدد نقاط صحيح');
      return;
    }

    setIsConverting(true);
    try {
      await convertPointsToTokens(points, publicKey.toString());
      setPointsToConvert('');
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const isValidAmount = () => {
    const points = parseInt(pointsToConvert);
    if (!points || !settings || !pointsBalance) return false;
    
    return points >= settings.minimum_conversion_points && 
           points <= settings.maximum_conversion_points &&
           points <= pointsBalance.available_points;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'pending': return 'outline';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'processing': return 'قيد المعالجة';
      case 'pending': return 'في الانتظار';
      case 'failed': return 'فشل';
      default: return status;
    }
  };

  if (loading && !settings) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="mr-2">جارٍ التحميل...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Converter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            تحويل النقاط إلى Tokens
          </CardTitle>
          <CardDescription>
            حول نقاطك المكتسبة إلى {settings?.token_name || 'DevNet Tokens'} قابلة للتداول
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Points Balance */}
          {pointsBalance && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{pointsBalance.total_points}</div>
                <div className="text-sm text-muted-foreground">إجمالي النقاط</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{pointsBalance.available_points}</div>
                <div className="text-sm text-muted-foreground">متاح للتحويل</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{pointsBalance.converted_points}</div>
                <div className="text-sm text-muted-foreground">تم تحويله</div>
              </div>
            </div>
          )}

          {/* Conversion Settings Info */}
          {settings && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                معدل التحويل: {settings.points_to_token_rate} نقطة = 1 {settings.token_symbol}
                <br />
                الحد الأدنى: {settings.minimum_conversion_points} نقطة | 
                الحد الأقصى: {settings.maximum_conversion_points} نقطة
                <br />
                الحد اليومي: {settings.daily_conversion_limit} نقطة
              </AlertDescription>
            </Alert>
          )}

          {/* Conversion Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="points">عدد النقاط للتحويل</Label>
              <Input
                id="points"
                type="number"
                value={pointsToConvert}
                onChange={(e) => setPointsToConvert(e.target.value)}
                placeholder={`${settings?.minimum_conversion_points || 0} - ${settings?.maximum_conversion_points || 0}`}
                min={settings?.minimum_conversion_points || 0}
                max={Math.min(settings?.maximum_conversion_points || 0, pointsBalance?.available_points || 0)}
              />
            </div>

            {/* Preview */}
            {pointsToConvert && settings && (
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span>{pointsToConvert} نقطة</span>
                <ArrowRight className="h-4 w-4" />
                <span className="font-bold">
                  {calculateTokenAmount(parseInt(pointsToConvert)).toFixed(4)} {settings.token_symbol}
                </span>
              </div>
            )}

            {/* Wallet Status */}
            <div className="flex items-center gap-2">
              <Badge variant={connected ? "default" : "destructive"}>
                {connected ? `متصل: ${publicKey?.toString().slice(0, 8)}...` : "غير متصل"}
              </Badge>
            </div>

            <Button
              onClick={handleConvert}
              disabled={!connected || !isValidAmount() || isConverting}
              className="w-full"
            >
              {isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري التحويل...
                </>
              ) : (
                'تحويل النقاط'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conversion History */}
      <Card>
        <CardHeader>
          <CardTitle>تاريخ التحويلات</CardTitle>
          <CardDescription>
            آخر عمليات تحويل النقاط إلى tokens
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {conversions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد عمليات تحويل سابقة
            </div>
          ) : (
            <div className="space-y-3">
              {conversions.slice(0, 5).map((conversion) => (
                <div key={conversion.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {conversion.points_amount} نقطة → {conversion.token_amount} {settings?.token_symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(conversion.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge variant={getStatusColor(conversion.status)}>
                      {getStatusText(conversion.status)}
                    </Badge>
                    {conversion.transaction_signature && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {conversion.transaction_signature.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};