import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Users, Banknote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { useLiquidityPool } from '@/hooks/useLiquidityPool';

type PoolHook = ReturnType<typeof useLiquidityPool>;

export const CharityTab = ({ pool }: { pool: PoolHook }) => {
  const { t } = useLanguage();

  if (pool.charityPrograms.length === 0) {
    return (
      <Card className="bg-card/80 border-primary/20">
        <CardContent className="p-8 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-cairo text-sm text-muted-foreground">{t('لا توجد برامج تبرعات حالياً', 'No donation programs currently')}</p>
        </CardContent>
      </Card>
    );
  }

  const totalAllocation = pool.charityPrograms.reduce((s, p) => s + p.allocation_percentage, 0);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-pink-500/10 to-red-500/10 border-pink-500/20">
        <CardContent className="p-4 text-center">
          <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
          <h3 className="font-cairo text-sm font-bold mb-1">{t('برامج المساعدات والتبرعات', 'Aid & Donation Programs')}</h3>
          <p className="text-[10px] text-muted-foreground font-cairo">
            {t(`نسبة ${totalAllocation}% من أرباح المجمع تذهب للأعمال الخيرية`, `${totalAllocation}% of pool profits go to charity`)}
          </p>
        </CardContent>
      </Card>

      {pool.charityPrograms.map(program => (
        <Card key={program.id} className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-cairo flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                {program.name}
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {program.allocation_percentage}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {program.description && (
              <p className="text-xs text-muted-foreground font-cairo">{program.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <Banknote className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <p className="text-sm font-bold">${program.total_distributed.toFixed(0)}</p>
                <p className="text-[9px] text-muted-foreground font-cairo">{t('تم توزيعه', 'Distributed')}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 text-center">
                <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold">{program.beneficiaries_count}</p>
                <p className="text-[9px] text-muted-foreground font-cairo">{t('مستفيد', 'Beneficiary')}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-muted-foreground font-cairo">{t('نسبة التخصيص', 'Allocation')}</span>
                <span className="font-bold">{program.allocation_percentage}%</span>
              </div>
              <Progress value={program.allocation_percentage} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
