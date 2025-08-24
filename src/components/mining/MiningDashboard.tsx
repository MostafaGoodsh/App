import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMining } from '@/hooks/useMining';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  TrendingUp, 
  Zap, 
  Trophy, 
  Coins, 
  Clock,
  BarChart3,
  Target,
  Gem
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MiningDashboard = () => {
  const { 
    profile, 
    levels, 
    history, 
    loading, 
    error, 
    updateMiningProgress,
    toggleMining,
    getCurrentLevel,
    getNextLevel,
    getProgressToNextLevel,
    getMiningRatePerMinute
  } = useMining();
  
  const { toast } = useToast();
  const [currentMined, setCurrentMined] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Real-time mining simulation
  useEffect(() => {
    if (!profile?.is_mining_active) return;
    
    const ratePerMinute = getMiningRatePerMinute();
    if (ratePerMinute <= 0) return;

    const interval = setInterval(() => {
      setCurrentMined(prev => prev + (ratePerMinute / 60)); // Per second
    }, 1000);

    return () => clearInterval(interval);
  }, [profile?.is_mining_active, getMiningRatePerMinute]);

  // Update mining progress
  const handleUpdateProgress = async () => {
    setIsUpdating(true);
    try {
      const result = await updateMiningProgress();
      if (result) {
        setCurrentMined(0); // Reset display counter
        toast({
          title: "تم التحديث",
          description: `تم تعدين ${result.mined_amount.toFixed(8)} عملة`,
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحديث التعدين",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle mining status
  const handleToggleMining = async () => {
    if (!profile) return;
    
    try {
      await toggleMining(!profile.is_mining_active);
      toast({
        title: profile.is_mining_active ? "تم إيقاف التعدين" : "تم تشغيل التعدين",
        description: profile.is_mining_active ? "التعدين متوقف الآن" : "التعدين يعمل الآن",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تغيير حالة التعدين",
      });
    }
  };

  // Prepare chart data
  const chartData = history.map(item => ({
    time: new Date(item.hour_timestamp).getHours() + ':00',
    amount: parseFloat(item.amount_mined.toString()),
    rate: parseFloat(item.mining_rate.toString())
  }));

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNext = getProgressToNextLevel();

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">جاري تحميل بيانات التعدين...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-destructive">خطأ: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة التعدين</h1>
          <p className="text-muted-foreground">تتبع تقدم التعدين وقوة حسابك</p>
        </div>
        <Button
          onClick={handleToggleMining}
          variant={profile?.is_mining_active ? "destructive" : "default"}
          size="lg"
        >
          {profile?.is_mining_active ? (
            <>
              <Pause className="h-5 w-5 mr-2" />
              إيقاف التعدين
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              بدء التعدين
            </>
          )}
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Mined */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التعدين</CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((profile?.total_mined || 0) + currentMined).toFixed(8)}
            </div>
            <p className="text-xs text-muted-foreground">عملة Ms-Ra</p>
          </CardContent>
        </Card>

        {/* Mining Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التعدين</CardTitle>
            <Zap className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.mining_rate_per_hour || 0}
            </div>
            <p className="text-xs text-muted-foreground">عملة/ساعة</p>
          </CardContent>
        </Card>

        {/* Account Strength */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قوة الحساب</CardTitle>
            <Target className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.account_strength || 0}
            </div>
            <p className="text-xs text-muted-foreground">نقطة قوة</p>
          </CardContent>
        </Card>

        {/* Current Level */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستوى الحالي</CardTitle>
            <Trophy className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentLevel?.level_name || 'غير محدد'}
            </div>
            <p className="text-xs text-muted-foreground">
              المستوى {profile?.current_level || 1}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mining Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            حالة التعدين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant={profile?.is_mining_active ? "default" : "secondary"}>
                {profile?.is_mining_active ? "نشط" : "متوقف"}
              </Badge>
              {profile?.is_mining_active && (
                <span className="text-sm text-muted-foreground">
                  التعدين منذ: {new Date(profile.last_mining_update).toLocaleString('ar-SA')}
                </span>
              )}
            </div>
            <Button 
              onClick={handleUpdateProgress} 
              disabled={isUpdating}
              variant="outline"
              size="sm"
            >
              {isUpdating ? "جاري التحديث..." : "تحديث الآن"}
            </Button>
          </div>

          {profile?.is_mining_active && currentMined > 0 && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">التعدين الحالي</p>
              <p className="text-lg font-bold text-primary">
                +{currentMined.toFixed(8)} عملة
              </p>
              <p className="text-xs text-muted-foreground">
                سيتم إضافتها عند التحديث التالي
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gem className="h-5 w-5" />
              تقدم المستوى
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {currentLevel?.level_name} → {nextLevel?.level_name || 'الحد الأقصى'}
              </span>
              <span className="text-sm text-muted-foreground">
                {progressToNext.toFixed(1)}%
              </span>
            </div>
            
            <Progress value={progressToNext} className="w-full" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                قوة الحساب: {profile?.account_strength || 0}
              </span>
              <span>
                المطلوب: {nextLevel?.required_account_strength || 'مكتمل'}
              </span>
            </div>

            {nextLevel && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">المستوى التالي</p>
                <p className="text-lg font-bold">{nextLevel.level_name}</p>
                <p className="text-xs text-muted-foreground">
                  معدل التعدين: {nextLevel.mining_rate_per_hour} عملة/ساعة
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mining History Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              التعدين خلال 24 ساعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'عملة', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [value.toFixed(8), 'عملة']}
                    labelFormatter={(label) => `الساعة: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد بيانات تعدين خلال الـ 24 ساعة الماضية</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mining Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            مستويات التعدين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels.map((level) => (
              <div
                key={level.level_number}
                className={`p-4 rounded-lg border-2 transition-all ${
                  level.level_number === profile?.current_level
                    ? 'border-primary bg-primary/5'
                    : level.level_number < (profile?.current_level || 1)
                    ? 'border-success bg-success/5'
                    : 'border-muted bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{level.level_name}</h3>
                  <Badge
                    variant={
                      level.level_number === profile?.current_level
                        ? 'default'
                        : level.level_number < (profile?.current_level || 1)
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    المستوى {level.level_number}
                  </Badge>
                </div>
                <Separator className="my-2" />
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">القوة المطلوبة:</span>{' '}
                    <span className="font-medium">{level.required_account_strength}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">معدل التعدين:</span>{' '}
                    <span className="font-medium">{level.mining_rate_per_hour} عملة/ساعة</span>
                  </p>
                  {level.upgrade_cost > 0 && (
                    <p>
                      <span className="text-muted-foreground">تكلفة الترقية:</span>{' '}
                      <span className="font-medium">{level.upgrade_cost} عملة</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MiningDashboard;