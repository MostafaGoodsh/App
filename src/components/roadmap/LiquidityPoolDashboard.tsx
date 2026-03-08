import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLiquidityPool } from '@/hooks/useLiquidityPool';
import { PoolOverviewTab } from './liquidity/PoolOverviewTab';
import { AddLiquidityTab } from './liquidity/AddLiquidityTab';
import { RemoveLiquidityTab } from './liquidity/RemoveLiquidityTab';
import { StakingTab } from './liquidity/StakingTab';
import { CharityTab } from './liquidity/CharityTab';
import { TransactionsTab } from './liquidity/TransactionsTab';
import { PoolSelector } from './liquidity/PoolSelector';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3, ArrowDownCircle, ArrowUpCircle, Lock, Heart, History,
} from 'lucide-react';

interface LiquidityPoolDashboardProps {
  title?: string;
  description?: string;
}

export const LiquidityPoolDashboard = ({ title, description }: LiquidityPoolDashboardProps) => {
  const pool = useLiquidityPool();
  const [activeTab, setActiveTab] = useState('overview');

  if (pool.loading) {
    return (
      <div className="space-y-4 mb-8">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Pool Selector */}
      {pool.pools.length > 1 && (
        <PoolSelector pools={pool.pools} activePool={pool.activePool} onSelect={pool.setActivePool} />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {[
            { value: 'overview', label: 'نظرة عامة', icon: BarChart3 },
            { value: 'add', label: 'إضافة', icon: ArrowDownCircle },
            { value: 'remove', label: 'سحب', icon: ArrowUpCircle },
            { value: 'staking', label: 'Staking', icon: Lock },
            { value: 'charity', label: 'تبرعات', icon: Heart },
            { value: 'history', label: 'السجل', icon: History },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 min-w-[70px] text-[10px] sm:text-xs gap-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-cairo">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview">
          <PoolOverviewTab pool={pool} />
        </TabsContent>
        <TabsContent value="add">
          <AddLiquidityTab pool={pool} />
        </TabsContent>
        <TabsContent value="remove">
          <RemoveLiquidityTab pool={pool} />
        </TabsContent>
        <TabsContent value="staking">
          <StakingTab pool={pool} />
        </TabsContent>
        <TabsContent value="charity">
          <CharityTab pool={pool} />
        </TabsContent>
        <TabsContent value="history">
          <TransactionsTab pool={pool} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
