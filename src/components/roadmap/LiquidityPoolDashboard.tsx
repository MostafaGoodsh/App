import { useState } from 'react';
import { useLiquidityPool } from '@/hooks/useLiquidityPool';
import { PoolOverviewTab } from './liquidity/PoolOverviewTab';
import { AddLiquidityTab } from './liquidity/AddLiquidityTab';
import { RemoveLiquidityTab } from './liquidity/RemoveLiquidityTab';
import { StakingTab } from './liquidity/StakingTab';
import { CharityTab } from './liquidity/CharityTab';
import { TransactionsTab } from './liquidity/TransactionsTab';
import { PoolSelector } from './liquidity/PoolSelector';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowDownCircle, ArrowUpCircle, Lock, Heart, History,
  Plus, Minus, Zap, BarChart3,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LiquidityPoolDashboardProps {
  title?: string;
  description?: string;
}

type ActiveView = 'overview' | 'add' | 'remove' | 'staking' | 'charity' | 'history';

export const LiquidityPoolDashboard = ({ title, description }: LiquidityPoolDashboardProps) => {
  const pool = useLiquidityPool();
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const { t } = useLanguage();

  if (pool.loading) {
    return (
      <div className="space-y-4 mb-8">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const inputActions = [
    { key: 'add' as ActiveView, label: t('إضافة سيولة', 'Add Liquidity'), icon: Plus, desc: t('إيداع في المجمع', 'Deposit to Pool') },
    { key: 'staking' as ActiveView, label: 'Staking', icon: Lock, desc: t('قفل وكسب عائد', 'Lock & Earn Yield') },
  ];

  const outputActions = [
    { key: 'remove' as ActiveView, label: t('سحب سيولة', 'Remove Liquidity'), icon: Minus, desc: t('سحب من المجمع', 'Withdraw from Pool') },
    { key: 'charity' as ActiveView, label: t('تبرعات', 'Donations'), icon: Heart, desc: t('برامج المساعدات', 'Aid Programs') },
  ];

  if (activeView !== 'overview') {
    const viewTitles: Record<ActiveView, string> = {
      overview: '',
      add: t('إضافة سيولة', 'Add Liquidity'),
      remove: t('سحب سيولة', 'Remove Liquidity'),
      staking: 'Staking',
      charity: t('تبرعات ومساعدات', 'Donations & Aid'),
      history: t('سجل العمليات', 'Transaction History'),
    };

    return (
      <div className="space-y-4 mb-8 w-full max-w-[100vw] overflow-x-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveView('overview')}
          className="font-cairo gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          ← {t('العودة للنظرة العامة', 'Back to Overview')}
        </Button>
        <h2 className="font-cairo text-lg font-bold">{viewTitles[activeView]}</h2>
        {activeView === 'add' && <AddLiquidityTab pool={pool} />}
        {activeView === 'remove' && <RemoveLiquidityTab pool={pool} />}
        {activeView === 'staking' && <StakingTab pool={pool} />}
        {activeView === 'charity' && <CharityTab pool={pool} />}
        {activeView === 'history' && <TransactionsTab pool={pool} />}
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8 w-full max-w-[100vw] overflow-x-hidden">
      {pool.pools.length > 1 && (
        <PoolSelector pools={pool.pools} activePool={pool.activePool} onSelect={pool.setActivePool} />
      )}

      <PoolOverviewTab pool={pool} />

      {/* المدخلات - Inputs */}
      <Card className="bg-card/80 backdrop-blur-sm border-green-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 font-cairo">
            <ArrowDownCircle className="w-4 h-4 text-green-400" />
            {t('المدخلات', 'Inputs')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {inputActions.map(action => {
            const Icon = action.icon;
            return (
              <Button
                key={action.key}
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1 border-green-500/20 hover:bg-green-500/10 hover:border-green-500/40"
                onClick={() => setActiveView(action.key)}
              >
                <Icon className="w-5 h-5 text-green-400" />
                <span className="font-cairo text-xs font-bold">{action.label}</span>
                <span className="text-[9px] text-muted-foreground">{action.desc}</span>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* المخرجات - Outputs */}
      <Card className="bg-card/80 backdrop-blur-sm border-red-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 font-cairo">
            <ArrowUpCircle className="w-4 h-4 text-red-400" />
            {t('المخرجات', 'Outputs')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {outputActions.map(action => {
            const Icon = action.icon;
            return (
              <Button
                key={action.key}
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40"
                onClick={() => setActiveView(action.key)}
              >
                <Icon className="w-5 h-5 text-red-400" />
                <span className="font-cairo text-xs font-bold">{action.label}</span>
                <span className="text-[9px] text-muted-foreground">{action.desc}</span>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full gap-2 font-cairo border-primary/20 hover:bg-primary/10"
        onClick={() => setActiveView('history')}
      >
        <History className="w-4 h-4" />
        {t('سجل العمليات', 'Transaction History')}
      </Button>
    </div>
  );
};
