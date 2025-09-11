import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Coins, Shield, TrendingUp, Zap } from "lucide-react";
import { usePointsConversion } from "@/hooks/usePointsConversion";
import { useMining } from "@/hooks/useMining";
import { useEngagementStats } from "@/hooks/useEngagementStats";

export function AccountStatsCard() {
  const { pointsBalance, getPointsBalance, loading: pointsLoading } = usePointsConversion();
  const { 
    profile: miningProfile, 
    updateMiningProgress, 
    getCurrentLevel, 
    getNextLevel,
    getProgressToNextLevel,
    loading: miningLoading 
  } = useMining();
  const { stats, updateEngagementStats, loading: statsLoading } = useEngagementStats();

  // Auto-refresh data every minute
  useEffect(() => {
    const interval = setInterval(() => {
      getPointsBalance();
      updateMiningProgress();
      updateEngagementStats();
    }, 60000);

    return () => clearInterval(interval);
  }, [getPointsBalance, updateMiningProgress, updateEngagementStats]);

  const handleRefresh = async () => {
    await Promise.all([
      getPointsBalance(),
      updateMiningProgress(),
      updateEngagementStats()
    ]);
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const levelProgress = getProgressToNextLevel();

  const formatNumber = (num: number) => {
    return num.toLocaleString('ar-SA');
  };

  const getMiningStatus = () => {
    if (!miningProfile) return { text: "غير نشط", color: "bg-red-500" };
    return miningProfile.is_mining_active 
      ? { text: "نشط", color: "bg-green-500" }
      : { text: "متوقف", color: "bg-yellow-500" };
  };

  const status = getMiningStatus();

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-bold arabic-text">إحصائيات الحساب</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={pointsLoading || miningLoading || statsLoading}
          className="arabic-text"
        >
          <RefreshCw className={`w-4 h-4 ml-2 ${(pointsLoading || miningLoading || statsLoading) ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-800 arabic-text">إجمالي النقاط</h3>
              <Coins className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {pointsBalance ? formatNumber(pointsBalance.total_points) : '0'}
            </div>
            <p className="text-xs text-blue-600 arabic-text">نقطة مكتسبة</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-green-800 arabic-text">النقاط المتاحة</h3>
              <Zap className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">
              {pointsBalance ? formatNumber(pointsBalance.available_points) : '0'}
            </div>
            <p className="text-xs text-green-600 arabic-text">قابلة للتحويل</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-purple-800 arabic-text">النقاط المحولة</h3>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {pointsBalance ? formatNumber(pointsBalance.converted_points) : '0'}
            </div>
            <p className="text-xs text-purple-600 arabic-text">تم تحويلها</p>
          </div>
        </div>

        {/* Account Strength & Mining */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              <h3 className="font-medium text-yellow-800 arabic-text">قوة الحساب</h3>
            </div>
            <Badge className={`${status.color} text-white text-xs`}>
              {status.text}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-yellow-900">
                {miningProfile ? formatNumber(miningProfile.account_strength) : formatNumber(stats?.profile_completion_score || 0)}
              </span>
              <span className="text-sm text-yellow-700 arabic-text">نقطة قوة</span>
            </div>

            {currentLevel && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-700 arabic-text">
                    {nextLevel ? `المستوى التالي: ${nextLevel.level_name}` : 'المستوى الأقصى'}
                  </span>
                  <span className="text-yellow-600 arabic-text">
                    المستوى الحالي: {currentLevel.level_name}
                  </span>
                </div>
                {nextLevel && (
                  <Progress 
                    value={levelProgress} 
                    className="h-2 bg-yellow-200" 
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mining Stats */}
        {miningProfile && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-medium text-emerald-800 mb-3 arabic-text">إحصائيات التعدين</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-emerald-600 arabic-text">إجمالي المُعدن</p>
                <p className="text-lg font-bold text-emerald-900">
                  {formatNumber(Number(miningProfile.total_mined))}
                </p>
              </div>
              <div>
                <p className="text-sm text-emerald-600 arabic-text">معدل التعدين/ساعة</p>
                <p className="text-lg font-bold text-emerald-900">
                  {Number(miningProfile.mining_rate_per_hour).toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground arabic-text text-center">
          آخر تحديث: {new Date().toLocaleString('ar-SA')}
        </div>
      </CardContent>
    </Card>
  );
}