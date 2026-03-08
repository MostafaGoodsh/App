import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets } from 'lucide-react';
import type { LiquidityPool } from '@/hooks/useLiquidityPool';

interface PoolSelectorProps {
  pools: LiquidityPool[];
  activePool: LiquidityPool | null;
  onSelect: (pool: LiquidityPool) => void;
}

export const PoolSelector = ({ pools, activePool, onSelect }: PoolSelectorProps) => {
  const typeLabels: Record<string, string> = {
    general: 'عام',
    stablecoin: 'عملة مستقرة',
    token_pair: 'زوج تداول',
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {pools.map(pool => (
        <Card
          key={pool.id}
          onClick={() => onSelect(pool)}
          className={`cursor-pointer min-w-[160px] transition-all ${
            activePool?.id === pool.id
              ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
              : 'border-border/50 bg-card/60 hover:border-primary/30'
          }`}
        >
          <CardContent className="p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold font-cairo truncate">{pool.name}</p>
              <Badge variant="secondary" className="text-[9px] px-1 py-0">
                {typeLabels[pool.pool_type] || pool.pool_type}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
