import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Lock, Activity, TrendingUp, Waves, Droplets, BarChart3,
  ArrowDownCircle, ArrowUpCircle, Zap, Settings2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { useLiquidityPool } from '@/hooks/useLiquidityPool';

type PoolHook = ReturnType<typeof useLiquidityPool>;

const generateChartData = () => {
  const data = [];
  let value = 1.0;
  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.45) * 0.08;
    value = Math.max(0.5, value + change);
    data.push({ day: `${i + 1}`, tvl: +(value * 1000000).toFixed(0) });
  }
  return data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-md border border-primary/30 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">اليوم {label}</p>
      <p className="text-sm font-bold text-primary">
        TVL: ${(payload[0].value / 1000000).toFixed(2)}M
      </p>
    </div>
  );
};

export const PoolOverviewTab = ({ pool }: { pool: PoolHook }) => {
  const chartData = useMemo(() => generateChartData(), []);
  const ap = pool.activePool;
  if (!ap) return null;

  const stats = [
    { label: 'إجمالي القيمة المقفلة', en: 'TVL', value: `$${(ap.total_value_locked / 1000).toFixed(0)}K`, icon: Lock, trend: '+12.5%' },
    { label: 'حجم التداول 24س', en: '24h Volume', value: `$${(ap.total_volume_24h / 1000).toFixed(0)}K`, icon: Activity, trend: '+5.3%' },
    { label: 'العائد السنوي', en: 'APY', value: `${ap.apy_percentage}%`, icon: TrendingUp, trend: '+2.1%' },
    { label: 'مزودي السيولة', en: 'Providers', value: `${ap.providers_count}`, icon: Waves, trend: '+8' },
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

      {/* User Position Summary */}
      {pool.totalDeposited > 0 && (
        <Card className="bg-primary/5 border-primary/30">
          <CardContent className="p-4">
            <h3 className="font-cairo text-sm font-bold mb-3 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" /> مركزك في المجمع
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-primary">${pool.totalDeposited.toFixed(2)}</p>
                <p className="text-[9px] text-muted-foreground font-cairo">إجمالي الإيداع</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-400">${pool.totalRewards.toFixed(2)}</p>
                <p className="text-[9px] text-muted-foreground font-cairo">الأرباح</p>
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
            <span className="font-cairo">مخطط TVL - {ap.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tvl" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#tvlGrad)" />
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
              <span className="font-cairo">التحويل التلقائي للمجمع</span>
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
