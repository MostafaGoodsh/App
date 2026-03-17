import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Coins, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MiningStats {
  total_mined: number;
  total_miners: number;
  max_supply: number;
  percentage_mined: number;
}

export const TotalMiningDisplay = () => {
  const [stats, setStats] = useState<MiningStats | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.rpc('get_total_mining_stats');
      if (!error && data) {
        setStats(data as unknown as MiningStats);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(4) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K';
    return num.toFixed(4);
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black border border-primary/30">
      <CardContent className="p-5">
        <div className="text-center mb-4">
          <h3 className="text-sm font-medium text-muted-foreground arabic-text mb-1">
            {t("إجمالي التعدين العالمي", "Global Mining Progress")}
          </h3>
        </div>

        <div className="relative mb-4">
          <Progress 
            value={stats?.percentage_mined || 0} 
            className="h-3 bg-gray-800"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white drop-shadow-md">
              {(stats?.percentage_mined || 0).toFixed(6)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary" dir="ltr">
              {formatNumber(stats?.total_mined || 0)}
            </span>
          </div>
          <span className="text-muted-foreground/60 text-xs">{t("من", "of")}</span>
          <span className="font-medium text-muted-foreground" dir="ltr">
            1,000,000,000
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span className="arabic-text">{stats?.total_miners || 0} {t("معدّن نشط", "active miners")}</span>
        </div>

        <div className="mt-3 text-center">
          <span className="text-[10px] text-primary/60 font-playfair" dir="ltr">☥ $MS-RA</span>
        </div>
      </CardContent>
    </Card>
  );
};
