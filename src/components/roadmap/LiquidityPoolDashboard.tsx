import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Droplets,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  TrendingDown,
  Waves,
  Zap,
  Lock,
  Unlock,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// Generate mock chart data with entry/exit markers
const generateChartData = () => {
  const data = [];
  let value = 1.0;
  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.45) * 0.08;
    value = Math.max(0.5, value + change);
    const isEntry = [5, 12, 20].includes(i);
    const isExit = [8, 16, 25].includes(i);
    data.push({
      day: `${i + 1}`,
      tvl: +(value * 1000000).toFixed(0),
      price: +value.toFixed(4),
      entry: isEntry ? +(value * 1000000).toFixed(0) : null,
      exit: isExit ? +(value * 1000000).toFixed(0) : null,
    });
  }
  return data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card/95 backdrop-blur-md border border-primary/30 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">اليوم {label}</p>
      <p className="text-sm font-bold text-primary">
        TVL: ${(data.tvl / 1000000).toFixed(2)}M
      </p>
      {data.entry && (
        <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
          <ArrowDownCircle className="w-3 h-3" /> دخول سيولة
        </p>
      )}
      {data.exit && (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
          <ArrowUpCircle className="w-3 h-3" /> خروج سيولة
        </p>
      )}
    </div>
  );
};

// Custom dot for entry/exit markers
const EntryExitDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;

  if (payload.entry) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill="hsl(var(--primary))" opacity={0.3} />
        <circle cx={cx} cy={cy} r={5} fill="hsl(142 76% 36%)" stroke="hsl(142 76% 56%)" strokeWidth={2} />
        <polygon
          points={`${cx},${cy - 3} ${cx - 3},${cy + 2} ${cx + 3},${cy + 2}`}
          fill="white"
          transform={`rotate(180,${cx},${cy})`}
        />
      </g>
    );
  }
  if (payload.exit) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill="hsl(0 84% 60%)" opacity={0.3} />
        <circle cx={cx} cy={cy} r={5} fill="hsl(0 84% 50%)" stroke="hsl(0 84% 60%)" strokeWidth={2} />
        <polygon
          points={`${cx},${cy - 3} ${cx - 3},${cy + 2} ${cx + 3},${cy + 2}`}
          fill="white"
        />
      </g>
    );
  }
  return null;
};

interface LiquidityPoolDashboardProps {
  title?: string;
  description?: string;
}

export const LiquidityPoolDashboard = ({ title, description }: LiquidityPoolDashboardProps) => {
  const chartData = useMemo(() => generateChartData(), []);
  const [activeAction, setActiveAction] = useState<'add' | 'remove' | null>(null);

  const stats = [
    { label: 'إجمالي القيمة المقفلة', labelEn: 'TVL', value: '$1.2M', icon: Lock, trend: '+12.5%', up: true },
    { label: 'حجم التداول 24س', labelEn: '24h Volume', value: '$89K', icon: Activity, trend: '+5.3%', up: true },
    { label: 'العائد السنوي', labelEn: 'APY', value: '18.7%', icon: TrendingUp, trend: '+2.1%', up: true },
    { label: 'مزودي السيولة', labelEn: 'Providers', value: '142', icon: Waves, trend: '+8', up: true },
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className={`text-xs font-bold flex items-center gap-1 ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.trend}
                  </span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-cairo" dir="rtl">{stat.label}</p>
                <p className="text-[9px] text-muted-foreground/60" dir="ltr">{stat.labelEn}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart Section */}
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="font-cairo" dir="rtl">{title || 'مخطط مجمع السيولة'}</span>
            </CardTitle>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                <span className="text-muted-foreground">دخول</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                <span className="text-muted-foreground">خروج</span>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="h-[280px] sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="tvl"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#tvlGradient)"
                  dot={<EntryExitDot />}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--background))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Button
          size="lg"
          onClick={() => setActiveAction(activeAction === 'add' ? null : 'add')}
          className={`h-auto py-4 flex flex-col items-center gap-2 transition-all ${
            activeAction === 'add'
              ? 'bg-green-600 hover:bg-green-700 ring-2 ring-green-400/50 shadow-lg shadow-green-500/20'
              : 'bg-green-600/80 hover:bg-green-600'
          }`}
        >
          <ArrowDownCircle className="w-7 h-7" />
          <div className="text-center">
            <p className="text-sm font-bold font-cairo">إضافة سيولة</p>
            <p className="text-[10px] opacity-80">Add Liquidity</p>
          </div>
        </Button>

        <Button
          size="lg"
          onClick={() => setActiveAction(activeAction === 'remove' ? null : 'remove')}
          variant="destructive"
          className={`h-auto py-4 flex flex-col items-center gap-2 transition-all ${
            activeAction === 'remove'
              ? 'ring-2 ring-red-400/50 shadow-lg shadow-red-500/20'
              : ''
          }`}
        >
          <ArrowUpCircle className="w-7 h-7" />
          <div className="text-center">
            <p className="text-sm font-bold font-cairo">سحب سيولة</p>
            <p className="text-[10px] opacity-80">Remove Liquidity</p>
          </div>
        </Button>
      </div>

      {/* Info Cards Below Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-bold text-sm font-cairo mb-1" dir="rtl">عوائد فورية</h4>
            <p className="text-[10px] text-muted-foreground/80 mb-1">Instant Rewards</p>
            <p className="text-xs text-muted-foreground font-cairo" dir="rtl">
              احصل على عوائد مستمرة من رسوم التداول
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardContent className="p-4 text-center">
            <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-bold text-sm font-cairo mb-1" dir="rtl">سيولة مؤمنة</h4>
            <p className="text-[10px] text-muted-foreground/80 mb-1">Secured Liquidity</p>
            <p className="text-xs text-muted-foreground font-cairo" dir="rtl">
              أصولك محمية بعقود ذكية مدققة
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardContent className="p-4 text-center">
            <Unlock className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-bold text-sm font-cairo mb-1" dir="rtl">سحب مرن</h4>
            <p className="text-[10px] text-muted-foreground/80 mb-1">Flexible Withdrawal</p>
            <p className="text-xs text-muted-foreground font-cairo" dir="rtl">
              اسحب سيولتك في أي وقت بدون قيود
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pool Pairs */}
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            <span className="font-cairo" dir="rtl">أزواج السيولة المتاحة</span>
            <Badge variant="secondary" className="text-[10px]">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { pair: 'MSRA / USDC', tvl: '$520K', apy: '22.4%', volume: '$34K' },
            { pair: 'MSRA / SOL', tvl: '$380K', apy: '18.1%', volume: '$28K' },
            { pair: 'XP / MSRA', tvl: '$310K', apy: '15.6%', volume: '$19K' },
          ].map((pool, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold" dir="ltr">{pool.pair}</p>
                  <p className="text-[10px] text-muted-foreground">TVL: {pool.tvl}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-400">{pool.apy} APY</p>
                <p className="text-[10px] text-muted-foreground">Vol: {pool.volume}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
