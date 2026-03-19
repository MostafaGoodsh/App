import { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Lock, Activity, TrendingUp, Waves, Droplets, BarChart3,
  ArrowDownCircle, ArrowUpCircle, Zap, Settings2,
  Coins, Pickaxe, Trophy, Gamepad2, ShoppingCart,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import type { useLiquidityPool } from '@/hooks/useLiquidityPool';

type PoolHook = ReturnType<typeof useLiquidityPool>;

interface TokenStats {
  totalXP: number;
  totalMSRA: number;
  msraFromMining: number;
  msraFromRewards: number;
  msraFromGames: number;
  msraFromPresale: number;
}

interface ChartPoint {
  day: string;
  tvl: number;
  xp: number;
  msra: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-md border border-primary/30 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs font-bold" style={{ color: p.color }}>
          {p.name}: {p.name === 'TVL' ? `$${(p.value / 1000).toFixed(1)}K` : p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export const PoolOverviewTab = ({ pool }: { pool: PoolHook }) => {
  const { t } = useLanguage();
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    totalXP: 0, totalMSRA: 0, msraFromMining: 0, msraFromRewards: 0, msraFromGames: 0, msraFromPresale: 0,
  });
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real-time token stats and chart data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Total XP across all users
        const { data: xpData } = await supabase
          .from('internal_wallet_balances')
          .select('balance, token_id')
          .in('token_id', (await supabase.from('internal_tokens').select('id').eq('symbol', 'XP')).data?.map(t => t.id) || []);
        
        const totalXP = (xpData || []).reduce((sum, b) => sum + (b.balance || 0), 0);

        // 2. Total MS-RA across all users
        const { data: msraTokens } = await supabase.from('internal_tokens').select('id').eq('symbol', 'MSRA');
        const msraTokenId = msraTokens?.[0]?.id;
        
        let totalMSRA = 0;
        if (msraTokenId) {
          const { data: msraData } = await supabase
            .from('internal_wallet_balances')
            .select('balance')
            .eq('token_id', msraTokenId);
          totalMSRA = (msraData || []).reduce((sum, b) => sum + (b.balance || 0), 0);
        }

        // 3. MS-RA from mining
        const { data: miningData } = await supabase
          .from('user_mining_profiles')
          .select('total_mined');
        const msraFromMining = (miningData || []).reduce((sum, m) => sum + (m.total_mined || 0), 0);

        // 4. MS-RA from games (wheel) - from liquidity transactions
        const { data: gamesTx } = await supabase
          .from('liquidity_transactions')
          .select('amount')
          .in('source_type', ['wheel_win_tax', 'wheel_loss', 'wheel_spin_cost', 'wheel_bonus_tax']);
        const msraFromGames = (gamesTx || []).reduce((sum, tx) => sum + (tx.amount || 0), 0);

        // 5. MS-RA from presale (payments)
        const { data: presaleTx } = await supabase
          .from('liquidity_transactions')
          .select('amount')
          .eq('source_type', 'payment');
        const msraFromPresale = (presaleTx || []).reduce((sum, tx) => sum + (tx.amount || 0), 0);

        // 6. MS-RA from rewards (referrals, conversions, etc.)
        const msraFromRewards = Math.max(0, totalMSRA - msraFromMining - msraFromGames - msraFromPresale);

        setTokenStats({
          totalXP,
          totalMSRA: totalMSRA + msraFromMining,
          msraFromMining,
          msraFromRewards,
          msraFromGames,
          msraFromPresale,
        });

        // 7. Build chart data from real transactions (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: txHistory } = await supabase
          .from('liquidity_transactions')
          .select('amount, created_at, source_type')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        const dayMap = new Map<string, { tvl: number; xp: number; msra: number }>();
        let runningTvl = pool.activePool ? pool.activePool.total_value_locked : 0;
        
        // Initialize last 30 days
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
          dayMap.set(key, { tvl: 0, xp: 0, msra: 0 });
        }

        // Accumulate transaction data
        (txHistory || []).forEach(tx => {
          const d = new Date(tx.created_at);
          const key = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
          const entry = dayMap.get(key);
          if (entry) {
            entry.tvl += tx.amount || 0;
            if (['wheel_win_tax', 'wheel_loss', 'wheel_spin_cost', 'wheel_bonus_tax'].includes(tx.source_type || '')) {
              entry.msra += tx.amount || 0;
            }
            if (tx.source_type === 'payment') {
              entry.xp += tx.amount || 0;
            }
          }
        });

        // Convert to cumulative chart
        let cumulativeTvl = Math.max(0, runningTvl - Array.from(dayMap.values()).reduce((s, v) => s + v.tvl, 0));
        const chart: ChartPoint[] = [];
        dayMap.forEach((val, key) => {
          cumulativeTvl += val.tvl;
          chart.push({ day: key, tvl: Math.round(cumulativeTvl), xp: Math.round(val.xp), msra: Math.round(val.msra) });
        });

        setChartData(chart);
      } catch (err) {
        console.error('Error fetching pool stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Real-time subscription for live updates
    const channel = supabase
      .channel('pool-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'liquidity_transactions' }, () => {
        fetchStats();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'internal_wallet_balances' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pool.activePool?.id]);

  const ap = pool.activePool;
  if (!ap) return null;

  const stats = [
    { label: t('إجمالي القيمة المقفلة', 'Total Value Locked'), en: 'TVL', value: `$${(ap.total_value_locked / 1000).toFixed(0)}K`, icon: Lock, trend: '+12.5%' },
    { label: t('حجم التداول 24س', '24h Volume'), en: '24h Vol', value: `$${(ap.total_volume_24h / 1000).toFixed(0)}K`, icon: Activity, trend: '+5.3%' },
    { label: t('العائد السنوي', 'Annual Yield'), en: 'APY', value: `${ap.apy_percentage}%`, icon: TrendingUp, trend: '+2.1%' },
    { label: t('مزودي السيولة', 'Providers'), en: 'Providers', value: `${ap.providers_count}`, icon: Waves, trend: '+8' },
  ];

  const msraBreakdown = [
    { label: t('تعدين', 'Mining'), value: tokenStats.msraFromMining, icon: Pickaxe, color: 'text-amber-400' },
    { label: t('جوائز', 'Rewards'), value: tokenStats.msraFromRewards, icon: Trophy, color: 'text-purple-400' },
    { label: t('ألعاب', 'Games'), value: tokenStats.msraFromGames, icon: Gamepad2, color: 'text-cyan-400' },
    { label: t('بيع مبكر', 'Presale'), value: tokenStats.msraFromPresale, icon: ShoppingCart, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-card/80 backdrop-blur-sm border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-green-400 flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />{stat.trend}
                  </span>
                </div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[9px] text-muted-foreground font-cairo">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Token Totals - XP & MS-RA */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardContent className="p-3 text-center">
            <Coins className="w-5 h-5 text-foreground mx-auto mb-1" />
            <p className="text-lg font-bold" dir="ltr">{tokenStats.totalXP.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground font-cairo">
              {t('إجمالي XP المتداول', 'Total XP in Circulation')}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm border-amber-500/20">
          <CardContent className="p-3 text-center">
            <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-amber-400" dir="ltr">{tokenStats.totalMSRA.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground font-cairo">
              {t('إجمالي $MS-RA', 'Total $MS-RA')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MS-RA Breakdown */}
      <Card className="bg-card/80 backdrop-blur-sm border-amber-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-cairo">{t('توزيع $MS-RA', '$MS-RA Distribution')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {msraBreakdown.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/30">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" dir="ltr">{item.value.toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground font-cairo">{item.label}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* User Position Summary */}
      {pool.totalDeposited > 0 && (
        <Card className="bg-primary/5 border-primary/30">
          <CardContent className="p-4">
            <h3 className="font-cairo text-sm font-bold mb-3 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" /> {t('مركزك في المجمع', 'Your Pool Position')}
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-primary">${pool.totalDeposited.toFixed(2)}</p>
                <p className="text-[9px] text-muted-foreground font-cairo">{t('إجمالي الإيداع', 'Total Deposited')}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-400">${pool.totalRewards.toFixed(2)}</p>
                <p className="text-[9px] text-muted-foreground font-cairo">{t('الأرباح', 'Earnings')}</p>
              </div>
              <div>
                <p className="text-lg font-bold">{pool.totalLpTokens.toFixed(2)}</p>
                <p className="text-[9px] text-muted-foreground font-cairo">LP Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="font-cairo">{t('مخطط TVL', 'TVL Chart')} - {ap.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-1 sm:p-2">
          <div className="h-[200px] sm:h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="msraGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tvl" name="TVL" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#tvlGrad)" />
                <Area type="monotone" dataKey="msra" name="$MS-RA" stroke="#F59E0B" strokeWidth={1.5} fill="url(#msraGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Auto Routing Info */}
      {pool.autoRouting.length > 0 && (
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-cairo">{t('التحويل التلقائي للمجمع', 'Auto-Routing to Pool')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pool.autoRouting.map(route => (
              <div key={route.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs font-cairo">{route.description || route.source_type}</span>
                </div>
                <Badge variant={route.is_active ? 'default' : 'secondary'} className="text-[9px]">
                  {route.routing_percentage}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
