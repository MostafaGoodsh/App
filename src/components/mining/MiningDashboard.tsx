import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMining } from '@/hooks/useMining';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Play, Pause, TrendingUp, Zap, Trophy, Coins, Clock, BarChart3, Target, Gem } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MiningDashboard = () => {
  const { profile, levels, history, loading, error, updateMiningProgress, toggleMining, getCurrentLevel, getNextLevel, getProgressToNextLevel, getMiningRatePerMinute } = useMining();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [currentMined, setCurrentMined] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!profile?.is_mining_active) return;
    const ratePerMinute = getMiningRatePerMinute();
    if (ratePerMinute <= 0) return;
    const interval = setInterval(() => { setCurrentMined(prev => prev + (ratePerMinute / 60)); }, 1000);
    return () => clearInterval(interval);
  }, [profile?.is_mining_active, getMiningRatePerMinute]);

  const handleUpdateProgress = async () => {
    setIsUpdating(true);
    try {
      const result = await updateMiningProgress();
      if (result) {
        setCurrentMined(0);
        toast({ title: t("تم التحديث"), description: `${t("إجمالي التعدين")}: ${result.mined_amount.toFixed(8)} $MS-RA` });
      }
    } catch {
      toast({ variant: "destructive", title: t("خطأ"), description: t("فشل في تحديث التعدين") });
    } finally { setIsUpdating(false); }
  };

  const handleToggleMining = async () => {
    if (!profile) return;
    try {
      await toggleMining(!profile.is_mining_active);
      toast({
        title: profile.is_mining_active ? t("تم إيقاف التعدين") : t("تم تشغيل التعدين"),
        description: profile.is_mining_active ? t("التعدين متوقف الآن") : t("التعدين يعمل الآن"),
      });
    } catch {
      toast({ variant: "destructive", title: t("خطأ"), description: t("فشل في تغيير حالة التعدين") });
    }
  };

  const chartData = history.map(item => ({ time: new Date(item.hour_timestamp).getHours() + ':00', amount: parseFloat(item.amount_mined.toString()), rate: parseFloat(item.mining_rate.toString()) }));
  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNext = getProgressToNextLevel();

  if (loading) {
    return (<div className="p-6"><div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div><p className="text-muted-foreground mt-2">{t("جاري تحميل بيانات التعدين...")}</p></div></div>);
  }

  if (error) {
    return (<div className="p-6"><Card><CardContent className="text-center py-8"><p className="text-destructive">{t("خطأ")}: {error}</p><Button onClick={() => window.location.reload()} className="mt-4">{t("إعادة المحاولة")}</Button></CardContent></Card></div>);
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-cairo">{t("لوحة التعدين")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground font-cairo">{t("تتبع تقدم التعدين وقوة حسابك")}</p>
        </div>
        <Button onClick={handleToggleMining} variant={profile?.is_mining_active ? "destructive" : "default"} size="sm" className="w-full sm:w-auto font-cairo">
          {profile?.is_mining_active ? (<><Pause className="h-4 w-4 ml-2" />{t("إيقاف التعدين")}</>) : (<><Play className="h-4 w-4 ml-2" />{t("بدء التعدين")}</>)}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium font-cairo">{t("إجمالي التعدين")}</CardTitle>
            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-base sm:text-lg md:text-2xl font-bold truncate">{((profile?.total_mined || 0) + currentMined).toFixed(6)}</div>
            <p className="text-xs text-muted-foreground" dir="ltr">$MS-RA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium font-cairo">{t("معدل التعدين")}</CardTitle>
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-warning flex-shrink-0" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-base sm:text-lg md:text-2xl font-bold truncate">{profile?.mining_rate_per_hour || 0}</div>
            <p className="text-xs text-muted-foreground" dir="ltr">$MS-RA/h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium font-cairo">{t("قوة الحساب")}</CardTitle>
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-lg sm:text-2xl font-bold">{profile?.account_strength || 0}</div>
            <p className="text-xs text-muted-foreground font-cairo">{t("نقطة")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium font-cairo">{t("المستوى الحالي")}</CardTitle>
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-warning flex-shrink-0" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-base sm:text-lg md:text-2xl font-bold truncate">{currentLevel?.level_name || t('غير محدد')}</div>
            <p className="text-xs text-muted-foreground">#{profile?.current_level || 1}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-cairo"><Clock className="h-5 w-5" />{t("حالة التعدين")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant={profile?.is_mining_active ? "default" : "secondary"} className="font-cairo">
                {profile?.is_mining_active ? t("نشط") : t("متوقف")}
              </Badge>
              {profile?.is_mining_active && (
                <span className="text-sm text-muted-foreground">{t("التعدين منذ:")} {new Date(profile.last_mining_update).toLocaleString('ar-SA')}</span>
              )}
            </div>
            <Button onClick={handleUpdateProgress} disabled={isUpdating} variant="outline" size="sm">
              {isUpdating ? t("جاري التحديث...") : t("تحديث الآن")}
            </Button>
          </div>
          {profile?.is_mining_active && currentMined > 0 && (
            <div className="bg-black/60 p-3 rounded-lg border border-primary/20">
              <p className="text-sm font-medium font-cairo">{t("التعدين الحالي")}</p>
              <p className="text-lg font-bold text-primary" dir="ltr">+{currentMined.toFixed(8)} $MS-RA</p>
              <p className="text-xs text-muted-foreground font-cairo">{t("سيتم إضافتها عند التحديث التالي")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-cairo"><Gem className="h-5 w-5" />{t("تقدم المستوى")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium font-cairo">{currentLevel?.level_name} → {nextLevel?.level_name || t('الحد الأقصى')}</span>
              <span className="text-sm text-muted-foreground">{progressToNext.toFixed(1)}%</span>
            </div>
            <Progress value={progressToNext} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground font-cairo">
              <span>{t("قوة الحساب")}: {profile?.account_strength || 0}</span>
              <span>{t("القوة المطلوبة:")} {nextLevel?.required_account_strength || t('مكتمل')}</span>
            </div>
            {nextLevel && (
              <div className="bg-black/60 p-3 rounded-lg border border-primary/20">
                <p className="text-sm font-medium font-cairo">{t("المستوى التالي")}</p>
                <p className="text-lg font-bold font-cairo">{nextLevel.level_name}</p>
                <p className="text-xs text-muted-foreground font-cairo">{t("معدل التعدين:")} <span dir="ltr">{nextLevel.mining_rate_per_hour} $MS-RA/h</span></p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-cairo"><BarChart3 className="h-5 w-5" />{t("التعدين خلال 24 ساعة")}</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => [value.toFixed(8), '$MS-RA']} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-cairo">{t("لا توجد بيانات تعدين خلال الـ 24 ساعة الماضية")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-cairo"><TrendingUp className="h-5 w-5" />{t("مستويات التعدين")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels.map((level) => (
              <div key={level.level_number} className={`p-4 rounded-lg border-2 transition-all ${level.level_number === profile?.current_level ? 'border-primary bg-primary/5' : level.level_number < (profile?.current_level || 1) ? 'border-success bg-success/5' : 'border-muted bg-black/50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium font-cairo">{level.level_name}</h3>
                  <Badge variant={level.level_number === profile?.current_level ? 'default' : level.level_number < (profile?.current_level || 1) ? 'secondary' : 'outline'}>
                    {t("المستوى")} {level.level_number}
                  </Badge>
                </div>
                <Separator className="my-2" />
                <div className="space-y-1 text-sm font-cairo">
                  <p><span className="text-muted-foreground">{t("القوة المطلوبة:")}</span> <span className="font-medium">{level.required_account_strength}</span></p>
                  <p><span className="text-muted-foreground">{t("معدل التعدين:")}</span> <span className="font-medium" dir="ltr">{level.mining_rate_per_hour} $MS-RA/h</span></p>
                  {level.upgrade_cost > 0 && (<p><span className="text-muted-foreground">{t("تكلفة الترقية:")}</span> <span className="font-medium" dir="ltr">{level.upgrade_cost} $MS-RA</span></p>)}
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
