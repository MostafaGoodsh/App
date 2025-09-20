import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Coins, Shield, TrendingUp, Zap } from "lucide-react";
// import { usePointsConversion } from "@/hooks/usePointsConversion"; // تم إزالته مؤقتاً
import { useMining } from "@/hooks/useMining";
import { useEngagementStats } from "@/hooks/useEngagementStats";

export function AccountStatsCard() {
  // مؤقتاً - حتى يتم إعادة إنشاء النظام الجديد
  const pointsBalance = { total_points: 0, available_points: 0, converted_points: 0 };
  const getPointsBalance = () => {};
  const pointsLoading = false;
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
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-bold text-white arabic-text">إحصائيات الحساب</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={pointsLoading || miningLoading || statsLoading}
          className="arabic-text border-gray-600 hover:bg-gray-800 text-white"
        >
          <RefreshCw className={`w-4 h-4 ml-2 ${(pointsLoading || miningLoading || statsLoading) ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Points Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-gray-900 rounded-md p-3 border border-gray-700">
            <div className="flex items-center justify-end gap-2 mb-1">
              <h3 className="text-sm font-medium text-white arabic-text">إجمالي النقاط</h3>
              <Coins className="w-4 h-4 text-gray-300" />
            </div>
            <div className="text-lg font-bold text-white text-right">
              {pointsBalance ? formatNumber(pointsBalance.total_points) : '0'}
            </div>
            <p className="text-xs text-gray-400 arabic-text text-right">نقطة مكتسبة</p>
          </div>

          <div className="bg-gray-900 rounded-md p-3 border border-gray-700">
            <div className="flex items-center justify-end gap-2 mb-1">
              <h3 className="text-sm font-medium text-white arabic-text">النقاط المتاحة</h3>
              <Zap className="w-4 h-4 text-gray-300" />
            </div>
            <div className="text-lg font-bold text-white text-right">
              {pointsBalance ? formatNumber(pointsBalance.available_points) : '0'}
            </div>
            <p className="text-xs text-gray-400 arabic-text text-right">قابلة للتحويل</p>
          </div>

          <div className="bg-gray-900 rounded-md p-3 border border-gray-700">
            <div className="flex items-center justify-end gap-2 mb-1">
              <h3 className="text-sm font-medium text-white arabic-text">النقاط المحولة</h3>
              <TrendingUp className="w-4 h-4 text-gray-300" />
            </div>
            <div className="text-lg font-bold text-white text-right">
              {pointsBalance ? formatNumber(pointsBalance.converted_points) : '0'}
            </div>
            <p className="text-xs text-gray-400 arabic-text text-right">تم تحويلها</p>
          </div>
        </div>

        {/* Account Strength & Mining */}
        <div className="bg-gray-900 rounded-md p-3 border border-gray-700">
          <div className="flex items-center justify-end gap-2 mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white arabic-text">قوة الحساب</h3>
              <Shield className="w-4 h-4 text-gray-300" />
            </div>
            <Badge className={`${status.color} text-white text-xs`}>
              {status.text}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm text-gray-400 arabic-text">نقطة قوة</span>
              <span className="text-lg font-bold text-white">
                {miningProfile ? formatNumber(miningProfile.account_strength) : formatNumber(stats?.profile_completion_score || 0)}
              </span>
            </div>

            {currentLevel && (
              <div className="space-y-1">
                <div className="flex justify-end text-sm text-right">
                  <span className="text-gray-400 arabic-text">
                    المستوى الحالي: {currentLevel.level_name}
                  </span>
                </div>
                <div className="flex justify-end text-xs text-right">
                  <span className="text-gray-500 arabic-text">
                    {nextLevel ? `المستوى التالي: ${nextLevel.level_name}` : 'المستوى الأقصى'}
                  </span>
                </div>
                {nextLevel && (
                  <Progress 
                    value={levelProgress} 
                    className="h-1 bg-gray-700" 
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mining Stats */}
        {miningProfile && (
          <div className="bg-gray-900 rounded-md p-3 border border-gray-700">
            <h3 className="font-medium text-white mb-2 arabic-text text-right">إحصائيات التعدين</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-right">
                <p className="text-sm text-gray-400 arabic-text">إجمالي المُعدن</p>
                <p className="text-lg font-bold text-white">
                  {formatNumber(Number(miningProfile.total_mined))}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 arabic-text">معدل التعدين/ساعة</p>
                <p className="text-lg font-bold text-white">
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