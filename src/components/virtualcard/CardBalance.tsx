import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { VirtualCard } from '@/hooks/useVirtualCard';

interface Props {
  card: VirtualCard;
}

const CardBalance = ({ card }: Props) => {
  const dailyRemaining = Math.max(0, card.daily_limit - card.total_spent);
  const dailyPercent = card.daily_limit > 0 ? (card.total_spent / card.daily_limit) * 100 : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border-[#D4AF37]/30">
        <CardContent className="p-4 text-center">
          <DollarSign className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
          <p className="text-[10px] text-white/60 mb-1">الرصيد | Balance</p>
          <p className="text-xl font-bold text-[#D4AF37]" dir="ltr">${card.balance.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/30">
        <CardContent className="p-4 text-center">
          <TrendingDown className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-[10px] text-white/60 mb-1">الحد اليومي المتبقي</p>
          <p className="text-xl font-bold text-blue-400" dir="ltr">${dailyRemaining.toFixed(0)}</p>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
            <div 
              className="bg-blue-400 h-1.5 rounded-full transition-all" 
              style={{ width: `${Math.min(100, dailyPercent)}%` }} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardBalance;
